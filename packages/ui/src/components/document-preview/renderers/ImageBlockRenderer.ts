/**
 * Image Block Renderer
 *
 * Renders image blocks on canvas using pre-loaded HTMLImageElement instances.
 * The image map must be set externally via `setImageMap()` before rendering
 * (same pattern as TableBlockRenderer.setTableDataMap()).
 *
 * When an image is not yet loaded, renders a placeholder with a loading indicator.
 */

import type { PixelRect, BaseRenderOptions } from '../../canvas-engine'
import type { ParseBlock } from '../types'
import { getImageAssetKey } from '../types'
import { type RangeRenderOptions, withClip, renderDiffBackground } from './rendererTypes'

export class ImageBlockRenderer {
    readonly type = 'image'

    /** Pre-loaded images keyed by asset_key */
    private imageMap: Map<string, HTMLImageElement> = new Map()

    /**
     * Set the image map (from ImageLoadManager cache).
     * Called by RangePreviewRenderer whenever new images become available.
     */
    setImageMap(map: Map<string, HTMLImageElement>): void {
        this.imageMap = map
    }

    render(
        ctx: CanvasRenderingContext2D,
        item: ParseBlock,
        rect: PixelRect,
        _options: BaseRenderOptions,
    ): void {
        const opts = _options as RangeRenderOptions

        // Resolve asset key: attrs.asset_key is the primary lookup key,
        // attrs.format is used by some RAG parsers as asset reference.
        const assetKey = getImageAssetKey(item)
        const img = assetKey ? this.imageMap.get(assetKey) : undefined

        if (img) {
            // Guard: degenerate images with 0 dimensions → show placeholder
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                this.renderPlaceholder(ctx, rect)
            } else {
                this.renderImage(ctx, img, rect)
            }
        } else {
            this.renderPlaceholder(ctx, rect)
        }

        // Diff background overlay on top
        renderDiffBackground(ctx, rect, opts.diffState)
    }

    /**
     * Draw image with aspect-ratio-correct "contain" fitting inside the bbox.
     */
    private renderImage(
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement,
        rect: PixelRect,
    ): void {
        withClip(ctx, rect, () => {
            const imgAspect = img.naturalWidth / img.naturalHeight
            const rectAspect = rect.width / rect.height

            let drawWidth: number
            let drawHeight: number
            let drawX: number
            let drawY: number

            if (imgAspect > rectAspect) {
                // Image is wider than bbox → fit to width
                drawWidth = rect.width
                drawHeight = rect.width / imgAspect
                drawX = rect.x
                drawY = rect.y + (rect.height - drawHeight) / 2
            } else {
                // Image is taller than bbox → fit to height
                drawHeight = rect.height
                drawWidth = rect.height * imgAspect
                drawX = rect.x + (rect.width - drawWidth) / 2
                drawY = rect.y
            }

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        })
    }

    /**
     * Placeholder for images that are loading or failed to load.
     */
    private renderPlaceholder(
        ctx: CanvasRenderingContext2D,
        rect: PixelRect,
    ): void {
        withClip(ctx, rect, () => {
            // Light gray background
            ctx.fillStyle = '#f5f5f5'
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height)

            // Border
            ctx.strokeStyle = '#e0e0e0'
            ctx.lineWidth = 1
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

            // Icon-like placeholder (simple image icon)
            const cx = rect.x + rect.width / 2
            const cy = rect.y + rect.height / 2
            const iconSize = Math.min(24, rect.width * 0.15, rect.height * 0.3)

            ctx.strokeStyle = '#bbb'
            ctx.lineWidth = 1.5

            // Mountain/landscape icon
            const left = cx - iconSize
            const right = cx + iconSize
            const top = cy - iconSize * 0.7
            const bottom = cy + iconSize * 0.5

            // Frame
            ctx.strokeRect(left, top, right - left, bottom - top)

            // Mountain shape
            ctx.beginPath()
            ctx.moveTo(left, bottom)
            ctx.lineTo(left + iconSize * 0.6, top + iconSize * 0.4)
            ctx.lineTo(left + iconSize * 1.0, cy)
            ctx.lineTo(left + iconSize * 1.3, top + iconSize * 0.6)
            ctx.lineTo(right, bottom)
            ctx.stroke()

            // Sun circle
            ctx.beginPath()
            ctx.arc(right - iconSize * 0.5, top + iconSize * 0.4, iconSize * 0.2, 0, Math.PI * 2)
            ctx.stroke()
        })
    }
}
