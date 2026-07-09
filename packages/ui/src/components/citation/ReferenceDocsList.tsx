'use client'

import { useState, useRef, useEffect, useLayoutEffect, memo, type FC } from 'react'
import { createPortal } from 'react-dom'
import type { DocReference } from './types'

interface ReferenceDocsListProps {
  docs: DocReference[]
}

interface PopoverPosition {
  top: number
  left: number
}

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Renders a "参考X个文档" link. Clicking it shows a floating list of referenced documents
 * with doc_position_id as number label and dataName as content.
 * Uses React Portal to render popover at document.body level to avoid overflow clipping.
 */
export const ReferenceDocsList: FC<ReferenceDocsListProps> = memo(({ docs }) => {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Calculate popover position after render when opened
  useIsomorphicLayoutEffect(() => {
    if (!open || !triggerRef.current || !popoverRef.current) return

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect()
      const popoverRect = popoverRef.current!.getBoundingClientRect()
      const popoverWidth = popoverRect.width || 320
      const popoverHeight = popoverRect.height || 256
      const padding = 8
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // Calculate horizontal position (aligned to left of trigger)
      let left = triggerRect.left
      // Keep within viewport horizontally
      left = Math.max(padding, Math.min(left, viewportWidth - popoverWidth - padding))

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

  if (!docs || docs.length === 0) return null

  const hasOnlineSources = docs.some((d) => !!d.url)

  const popoverContent = open ? (
    <div
      ref={popoverRef}
      className="fixed z-[9999] w-80 max-h-64 overflow-y-auto rounded-lg border bg-white p-2 shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-1">
        {hasOnlineSources ? '参考网页' : '参考文档'}
      </div>
      <div className="space-y-0.5">
        {docs.map((doc) => (
          <div
            key={doc.docPositionId}
            className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 text-sm"
          >
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-medium text-primary bg-primary/10 rounded shrink-0 mt-0.5">
              {doc.docPositionId}
            </span>
            {doc.url ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all leading-relaxed"
              >
                {doc.dataName && doc.dataName !== doc.url ? doc.dataName : doc.url}
              </a>
            ) : (
              <span className="text-foreground break-words leading-relaxed">
                {doc.dataName || '未知文档'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  ) : null

  return (
    <div className="block mt-3">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        <span>参考{docs.length}个{hasOnlineSources ? '来源' : '文档'}</span>
      </button>
      {typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </div>
  )
})

ReferenceDocsList.displayName = 'ReferenceDocsList'
