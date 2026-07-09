'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

import type { PdfViewerProps } from './types'
import { DEFAULT_FEATURES } from './types'
import { usePdfViewer, type ScrollBlockValue } from './use-pdf-viewer'
import { PdfToolbar } from './PdfToolbar'
import { PdfThumbnailSidebar } from './PdfThumbnailSidebar'
import { PdfSearchPanel } from './PdfSearchPanel'
import { Loader2 } from 'lucide-react'
import { logger } from '../../lib/logger'

// Configure PDF.js worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

/**
 * Full-featured PDF viewer component with configurable features.
 *
 * Performance features:
 * - Virtual scrolling: only renders visible pages ± 1 buffer
 * - HTTP Range requests: pdfjs automatically uses Range requests when the server supports it
 * - Web Worker: PDF parsing runs in a separate thread
 * - Browser caching: leverages ETag + Cache-Control headers
 */
export function PdfViewer({
    url,
    httpHeaders,
    initialPage = 1,
    features: featuresProp,
    className,
    onLoadSuccess,
    onLoadError,
    onClose,
    showToolbar = true,
    controlledPage,
    onPageChange,
    highlight,
}: PdfViewerProps) {
    const features = useMemo(
        () => ({ ...DEFAULT_FEATURES, ...featuresProp }),
        [featuresProp]
    )

    const [numPages, setNumPages] = useState(0)
    const [loadError, setLoadError] = useState<Error | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null)

    // Track which pages are visible for virtual scrolling
    const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([initialPage]))
    // Use ref to avoid stale closure in IntersectionObserver callback
    const visiblePagesRef = useRef<Set<number>>(new Set([initialPage]))
    // Suppress observer currentPage updates during programmatic navigation
    const isNavigatingRef = useRef(false)
    const lastControlledPageRef = useRef<number | undefined>(undefined)
    // Track actual rendered page dimensions for stable placeholder sizing (prevents jitter)
    const pageDimensionsRef = useRef<Map<number, { width: number; height: number }>>(new Map())

    const {
        currentPage,
        scale,
        searchOpen,
        thumbnailsOpen,
        goToPage: goToPageRaw,
        zoomIn,
        zoomOut,
        resetZoom,
        toggleSearch,
        toggleThumbnails,
        registerPageRef,
        setCurrentPage,
    } = usePdfViewer({ initialPage, numPages })

    // Wrap navigation to suppress observer currentPage overrides during scroll
    const navigateToPage = useCallback(
        (page: number, block: ScrollBlockValue = 'start') => {
            isNavigatingRef.current = true
            goToPageRaw(page, { behavior: 'smooth', block })
            // Re-enable observer tracking after scroll animation settles
            setTimeout(() => {
                isNavigatingRef.current = false
            }, 600)
        },
        [goToPageRaw]
    )
    const goToPage = navigateToPage
    const prevPage = useCallback(() => navigateToPage(currentPage - 1, 'start'), [currentPage, navigateToPage])
    const nextPage = useCallback(() => navigateToPage(currentPage + 1, 'start'), [currentPage, navigateToPage])

    useEffect(() => {
        if (!controlledPage || controlledPage === lastControlledPageRef.current) return
        lastControlledPageRef.current = controlledPage
        navigateToPage(controlledPage, 'nearest')
    }, [controlledPage, navigateToPage])

    useEffect(() => {
        onPageChange?.(currentPage)
    }, [currentPage, onPageChange])

    const fileOptions = useMemo(
        () => ({
            ...(httpHeaders ? { httpHeaders } : {}),
            // Only fetch PDF data when pages are actually rendered (on-demand Range requests)
            // disableAutoFetch: don't proactively fetch all remaining chunks after initial load
            // disableStream: cancel the initial full GET after confirming Range support,
            //   so data only arrives via on-demand Range requests for rendered pages
            disableAutoFetch: true,
            disableStream: true,

            rangeChunkSize: 65536,
            // * 4 * 5, // 256KB chunks for faster loading of high-res pages (default is 128KB)
            enableXhr: true
        }),
        [httpHeaders]
    )

    const handleDocLoadSuccess = useCallback(
        (pdf: { numPages: number }) => {
            setNumPages(pdf.numPages)
            // Store the pdf document proxy for text extraction
            pdfDocRef.current = pdf as unknown as pdfjs.PDFDocumentProxy
            onLoadSuccess?.({ numPages: pdf.numPages })
        },
        [onLoadSuccess]
    )

    const handleDocLoadError = useCallback(
        (error: Error) => {
            setLoadError(error)
            onLoadError?.(error)
        },
        [onLoadError]
    )

    const handleTextLayerRenderError = useCallback((error: Error) => {
        const message = String(error?.message || error)
        const name = String(error?.name || '')
        if (name === 'AbortException' || message.includes('TextLayer task cancelled')) {
            return
        }
        logger.error('PDF text layer render failed', error)
    }, [])

    // IntersectionObserver for virtual scrolling + current page tracking
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container || numPages === 0) return

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const vpSet = visiblePagesRef.current

                for (const entry of entries) {
                    const pageNum = parseInt(entry.target.getAttribute('data-page-wrapper') || '0', 10)
                    if (pageNum === 0) continue

                    if (entry.isIntersecting) {
                        vpSet.add(pageNum)
                    } else {
                        vpSet.delete(pageNum)
                    }
                }

                // Create new Set to trigger React re-render
                const newVisiblePages = new Set(vpSet)
                setVisiblePages(newVisiblePages)

                // Don't override currentPage during programmatic navigation
                if (!isNavigatingRef.current && newVisiblePages.size > 0) {
                    setCurrentPage(Math.min(...newVisiblePages))
                }
            },
            { root: container, threshold: 0.1 }
        )

        // Only observe wrapper elements (not react-pdf internal elements)
        const pageElements = container.querySelectorAll('[data-page-wrapper]')
        pageElements.forEach((el) => observerRef.current?.observe(el))

        return () => {
            observerRef.current?.disconnect()
        }
        // Re-setup observer when numPages or scale changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numPages, scale])

    // Determine which pages to render (visible pages ± 1 buffer)
    const pagesToRender = useMemo(() => {
        if (numPages === 0) return new Set<number>()
        const pages = new Set<number>()
        for (const p of visiblePages) {
            pages.add(p)
            if (p > 1) pages.add(p - 1)
            if (p < numPages) pages.add(p + 1)
        }
        // Always include current page and neighbors
        pages.add(currentPage)
        if (currentPage > 1) pages.add(currentPage - 1)
        if (currentPage < numPages) pages.add(currentPage + 1)
        return pages
    }, [visiblePages, currentPage, numPages])

    // Clear cached page dimensions when scale changes (dimensions depend on zoom)
    useEffect(() => {
        pageDimensionsRef.current.clear()
    }, [scale])

    // Get text content for search
    const getPageText = useCallback(
        async (pageIndex: number): Promise<string> => {
            const pdf = pdfDocRef.current
            if (!pdf) return ''
            const page = await pdf.getPage(pageIndex + 1)
            const content = await page.getTextContent()
            return content.items
                .map((item) => ('str' in item ? item.str : ''))
                .join(' ')
        },
        []
    )

    const handleSearchHighlight = useCallback(
        (matches: Array<{ pageIndex: number; matchIndex: number }>, activeIndex: number) => {
            if (activeIndex >= 0 && activeIndex < matches.length) {
                const match = matches[activeIndex]
                goToPage(match.pageIndex + 1, 'start')
            }
        },
        [goToPage]
    )

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't capture when typing in inputs
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return

            if (e.key === 'Escape' && searchOpen) {
                toggleSearch()
                return
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'f' && features.search) {
                e.preventDefault()
                if (!searchOpen) toggleSearch()
                return
            }

            if (!e.ctrlKey && !e.metaKey) {
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'PageUp':
                        e.preventDefault()
                        prevPage()
                        break
                    case 'ArrowRight':
                    case 'PageDown':
                        e.preventDefault()
                        nextPage()
                        break
                }
            }

            // Zoom: Ctrl/Cmd + / -
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault()
                    zoomIn()
                } else if (e.key === '-') {
                    e.preventDefault()
                    zoomOut()
                } else if (e.key === '0') {
                    e.preventDefault()
                    resetZoom()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [features.search, searchOpen, toggleSearch, prevPage, nextPage, zoomIn, zoomOut, resetZoom])

    if (loadError) {
        return (
            <div className={`flex flex-col items-center justify-center h-full bg-background ${className || ''}`}>
                <p className="text-red-500 text-sm mb-2">PDF 加载失败</p>
                <p className="text-muted-foreground text-xs">{loadError.message}</p>
            </div>
        )
    }

    return (
        <div className={`flex flex-col h-full min-h-0 overflow-hidden bg-background ${className || ''}`}>
            {showToolbar && (
                <PdfToolbar
                    currentPage={currentPage}
                    numPages={numPages}
                    scale={scale}
                    features={features}
                    thumbnailsOpen={thumbnailsOpen}
                    onPrevPage={prevPage}
                    onNextPage={nextPage}
                    onGoToPage={goToPage}
                    onZoomIn={zoomIn}
                    onZoomOut={zoomOut}
                    onResetZoom={resetZoom}
                    onToggleSearch={toggleSearch}
                    onToggleThumbnails={toggleThumbnails}
                    onClose={onClose}
                />
            )}

            {searchOpen && features.search && (
                <PdfSearchPanel
                    numPages={numPages}
                    getPageText={getPageText}
                    onHighlight={handleSearchHighlight}
                    onClose={toggleSearch}
                />
            )}

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {thumbnailsOpen && features.thumbnails && numPages > 0 && (
                    <PdfThumbnailSidebar
                        url={url}
                        numPages={numPages}
                        currentPage={currentPage}
                        httpHeaders={httpHeaders}
                        onPageClick={goToPage}
                    />
                )}

                <div
                    ref={containerRef}
                    data-pdf-scroll-container="true"
                    className="flex-1 overflow-auto"
                >
                    <Document
                        file={url}
                        options={fileOptions}
                        onLoadSuccess={handleDocLoadSuccess}
                        onLoadError={handleDocLoadError}
                        loading={
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <span className="ml-2 text-sm text-muted-foreground">加载 PDF 中...</span>
                            </div>
                        }
                    >
                        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                            const cachedDim = pageDimensionsRef.current.get(pageNum)
                            const placeholderH = cachedDim ? `${cachedDim.height}px` : '800px'
                            const placeholderW = cachedDim ? `${cachedDim.width}px` : '600px'
                            return (
                            <div
                                key={pageNum}
                                data-page-wrapper={pageNum}
                                ref={(el) => registerPageRef(pageNum, el)}
                                className="relative flex w-fit min-w-full justify-center py-2"
                            >
                                {pagesToRender.has(pageNum) ? (
                                    <div
                                        className="relative inline-block"
                                        ref={(el) => {
                                            if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
                                                pageDimensionsRef.current.set(pageNum, {
                                                    width: el.offsetWidth,
                                                    height: el.offsetHeight,
                                                })
                                            }
                                        }}
                                    >
                                        <Page
                                            pageNumber={pageNum}
                                            scale={scale}
                                            renderTextLayer={features.textSelection}
                                            onRenderTextLayerError={handleTextLayerRenderError}
                                            renderAnnotationLayer={true}
                                            loading={
                                                <div
                                                    className="flex items-center justify-center bg-muted"
                                                    style={{ height: placeholderH, width: placeholderW }}
                                                >
                                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                                </div>
                                            }
                                        />
                                        {highlight && highlight.page === pageNum && (
                                            <div
                                                key={highlight.key ?? `${highlight.page}-${highlight.bbox.join('-')}`}
                                                className="pointer-events-none absolute rounded-lg border-2 border-orange-500 bg-orange-400/10 shadow-[0_0_0_9999px_rgba(255,255,255,0.02)]"
                                                style={{
                                                    left: `${highlight.bbox[0] * 0.1}%`,
                                                    top: `${highlight.bbox[1] * 0.1}%`,
                                                    width: `${(highlight.bbox[2] - highlight.bbox[0]) * 0.1}%`,
                                                    height: `${(highlight.bbox[3] - highlight.bbox[1]) * 0.1}%`,
                                                }}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    // Placeholder for non-visible pages (maintains scroll height)
                                    <div
                                        className="flex items-center justify-center rounded bg-muted"
                                        style={{ height: placeholderH, width: placeholderW }}
                                    >
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        )})}
                    </Document>
                </div>
            </div>
        </div>
    )
}
