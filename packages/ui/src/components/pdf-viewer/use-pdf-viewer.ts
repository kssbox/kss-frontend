'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { DEFAULT_SCALE, MIN_SCALE, MAX_SCALE, SCALE_STEP } from './types'

export type ScrollBehaviorValue = 'auto' | 'instant' | 'smooth'
export type ScrollBlockValue = 'start' | 'center' | 'end' | 'nearest'

interface UsePdfViewerOptions {
  initialPage?: number
  numPages: number
}

interface GoToPageOptions {
  behavior?: ScrollBehaviorValue
  block?: ScrollBlockValue
}

export function usePdfViewer({ initialPage = 1, numPages }: UsePdfViewerOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [scale, setScale] = useState(DEFAULT_SCALE)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Clamp page when numPages changes
  useEffect(() => {
    if (numPages > 0 && currentPage > numPages) {
      setCurrentPage(numPages)
    }
  }, [numPages, currentPage])

  const goToPage = useCallback(
    (page: number, options?: GoToPageOptions) => {
      const clamped = Math.max(1, Math.min(page, numPages))
      setCurrentPage(clamped)
      const el = pageRefs.current.get(clamped)
      if (el) {
        el.scrollIntoView({
          behavior: options?.behavior ?? 'smooth',
          block: options?.block ?? 'start',
        })
      }
    },
    [numPages]
  )

  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage])
  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage])

  const zoomIn = useCallback(
    () => setScale((s) => Math.min(s + SCALE_STEP, MAX_SCALE)),
    []
  )
  const zoomOut = useCallback(
    () => setScale((s) => Math.max(s - SCALE_STEP, MIN_SCALE)),
    []
  )
  const resetZoom = useCallback(() => setScale(DEFAULT_SCALE), [])

  const toggleSearch = useCallback(() => setSearchOpen((v) => !v), [])
  const toggleThumbnails = useCallback(() => setThumbnailsOpen((v) => !v), [])

  const registerPageRef = useCallback((pageNumber: number, el: HTMLDivElement | null) => {
    if (el) {
      pageRefs.current.set(pageNumber, el)
    } else {
      pageRefs.current.delete(pageNumber)
    }
  }, [])

  return {
    currentPage,
    scale,
    searchOpen,
    searchText,
    thumbnailsOpen,
    goToPage,
    prevPage,
    nextPage,
    zoomIn,
    zoomOut,
    resetZoom,
    setScale,
    setSearchText,
    toggleSearch,
    toggleThumbnails,
    registerPageRef,
    setCurrentPage,
  }
}
