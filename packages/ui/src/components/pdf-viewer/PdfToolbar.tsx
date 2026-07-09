'use client'

import React, { useCallback } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Search,
    PanelLeftOpen,
    PanelLeftClose,
    X,
} from 'lucide-react'
import type { PdfViewerFeatures } from './types'
import { MIN_SCALE, MAX_SCALE } from './types'

interface PdfToolbarProps {
    currentPage: number
    numPages: number
    scale: number
    features: Required<PdfViewerFeatures>
    thumbnailsOpen: boolean
    onPrevPage: () => void
    onNextPage: () => void
    onGoToPage: (page: number) => void
    onZoomIn: () => void
    onZoomOut: () => void
    onResetZoom: () => void
    onToggleSearch: () => void
    onToggleThumbnails: () => void
    onClose?: () => void
}

export function PdfToolbar({
    currentPage,
    numPages,
    scale,
    features,
    thumbnailsOpen,
    onPrevPage,
    onNextPage,
    onGoToPage,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onToggleSearch,
    onToggleThumbnails,
    onClose,
}: PdfToolbarProps) {
    const toolButtonClass = 'p-1.5 rounded text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
    const handlePageInput = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                const value = parseInt((e.target as HTMLInputElement).value, 10)
                if (!isNaN(value)) {
                    onGoToPage(value)
                }
            }
        },
        [onGoToPage]
    )

    const handlePageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value, 10)
            if (!isNaN(value) && value >= 1 && value <= numPages) {
                onGoToPage(value)
            }
        },
        [numPages, onGoToPage]
    )

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-muted text-foreground border-b select-none shrink-0">
            {/* Left: Thumbnail toggle + page navigation */}
            <div className="flex items-center gap-2">
                {features.thumbnails && (
                    <button
                        onClick={onToggleThumbnails}
                        className={toolButtonClass}
                        title={thumbnailsOpen ? '关闭缩略图' : '打开缩略图'}
                    >
                        {thumbnailsOpen ? (
                            <PanelLeftClose className="w-4 h-4" />
                        ) : (
                            <PanelLeftOpen className="w-4 h-4" />
                        )}
                    </button>
                )}

                {features.pagination && (
                    <>
                        <button
                            onClick={onPrevPage}
                            disabled={currentPage <= 1}
                            className={toolButtonClass}
                            title="上一页"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {features.pageJump ? (
                            <div className="flex items-center gap-1 text-sm">
                                <input
                                    type="number"
                                    min={1}
                                    max={numPages}
                                    value={currentPage}
                                    onChange={handlePageChange}
                                    onKeyDown={handlePageInput}
                                    className="w-12 text-center border rounded bg-background px-1 py-0.5 text-sm text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-muted-foreground">/ {numPages}</span>
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                {currentPage} / {numPages}
                            </span>
                        )}

                        <button
                            onClick={onNextPage}
                            disabled={currentPage >= numPages}
                            className={toolButtonClass}
                            title="下一页"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            {/* Center: Zoom controls */}
            <div className="flex items-center gap-2">
                {features.zoom && (
                    <>
                        <button
                            onClick={onZoomOut}
                            disabled={scale <= MIN_SCALE}
                            className={toolButtonClass}
                            title="缩小"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onResetZoom}
                            className="min-w-[52px] rounded px-2 py-0.5 text-center text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            title="重置缩放"
                        >
                            {Math.round(scale * 100)}%
                        </button>
                        <button
                            onClick={onZoomIn}
                            disabled={scale >= MAX_SCALE}
                            className={toolButtonClass}
                            title="放大"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onResetZoom}
                            className={toolButtonClass}
                            title="适应页面"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}
            </div>

            {/* Right: Search + Close */}
            <div className="flex items-center gap-2">
                {features.search && (
                    <button
                        onClick={onToggleSearch}
                        className={toolButtonClass}
                        title="搜索"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        className={toolButtonClass}
                        title="关闭"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
