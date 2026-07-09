import React from 'react'

interface RangePreviewMetadataProps {
    metadata: {
        parser?: string
        page_count?: number
        char_count?: number
    } | undefined
    diffMode: boolean
    diffSide: 'original' | 'current' | 'unified' | undefined
    edited: boolean
    mode: 'auto' | 'original' | 'edited'
}

export function RangePreviewMetadata({
    metadata,
    diffMode,
    diffSide,
    edited,
    mode,
}: RangePreviewMetadataProps): React.JSX.Element {
    return (
        <div className="mb-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
                <span>
                    <strong>Parser:</strong> {metadata?.parser || 'Unknown'}
                </span>
                {metadata?.page_count && (
                    <span>
                        <strong>Pages:</strong> {metadata.page_count}
                    </span>
                )}
                {metadata?.char_count && (
                    <span>
                        <strong>Chars:</strong> {metadata.char_count.toLocaleString()}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {diffMode && diffSide && diffSide !== 'unified' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {diffSide === 'original' ? 'Original' : 'Current'}
                    </span>
                )}
                {edited && !diffMode && (
                    <div className="flex items-center gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Edited
                        </span>
                        <span className="text-gray-400">
                            {mode === 'auto' && '(showing edited version)'}
                            {mode === 'edited' && '(edited version)'}
                            {mode === 'original' && '(original version)'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
