/**
 * Canvas Engine - VirtualPageList Component
 *
 * Uses @tanstack/react-virtual to only mount PageCanvas instances for
 * pages that are visible in the scroll viewport.
 * This is the core solution to the "huge single canvas" performance problem.
 */

import React, { useRef, useMemo, memo, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { CanvasItem, BaseRenderOptions } from './types'
import type { CanvasEngine } from './CanvasEngine'
import { PageCanvas } from './PageCanvas'

export interface VirtualPageListProps<T extends CanvasItem = CanvasItem> {
    /** Total number of pages */
    totalPages: number
    /** All items (will be grouped by page internally) */
    items: T[]
    /** Shared CanvasEngine instance */
    engine: CanvasEngine<T>
    /** Container width in CSS pixels */
    width: number
    /** Device pixel ratio */
    dpr: number
    /** Callback to compute render options for each item */
    optionsFn?: (item: T) => BaseRenderOptions
    /** Render version — increment to force re-render */
    renderVersion?: number
    /** Mouse move handler (receives page-adjusted coordinates) */
    onPageMouseMove?: (pixelX: number, pixelY: number, pageIndex: number) => void
    /** Click handler (receives page-adjusted coordinates) */
    onPageClick?: (pixelX: number, pixelY: number, pageIndex: number) => void
    /** Double click handler (receives page-adjusted coordinates) */
    onPageDoubleClick?: (pixelX: number, pixelY: number, pageIndex: number) => void
    /** CSS cursor */
    cursor?: string
    /** Debug mode */
    debug?: boolean
    /** CSS class for the scroll container */
    className?: string
    /** CSS style for the scroll container */
    style?: React.CSSProperties
    /** Over-scan: number of pages to render outside viewport */
    overscan?: number
    /** Ref to the scrollable container (exposed for external scroll control) */
    scrollRef?: React.Ref<HTMLDivElement>
    /** Children rendered inside the scroll container (e.g. edit overlay, loading) */
    children?: React.ReactNode
    /** Page background color passed to each PageCanvas (default: '#ffffff') */
    pageBackgroundColor?: string
    /**
     * Called when the set of visible page indices changes (including overscan).
     * Useful for viewport-based lazy loading of page resources (e.g. images).
     */
    onVisiblePagesChange?: (visiblePages: number[]) => void
}

function VirtualPageListInner<T extends CanvasItem = CanvasItem>(
    props: VirtualPageListProps<T>,
): React.ReactElement {
    const {
        totalPages,
        items,
        engine,
        width,
        dpr,
        optionsFn,
        renderVersion,
        onPageMouseMove,
        onPageClick,
        onPageDoubleClick,
        cursor = 'default',
        debug,
        className,
        style,
        overscan = 2,
        scrollRef,
        children,
        pageBackgroundColor,
        onVisiblePagesChange,
    } = props

    const parentRef = useRef<HTMLDivElement>(null)

    // Expose scrollRef
    useEffect(() => {
        if (!scrollRef) return
        if (typeof scrollRef === 'function') {
            scrollRef(parentRef.current)
        } else if (scrollRef && 'current' in scrollRef) {
            ; (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = parentRef.current
        }
    }, [scrollRef])

    // Group items by page
    const itemsByPage = useMemo(() => {
        const map = new Map<number, T[]>()
        for (const item of items) {
            const page = item.page ?? 0
            let list = map.get(page)
            if (!list) {
                list = []
                map.set(page, list)
            }
            list.push(item)
        }
        return map
    }, [items])

    // Page height in CSS pixels
    const pageHeightPx = engine.coords.pageHeightPx
    const pageGap = engine.coords.pageGap

    // Virtual list
    const virtualizer = useVirtualizer({
        count: totalPages,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            // Last page has no trailing gap
            return pageHeightPx + (index < totalPages - 1 ? pageGap : 0)
        },
        overscan,
    })

    // If scale/page sizes change, re-measure to avoid stale cached sizes
    // (prevents wrapper offsets drifting vs actual PageCanvas size)
    useEffect(() => {
        virtualizer.measure()
    }, [virtualizer, pageHeightPx, pageGap, totalPages])

    const virtualItems = virtualizer.getVirtualItems()

    // Notify parent when visible pages change
    const prevVisiblePagesRef = useRef<string>('')
    const onVisiblePagesChangeRef = useRef(onVisiblePagesChange)
    onVisiblePagesChangeRef.current = onVisiblePagesChange

    useEffect(() => {
        if (!onVisiblePagesChangeRef.current) return
        const pages = virtualItems.map((vi) => vi.index)
        const key = pages.join(',')
        if (key !== prevVisiblePagesRef.current) {
            prevVisiblePagesRef.current = key
            onVisiblePagesChangeRef.current(pages)
        }
    }, [virtualItems])

    return (
        <div
            ref={parentRef}
            data-range-preview-scroll="true"
            data-page-size={pageHeightPx}
            data-page-gap={pageGap}
            data-total-pages={totalPages}
            className={className}
            style={{
                overflow: 'auto',
                position: 'relative',
                ...style,
            }}
        >
            {/* Virtual list spacer */}
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualItems.map((virtualRow) => {
                    const pageIndex = virtualRow.index
                    const pageItems = itemsByPage.get(pageIndex) ?? []

                    return (
                        <div
                            key={virtualRow.key}
                            data-page-wrapper={pageIndex + 1}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <PageCanvas<T>
                                pageIndex={pageIndex}
                                items={pageItems}
                                engine={engine}
                                width={width}
                                height={pageHeightPx}
                                dpr={dpr}
                                optionsFn={optionsFn}
                                renderVersion={renderVersion}
                                onPageMouseMove={onPageMouseMove}
                                onPageClick={onPageClick}
                                onPageDoubleClick={onPageDoubleClick}
                                cursor={cursor}
                                debug={debug}
                                backgroundColor={pageBackgroundColor}
                            />
                        </div>
                    )
                })}
            </div>

            {/* Additional children (edit overlay, loading indicator, etc.) */}
            {children}
        </div>
    )
}

export const VirtualPageList = memo(VirtualPageListInner) as typeof VirtualPageListInner
