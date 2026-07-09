/**
 * LargeTextRenderer - Virtualized renderer for large text/JSON content.
 *
 * Bypasses ReactMarkdown entirely for huge content blocks (>50K chars).
 * Uses @tanstack/react-virtual to virtualize line-by-line rendering,
 * only mounting DOM nodes for lines visible in the viewport.
 *
 * Features:
 * - Line-level virtualization via @tanstack/react-virtual
 * - Simple syntax highlighting for JSON (keys, strings, numbers, booleans, null)
 * - Edit mode support (click a block → opens textarea)
 * - Preserves the same click/edit contract as the Markdown fallback path
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef, memo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Content length threshold to activate this renderer instead of <Markdown> */
export const LARGE_TEXT_THRESHOLD = 50_000
export const LARGE_TEXT_LINE_THRESHOLD = 300

const LINE_HEIGHT = 22      // px per line (matches typical code rendering)
const OVERSCAN_COUNT = 30   // extra lines rendered above/below viewport
const FONT_SIZE = 13

// ---------------------------------------------------------------------------
// Simple JSON syntax highlighting (no external dependency)
// ---------------------------------------------------------------------------

/** Highlight a single line of JSON text with colored <span>s */
function highlightJsonLine(line: string): React.ReactNode {
    // Fast path: empty line
    if (!line.trim()) return line

    const parts: React.ReactNode[] = []
    // Regex captures: JSON strings, numbers, booleans, null, brackets/braces, colons/commas
    const TOKEN_RE = /("(?:[^"\\]|\\.)*")\s*(:)?|(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\]:,])/g

    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = TOKEN_RE.exec(line)) !== null) {
        // Text before this token (whitespace/other)
        if (match.index > lastIndex) {
            parts.push(line.slice(lastIndex, match.index))
        }

        if (match[1] !== undefined) {
            // String token
            if (match[2] !== undefined) {
                // It's a key (followed by colon)
                parts.push(
                    <span key={match.index} style={{ color: '#881391' }}>{match[1]}</span>,
                    <span key={`${match.index}c`} style={{ color: '#333' }}>{match[2]}</span>,
                )
            } else {
                // Plain string value
                parts.push(
                    <span key={match.index} style={{ color: '#0B7500' }}>{match[1]}</span>,
                )
            }
        } else if (match[3] !== undefined) {
            // Number
            parts.push(
                <span key={match.index} style={{ color: '#1750EB' }}>{match[3]}</span>,
            )
        } else if (match[4] !== undefined) {
            // Boolean
            parts.push(
                <span key={match.index} style={{ color: '#1750EB' }}>{match[4]}</span>,
            )
        } else if (match[5] !== undefined) {
            // null
            parts.push(
                <span key={match.index} style={{ color: '#808080' }}>{match[5]}</span>,
            )
        } else if (match[6] !== undefined) {
            // Structural char
            parts.push(
                <span key={match.index} style={{ color: '#333' }}>{match[6]}</span>,
            )
        }

        lastIndex = match.index + match[0].length
    }

    // Remainder
    if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex))
    }

    return parts.length > 0 ? parts : line
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface LargeTextRendererProps {
    /** The full text content (may be 600K+ chars) */
    content: string
    /** Whether the content appears to be JSON */
    isJson?: boolean
    /** Edit mode flag */
    editMode?: boolean
    /** Click handler */
    onClick?: () => void
    /** Double click handler */
    onDoubleClick?: () => void
    /** Restore the internal scroll position after remounting */
    initialScrollTop?: number
    /** Restore the internal horizontal scroll position after remounting */
    initialScrollLeft?: number
    /** Notify parent when the internal scroll position changes */
    onScrollPositionChange?: (position: { top: number; left: number }) => void
}

// Memoized line component
const VirtualLine = memo(({ content, isJson }: { content: string; isJson: boolean }) => {
    return (
        <div
            style={{
                height: LINE_HEIGHT,
                lineHeight: `${LINE_HEIGHT}px`,
                fontSize: FONT_SIZE,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                whiteSpace: 'pre',
                overflow: 'hidden',
                paddingLeft: 8,
                paddingRight: 8,
            }}
        >
            {isJson ? highlightJsonLine(content) : content}
        </div>
    )
})
VirtualLine.displayName = 'VirtualLine'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const LargeTextRenderer = memo(function LargeTextRenderer({
    content,
    isJson = false,
    editMode = false,
    onClick,
    onDoubleClick,
    initialScrollTop = 0,
    initialScrollLeft = 0,
    onScrollPositionChange,
}: LargeTextRendererProps) {
    const parentRef = useRef<HTMLDivElement>(null)
    const isInteractive = Boolean(onClick || onDoubleClick)

    // Split content into lines (memoized)
    const lines = useMemo(() => content.split('\n'), [content])

    const virtualizer = useVirtualizer({
        count: lines.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => LINE_HEIGHT,
        overscan: OVERSCAN_COUNT,
    })

    useLayoutEffect(() => {
        const parent = parentRef.current
        if (!parent) return

        parent.scrollTop = initialScrollTop
        parent.scrollLeft = initialScrollLeft
    }, [initialScrollLeft, initialScrollTop, content])

    useEffect(() => {
        const parent = parentRef.current
        if (!parent || !onScrollPositionChange) return

        const handleScroll = () => {
            onScrollPositionChange({
                top: parent.scrollTop,
                left: parent.scrollLeft,
            })
        }

        parent.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            parent.removeEventListener('scroll', handleScroll)
        }
    }, [onScrollPositionChange])

    return (
        <div
            ref={parentRef}
            data-range-preview-scroll="true"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onKeyDown={
                isInteractive
                    ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              onClick?.()
                          }
                      }
                    : undefined
            }
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            style={{
                height: '100%',
                overflow: 'auto',
                cursor: editMode ? 'text' : isInteractive ? 'pointer' : 'default',
                backgroundColor: '#fafafa',
                color: '#111827',
                borderRadius: 4,
            }}
        >
            {/* Virtualized line list */}
            <div
                style={{
                    height: virtualizer.getTotalSize(),
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem) => (
                    <div
                        key={virtualItem.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: LINE_HEIGHT,
                            transform: `translateY(${virtualItem.start}px)`,
                        }}
                    >
                        <VirtualLine
                            content={lines[virtualItem.index]}
                            isJson={isJson}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
})

/**
 * Detect if content is likely JSON.
 * Cheap heuristic: trim and check first char.
 */
export function isLikelyJson(content: string): boolean {
    const trimmed = content.trimStart()
    return trimmed.startsWith('{') || trimmed.startsWith('[')
}

export function shouldUseLargeTextRenderer(content: string): boolean {
    if (content.length > LARGE_TEXT_THRESHOLD) {
        return true
    }

    let lineCount = 1
    for (let index = 0; index < content.length; index += 1) {
        if (content[index] !== '\n') continue

        lineCount += 1
        if (lineCount > LARGE_TEXT_LINE_THRESHOLD) {
            return true
        }
    }

    return false
}
