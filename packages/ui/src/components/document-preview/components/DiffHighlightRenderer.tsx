/**
 * DiffHighlightRenderer Component
 *
 * Renders character-level diff segments with inline highlighting.
 * Used in Full Markdown Mode when diffMode is enabled.
 *
 * - Original side: shows "unchanged" + "deleted" (red highlight), skips "added"
 * - Current side:  shows "unchanged" + "added" (green highlight), skips "deleted"
 */

import React from 'react'
import type { ContentDiffSegment } from '../types'
import { CHAR_DIFF_STYLES } from '../core/diffColors'

type DiffSide = 'original' | 'current' | 'unified'

interface DiffHighlightRendererProps {
    /** Character-level diff segments */
    segments: ContentDiffSegment[]
    /** Which side of the diff we are rendering */
    side: DiffSide
    /** Additional CSS class */
    className?: string
}

/**
 * Render a single segment with diff highlighting.
 */
function renderSegment(
    segment: ContentDiffSegment,
    side: DiffSide,
    index: number,
): React.ReactNode {
    const { type, text } = segment

    // unchanged → render as-is
    if (type === 'unchanged') {
        return <span key={index}>{text}</span>
    }

    // unified mode: show both deleted (strikethrough) and added (highlighted)
    if (side === 'unified') {
        if (type === 'deleted') {
            return (
                <span key={index} style={CHAR_DIFF_STYLES.deleted} data-diff="deleted">
                    {text}
                </span>
            )
        }
        if (type === 'added') {
            return (
                <span key={index} style={CHAR_DIFF_STYLES.added} data-diff="added">
                    {text}
                </span>
            )
        }
        return <span key={index}>{text}</span>
    }

    // On original side: show deleted (highlighted), skip added
    if (side === 'original') {
        if (type === 'deleted') {
            return (
                <span key={index} style={CHAR_DIFF_STYLES.deleted} data-diff="deleted">
                    {text}
                </span>
            )
        }
        // type === 'added' → skip entirely on original side
        return null
    }

    // On current side: show added (highlighted), skip deleted
    if (side === 'current') {
        if (type === 'added') {
            return (
                <span key={index} style={CHAR_DIFF_STYLES.added} data-diff="added">
                    {text}
                </span>
            )
        }
        // type === 'deleted' → skip entirely on current side
        return null
    }

    return <span key={index}>{text}</span>
}

export const DiffHighlightRenderer: React.FC<DiffHighlightRendererProps> = ({
    segments,
    side,
    className,
}) => {
    return (
        <div
            className={className}
            style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                lineHeight: '1.7',
            }}
        >
            {segments.map((seg, i) => renderSegment(seg, side, i))}
        </div>
    )
}
