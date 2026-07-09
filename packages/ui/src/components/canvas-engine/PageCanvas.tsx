/**
 * Canvas Engine - PageCanvas Component
 *
 * Renders a single page's worth of items on its own <canvas> element.
 * Each page has an independent canvas, solving the "huge single canvas" problem.
 */

import React, { useRef, useEffect, useCallback, memo } from 'react'
import type { CanvasItem, BaseRenderOptions } from './types'
import type { CanvasEngine } from './CanvasEngine'

export interface PageCanvasProps<T extends CanvasItem = CanvasItem> {
    /** 0-indexed page number */
    pageIndex: number
    /** Items belonging to this page */
    items: T[]
    /** Shared CanvasEngine instance */
    engine: CanvasEngine<T>
    /** Width in CSS pixels */
    width: number
    /** Height in CSS pixels (page height in pixels, no gap) */
    height: number
    /** Device pixel ratio */
    dpr: number
    /** Callback to compute render options for each item */
    optionsFn?: (item: T) => BaseRenderOptions
    /** The render version — changes trigger re-render */
    renderVersion?: number
    /**
     * Page-level mouse move handler.
     * Receives global pixel coordinates (with pageOffsetY applied).
     */
    onPageMouseMove?: (pixelX: number, pixelY: number, pageIndex: number) => void
    /**
     * Page-level click handler.
     * Receives global pixel coordinates (with pageOffsetY applied).
     */
    onPageClick?: (pixelX: number, pixelY: number, pageIndex: number) => void
    /**
     * Page-level double click handler.
     * Receives global pixel coordinates (with pageOffsetY applied).
     */
    onPageDoubleClick?: (pixelX: number, pixelY: number, pageIndex: number) => void
    /** CSS cursor */
    cursor?: string
    /** Debug mode */
    debug?: boolean
    /** Page background color (default: '#ffffff') */
    backgroundColor?: string
}

function PageCanvasInner<T extends CanvasItem = CanvasItem>(
    props: PageCanvasProps<T>,
): React.ReactElement | null {
    const {
        pageIndex,
        items,
        engine,
        width,
        height,
        dpr,
        optionsFn,
        renderVersion,
        onPageMouseMove,
        onPageClick,
        onPageDoubleClick,
        cursor = 'default',
        debug,
        backgroundColor = '#ffffff',
    } = props

    const canvasRef = useRef<HTMLCanvasElement>(null)

    /**
     * Render this page's items onto its own canvas.
     */
    const renderPage = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas || width <= 0 || height <= 0) return

        // Size the canvas
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Apply DPR scaling
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        // Clear
        ctx.clearRect(0, 0, width, height)

        // Page background (unified color)
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)

        // Page border
        ctx.strokeStyle = debug ? '#ff0000' : '#d1d5db'
        ctx.lineWidth = debug ? 5 : 1
        ctx.strokeRect(0, 0, width, height)

        if (debug) {
            ctx.fillStyle = '#ff0000'
            ctx.font = 'bold 24px monospace'
            ctx.textAlign = 'left'
            ctx.fillText(`PAGE ${pageIndex + 1}`, 20, 30)
        }

        // Render items — bboxToPixelRect adds pageOffsetY, so translate to page-local
        const pageOffsetY = engine.coords.pageOffsetY(pageIndex)
        ctx.save()
        ctx.translate(0, -pageOffsetY)

        for (const item of items) {
            const options = optionsFn ? optionsFn(item) : {}
            engine.renderItem(ctx, item, options)
        }

        ctx.restore()
    }, [pageIndex, items, engine, width, height, dpr, optionsFn, debug, backgroundColor])

    // Re-render when dependencies change
    useEffect(() => {
        renderPage()
    }, [renderPage, renderVersion])

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!onPageMouseMove) return
            const rect = e.currentTarget.getBoundingClientRect()
            const localX = e.clientX - rect.left
            const localY = e.clientY - rect.top
            const globalY = localY + engine.coords.pageOffsetY(pageIndex)
            onPageMouseMove(localX, globalY, pageIndex)
        },
        [onPageMouseMove, engine, pageIndex],
    )

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!onPageClick) return
            const rect = e.currentTarget.getBoundingClientRect()
            const localX = e.clientX - rect.left
            const localY = e.clientY - rect.top
            const globalY = localY + engine.coords.pageOffsetY(pageIndex)
            onPageClick(localX, globalY, pageIndex)
        },
        [onPageClick, engine, pageIndex],
    )

    const handleDoubleClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!onPageDoubleClick) return
            const rect = e.currentTarget.getBoundingClientRect()
            const localX = e.clientX - rect.left
            const localY = e.clientY - rect.top
            const globalY = localY + engine.coords.pageOffsetY(pageIndex)
            onPageDoubleClick(localX, globalY, pageIndex)
        },
        [onPageDoubleClick, engine, pageIndex],
    )

    if (width <= 0 || height <= 0) return null

    return (
        <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            style={{ cursor, display: 'block' }}
            data-page={pageIndex}
        />
    )
}

export const PageCanvas = memo(PageCanvasInner) as typeof PageCanvasInner
