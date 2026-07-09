import { useRef, useState, useEffect, useCallback, type MutableRefObject } from 'react'
import type { ParseBlock } from '../types'
import type { TableLayoutManager, TableLayoutCache } from '../core'
import type { RegisteredRenderers } from '../renderers/registerAll'

interface UseTableLoadingOptions {
    canvasBlocks: ParseBlock[]
    zoom: number
    debug: boolean
    editModeRef: MutableRefObject<boolean>
    contentOverridesRef: MutableRefObject<Map<string, string>>
    attrsOverridesRef: MutableRefObject<Map<string, Record<string, unknown>>>
    tableManagerRef: MutableRefObject<TableLayoutManager | null>
    renderersRef: MutableRefObject<RegisteredRenderers | null>
    isHtmlTableBlock: (block: ParseBlock) => boolean
    isEffectiveTable: (block: ParseBlock) => boolean
    onRenderVersionBump: () => void
}

/**
 * Manages async table layout loading and cache refresh.
 * Extracts the table loading effect from RangePreviewRenderer.
 */
export function useTableLoading({
    canvasBlocks,
    zoom,
    debug,
    editModeRef,
    contentOverridesRef,
    attrsOverridesRef,
    tableManagerRef,
    renderersRef,
    isHtmlTableBlock,
    isEffectiveTable,
    onRenderVersionBump,
}: UseTableLoadingOptions) {
    const tableVersionRef = useRef(0)
    const [tableReloadVersion, setTableReloadVersion] = useState(0)

    useEffect(() => {
        if (!tableManagerRef.current || !renderersRef.current) return

        // Exclude HTML table blocks (those with attrs.html) – they are shown as DOM overlays
        const tableBlocks = canvasBlocks.filter((b) => isEffectiveTable(b) && !isHtmlTableBlock(b))
        const htmlOnlyBlocks = canvasBlocks.filter(isHtmlTableBlock)

        // If there are only HTML table blocks (no regular canvas tables), still register
        // skip entries so TableBlockRenderer doesn't draw a placeholder for them.
        if (tableBlocks.length === 0 && htmlOnlyBlocks.length > 0) {
            const dataMap = new Map<string, TableLayoutCache>()
            for (const block of htmlOnlyBlocks) {
                dataMap.set(block.id, {
                    blockId: block.id,
                    htmlWidth: 0, htmlHeight: 0,
                    bboxWidth: 0, bboxHeight: 0,
                    scaleX: 1, scaleY: 1,
                    cellLayouts: [], rows: 0, cols: 0,
                    cacheTime: Date.now(),
                    imageData: new ImageData(1, 1),
                    skipCanvas: true,
                })
            }
            renderersRef.current.table.setTableDataMap(dataMap)
            onRenderVersionBump()
            return
        }

        if (tableBlocks.length === 0) return

        const currentTableVersion = ++tableVersionRef.current
        const tableManager = tableManagerRef.current
        const tableRenderer = renderersRef.current.table

        // Apply content and attrs overrides so edited tables use the latest content
        const tableBlocksWithOverrides = tableBlocks.map((block) => {
            const contentOverride = contentOverridesRef.current.get(block.id)
            const attrsOverride = attrsOverridesRef.current.get(block.id)
            if (contentOverride != null || attrsOverride != null) {
                return {
                    ...block,
                    ...(contentOverride != null ? { content: contentOverride } : {}),
                    ...(attrsOverride != null ? { attrs: { ...block.attrs, ...attrsOverride } } : {}),
                }
            }
            return block
        })

        Promise.all(
            tableBlocksWithOverrides.map(async (block) => {
                if (!block.bbox) return null
                const bboxWidth = (block.bbox[2] - block.bbox[0]) * zoom
                const bboxHeight = (block.bbox[3] - block.bbox[1]) * zoom
                try {
                    const cache = await tableManager.getOrCreateTableCache(
                        block,
                        bboxWidth,
                        bboxHeight,
                        editModeRef.current,
                    )
                    return { blockId: block.id, cache }
                } catch (error) {
                    void error
                    return null
                }
            }),
        ).then((results) => {
            if (currentTableVersion !== tableVersionRef.current) return
            const dataMap = new Map<string, TableLayoutCache>()
            for (const result of results) {
                if (!result) continue
                dataMap.set(result.blockId, result.cache)
            }
            // HTML table blocks are rendered as DOM overlays.
            const htmlBlocks = canvasBlocks.filter(isHtmlTableBlock)
            for (const block of htmlBlocks) {
                dataMap.set(block.id, {
                    blockId: block.id,
                    htmlWidth: 0, htmlHeight: 0,
                    bboxWidth: 0, bboxHeight: 0,
                    scaleX: 1, scaleY: 1,
                    cellLayouts: [], rows: 0, cols: 0,
                    cacheTime: Date.now(),
                    imageData: new ImageData(1, 1),
                    skipCanvas: true,
                })
            }
            tableRenderer.setTableDataMap(dataMap)
            onRenderVersionBump()
        }).catch((error) => {
            if (debug) console.error('[RangePreview] Table loading failed:', error)
        })
        // tableReloadVersion triggers re-loading after table content is edited
    }, [canvasBlocks, zoom, debug, tableReloadVersion, tableManagerRef, renderersRef, editModeRef, contentOverridesRef, attrsOverridesRef, isHtmlTableBlock, isEffectiveTable, onRenderVersionBump])

    const triggerTableReload = useCallback(() => setTableReloadVersion((v) => v + 1), [])

    return {
        tableReloadVersion,
        triggerTableReload,
    }
}
