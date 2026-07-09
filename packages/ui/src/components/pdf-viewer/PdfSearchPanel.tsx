'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { X, ChevronUp, ChevronDown } from 'lucide-react'

interface SearchMatch {
    pageIndex: number
    matchIndex: number
}

interface PdfSearchPanelProps {
    numPages: number
    onHighlight: (matches: SearchMatch[], activeIndex: number) => void
    onClose: () => void
    /** Function to get text content for a page (0-indexed) */
    getPageText: (pageIndex: number) => Promise<string>
}

export function PdfSearchPanel({
    numPages,
    onHighlight,
    onClose,
    getPageText,
}: PdfSearchPanelProps) {
    const toolButtonClass = 'p-1 rounded text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40 transition-colors'
    const [query, setQuery] = useState('')
    const [matches, setMatches] = useState<SearchMatch[]>([])
    const [activeIndex, setActiveIndex] = useState(-1)
    const [searching, setSearching] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const doSearch = useCallback(
        async (text: string) => {
            if (!text.trim()) {
                setMatches([])
                setActiveIndex(-1)
                onHighlight([], -1)
                return
            }
            setSearching(true)
            const found: SearchMatch[] = []
            const lowerQuery = text.toLowerCase()

            for (let i = 0; i < numPages; i++) {
                try {
                    const pageText = await getPageText(i)
                    const lowerPageText = pageText.toLowerCase()
                    let startIndex = 0
                    let matchIdx = 0
                    while (true) {
                        const pos = lowerPageText.indexOf(lowerQuery, startIndex)
                        if (pos === -1) break
                        found.push({ pageIndex: i, matchIndex: matchIdx })
                        matchIdx++
                        startIndex = pos + 1
                    }
                } catch {
                    // Skip pages that fail
                }
            }

            setMatches(found)
            const newActive = found.length > 0 ? 0 : -1
            setActiveIndex(newActive)
            onHighlight(found, newActive)
            setSearching(false)
        },
        [numPages, getPageText, onHighlight]
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    // Previous match
                    if (matches.length > 0) {
                        const newIdx = activeIndex <= 0 ? matches.length - 1 : activeIndex - 1
                        setActiveIndex(newIdx)
                        onHighlight(matches, newIdx)
                    }
                } else if (matches.length > 0 && activeIndex >= 0) {
                    // Next match
                    const newIdx = (activeIndex + 1) % matches.length
                    setActiveIndex(newIdx)
                    onHighlight(matches, newIdx)
                } else {
                    doSearch(query)
                }
            } else if (e.key === 'Escape') {
                onClose()
            }
        },
        [query, matches, activeIndex, doSearch, onHighlight, onClose]
    )

    const goNext = useCallback(() => {
        if (matches.length === 0) return
        const newIdx = (activeIndex + 1) % matches.length
        setActiveIndex(newIdx)
        onHighlight(matches, newIdx)
    }, [matches, activeIndex, onHighlight])

    const goPrev = useCallback(() => {
        if (matches.length === 0) return
        const newIdx = activeIndex <= 0 ? matches.length - 1 : activeIndex - 1
        setActiveIndex(newIdx)
        onHighlight(matches, newIdx)
    }, [matches, activeIndex, onHighlight])

    return (
        <div className="flex items-center gap-2 border-b bg-muted px-4 py-2 text-foreground shrink-0">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value)
                    doSearch(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                placeholder="搜索..."
                className="flex-1 max-w-xs rounded border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground"
            />
            {matches.length > 0 && (
                <span className="text-xs text-muted-foreground">
                    {activeIndex + 1} / {matches.length}
                </span>
            )}
            {searching && <span className="text-xs text-muted-foreground">搜索中...</span>}
            <button
                onClick={goPrev}
                disabled={matches.length === 0}
                className={toolButtonClass}
                title="上一个"
            >
                <ChevronUp className="w-4 h-4" />
            </button>
            <button
                onClick={goNext}
                disabled={matches.length === 0}
                className={toolButtonClass}
                title="下一个"
            >
                <ChevronDown className="w-4 h-4" />
            </button>
            <button
                onClick={onClose}
                className={toolButtonClass}
                title="关闭搜索"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
