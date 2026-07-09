'use client'

import { useState, useRef, useEffect, useLayoutEffect, memo, type FC } from 'react'
import { createPortal } from 'react-dom'
import type { ParsedCitation, DocReference } from './types'
import { findChunkContent } from './citation-utils'
import { sanitizeTableHtml } from './sanitize-table-html'

interface CitationMarkProps {
  citation: ParsedCitation
  /** docs can be undefined during streaming */
  docs?: DocReference[]
  /** Show chunk id in popover for debugging */
  debug?: boolean
}

interface PopoverPosition {
  top: number
  left: number
}

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Check if content contains HTML table markup */
const containsHtmlTable = (text: string): boolean => {
  return /<table[\s>]/i.test(text)
}

/**
 * Renders a superscript citation number. Clicking it shows a popover with the chunk content.
 * Uses React Portal to render popover at document.body level to avoid overflow clipping.
 * During streaming (when docs is empty), clicking shows "loading" state.
 * If content contains HTML table, renders it as formatted HTML.
 */
export const CitationMark: FC<CitationMarkProps> = memo(({ citation, docs, debug = false }) => {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const content = (docs && docs.length > 0) ? findChunkContent(citation, docs) : undefined
  const hasContent = !!content
  const isHtmlTable = hasContent && containsHtmlTable(content)
  const sanitizedTableHtml = isHtmlTable ? sanitizeTableHtml(content) : ''

  // Calculate popover position after render when opened
  useIsomorphicLayoutEffect(() => {
    if (!open || !triggerRef.current || !popoverRef.current) return

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect()
      const popoverRect = popoverRef.current!.getBoundingClientRect()
      const popoverHeight = popoverRect.height || 200
      const padding = 8
      const viewportHeight = document.documentElement.clientHeight

      const popoverWidth = popoverRect.width || 200
      const viewportWidth = document.documentElement.clientWidth

      // Calculate horizontal position
      let left = triggerRect.left
      
      // If the popover overflows the right edge of the screen, adjust left position
      if (left + popoverWidth + padding > viewportWidth) {
        left = Math.max(padding, viewportWidth - popoverWidth - padding)
      }

      // Calculate vertical position (prefer above, fallback to below)
      let top: number
      const spaceAbove = triggerRect.top
      const spaceBelow = viewportHeight - triggerRect.bottom

      if (spaceAbove >= popoverHeight + padding) {
        // Enough space above - show above
        top = triggerRect.top - popoverHeight - padding
      } else if (spaceBelow >= popoverHeight + padding) {
        // Enough space below - show below
        top = triggerRect.bottom + padding
      } else {
        // Not enough space either way - show in larger space, constrained to viewport
        if (spaceAbove > spaceBelow) {
          top = Math.max(padding, triggerRect.top - popoverHeight - padding)
        } else {
          top = Math.min(triggerRect.bottom + padding, viewportHeight - popoverHeight - padding)
        }
      }

      setPosition({ top, left })
    }

    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(updatePosition)

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleClick = () => {
    // Only toggle if we have content or want to show loading state
    setOpen(!open)
  }

  const popoverContent = open ? (
    <div
      ref={popoverRef}
      className="fixed z-[9999] max-w-[90vw] max-h-72 overflow-auto rounded-lg border bg-white p-3 text-sm text-foreground shadow-xl"
      style={{ top: position.top, left: position.left, minWidth: 200 }}
    >
      {hasContent ? (
        <>
          {debug && (
            <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded mb-2 font-mono border border-yellow-200">
              chunk_id: {citation.chunkId}
            </div>
          )}
          {isHtmlTable ? (
            <div
              className="prose prose-sm max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-gray-50 [&_tr:hover]:bg-gray-50"
              dangerouslySetInnerHTML={{ __html: sanitizedTableHtml }}
            />
          ) : (
            <div className="whitespace-pre-wrap break-words leading-relaxed">{content}</div>
          )}
        </>
      ) : (
        <div className="text-muted-foreground text-center py-2">加载中...</div>
      )}
    </div>
  ) : null

  return (
    <span className="inline">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center justify-center size-4 text-[10px] font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 cursor-pointer align-text-top leading-none transition-colors"
        onClick={handleClick}
        aria-label={`引用 ${citation.docPositionId}`}
      >
        {citation.docPositionId}
      </button>
      {typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </span>
  )
})

CitationMark.displayName = 'CitationMark'
