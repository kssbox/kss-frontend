'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page } from 'react-pdf'

interface PdfThumbnailSidebarProps {
    url: string
    numPages: number
    currentPage: number
    httpHeaders?: Record<string, string>
    onPageClick: (page: number) => void
}

export function PdfThumbnailSidebar({
    url,
    numPages,
    currentPage,
    httpHeaders,
    onPageClick,
}: PdfThumbnailSidebarProps) {
    const fileOptions = React.useMemo(
        () => ({
            ...(httpHeaders ? { httpHeaders } : {}),
            disableAutoFetch: true,
            disableStream: true,
        }),
        [httpHeaders]
    )

    // Lazy-load thumbnails: only render those visible in the sidebar
    const [visibleThumbs, setVisibleThumbs] = useState<Set<number>>(new Set())
    const containerRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)

    // Track which thumbnail placeholders become visible
    const thumbRefCallback = useCallback((el: HTMLButtonElement | null) => {
        if (!el || !observerRef.current) return
        observerRef.current.observe(el)
    }, [])

    useEffect(() => {
        const container = containerRef.current
        if (!container || numPages === 0) return

        observerRef.current = new IntersectionObserver(
            (entries) => {
                setVisibleThumbs((prev) => {
                    const next = new Set(prev)
                    for (const entry of entries) {
                        const pageNum = parseInt(entry.target.getAttribute('data-thumb') || '0', 10)
                        if (pageNum === 0) continue
                        if (entry.isIntersecting) {
                            next.add(pageNum)
                        }
                        // Keep rendered thumbnails in the set (don't unload)
                    }
                    return next.size !== prev.size ? next : prev
                })
            },
            { root: container, rootMargin: '200px 0px' }
        )

        const thumbEls = container.querySelectorAll('[data-thumb]')
        thumbEls.forEach((el) => observerRef.current?.observe(el))

        return () => { observerRef.current?.disconnect() }
    }, [numPages])

    return (
        <div ref={containerRef} className="w-48 shrink-0 overflow-y-auto border-r bg-muted">
            <Document file={url} options={fileOptions} loading={null} error={null}>
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                        key={pageNum}
                        data-thumb={pageNum}
                        ref={thumbRefCallback}
                        onClick={() => onPageClick(pageNum)}
                        className={`block w-full p-2 transition-colors ${pageNum === currentPage
                            ? 'border-l-2 border-primary bg-primary/15'
                            : 'hover:bg-accent'
                            }`}
                    >
                        <div className="relative">
                            {visibleThumbs.has(pageNum) ? (
                                <Page
                                    pageNumber={pageNum}
                                    width={160}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            ) : (
                                <div className="h-[220px] w-[160px] animate-pulse rounded bg-accent" />
                            )}
                            <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                                {pageNum}
                            </span>
                        </div>
                    </button>
                ))}
            </Document>
        </div>
    )
}
