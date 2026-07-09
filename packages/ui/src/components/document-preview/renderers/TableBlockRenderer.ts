/**
 * Table Block Renderer
 *
 * Renders table blocks using pre-computed ImageData from TableLayoutManager.
 * The table data map must be set externally before rendering.
 */

import type { PixelRect, BaseRenderOptions } from '../../canvas-engine'
import type { ParseBlock } from '../types'
import type { TableLayoutCache } from '../core'
import { type RangeRenderOptions, withClip, renderDiffBackground } from './rendererTypes'

/**
 * Table block renderer that uses pre-rendered ImageData.
 * Requires that `setTableDataMap` be called with the current table cache before rendering.
 */
export class TableBlockRenderer {
    readonly type = 'table'

    private tableDataMap: Map<string, TableLayoutCache> = new Map()

    /** Cached offscreen canvas to avoid GC pressure (H1 fix) */
    private offscreenCanvas: HTMLCanvasElement | null = null
    private offscreenCtx: CanvasRenderingContext2D | null = null

    /**
     * Set the table data map (from TableLayoutManager cache).
     */
    setTableDataMap(map: Map<string, TableLayoutCache>): void {
        this.tableDataMap = map
    }

    render(
        ctx: CanvasRenderingContext2D,
        item: ParseBlock,
        rect: PixelRect,
        _options: BaseRenderOptions,
    ): void {
        const opts = _options as RangeRenderOptions

        const tableData = this.tableDataMap.get(item.id)
        if (!tableData || !tableData.imageData) {
            // Placeholder
            this.renderPlaceholder(ctx, rect, 'Table')
            return
        }

        // HTML table blocks rendered as DOM overlays signal us to skip canvas rendering
        if (tableData.skipCanvas) return

        // Reuse cached offscreen canvas (avoids GC pressure)
        if (!this.offscreenCanvas) {
            this.offscreenCanvas = document.createElement('canvas')
            this.offscreenCtx = this.offscreenCanvas.getContext('2d')
        }
        const tempCanvas = this.offscreenCanvas
        const tempCtx = this.offscreenCtx
        if (!tempCtx) return

        // Only resize when dimensions change
        if (tempCanvas.width !== tableData.imageData.width || tempCanvas.height !== tableData.imageData.height) {
            tempCanvas.width = tableData.imageData.width
            tempCanvas.height = tableData.imageData.height
        } else {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
        }
        tempCtx.putImageData(tableData.imageData, 0, 0)

        // Always fill bbox width; height uses pre-computed proportional value
        const drawWidth = rect.width
        const drawHeight = tableData.renderHeight ?? rect.height

        withClip(ctx, rect, () => {
            ctx.drawImage(tempCanvas, rect.x, rect.y, drawWidth, drawHeight)
        })

        // Draw diff background on top of table content so it's visible
        renderDiffBackground(ctx, rect, opts.diffState)
    }

    private renderPlaceholder(ctx: CanvasRenderingContext2D, rect: PixelRect, label: string): void {
        withClip(ctx, rect, () => {
            ctx.strokeStyle = '#e0e0e0'
            ctx.lineWidth = 1
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

            ctx.fillStyle = '#888888'
            ctx.font = '12px system-ui, -apple-system, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2)
        })
    }
}
