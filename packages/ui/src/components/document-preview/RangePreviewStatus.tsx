import React from 'react'
import type { DiffResult } from './core'
import { ProcessingStatus, ProcessingStatusLabels } from './types'

interface StatusProps {
    className?: string
    style?: React.CSSProperties
}

interface LoadingPreviewProps extends StatusProps {
    processingStatus: ProcessingStatus
    rangeId: string
}

export function LoadingPreview({ className, style, processingStatus, rangeId }: LoadingPreviewProps): React.JSX.Element {
    return (
        <div className={className} style={style}>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
                <div className="text-center">
                    <div className="text-sm text-gray-600">
                        {ProcessingStatusLabels[processingStatus]}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Range ID: {rangeId}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function EmptyParseResultPreview({ className, style }: StatusProps): React.JSX.Element {
    return (
        <div className={className} style={style}>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">No parse result available</div>
            </div>
        </div>
    )
}

interface DebugInfoProps {
    blocksCount: number
    canvasBlocksCount: number
    markdownFallbackBlocksCount: number
    isFullMarkdownMode: boolean
    zoom: number
    dpr: number
    totalPages: number
    containerWidth: number
    hoveredId: string | null
    editMode: boolean
    editingBlockId: string | null
    diffMode: boolean
    diffDataToUse: DiffResult | undefined
}

export function DebugInfo({
    blocksCount,
    canvasBlocksCount,
    markdownFallbackBlocksCount,
    isFullMarkdownMode,
    zoom,
    dpr,
    totalPages,
    containerWidth,
    hoveredId,
    editMode,
    editingBlockId,
    diffMode,
    diffDataToUse,
}: DebugInfoProps): React.JSX.Element {
    return (
        <div className="mt-2 p-2 bg-gray-900 text-gray-100 rounded-md text-xs font-mono flex-shrink-0">
            <div>
                Blocks: {blocksCount} (Canvas: {canvasBlocksCount}, Markdown:{' '}
                {markdownFallbackBlocksCount})
            </div>
            <div>
                Mode: {isFullMarkdownMode ? 'Full Markdown' : 'Canvas (Virtual Scrolling)'}
            </div>
            <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
            <div>DPR: {dpr}</div>
            <div>Pages: {totalPages}</div>
            <div>Container Width: {containerWidth}px</div>
            <div>Hovered: {hoveredId || 'none'}</div>
            {editMode && <div>Editing: {editingBlockId || 'none'}</div>}
            {diffMode && diffDataToUse && (
                <div>
                    Diff: +{diffDataToUse.added.length} -{diffDataToUse.deleted.length} ~
                    {diffDataToUse.updated.length}
                </div>
            )}
        </div>
    )
}
