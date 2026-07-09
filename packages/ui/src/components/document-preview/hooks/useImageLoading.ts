import { useRef, useState, useEffect, useCallback, type MutableRefObject } from 'react'
import type { ParseBlock, UnifiedParseResult, ImageUrlResolver } from '../types'
import { getImageAssetKey } from '../types'
import { ImageLoadManager } from '../core'
import type { RegisteredRenderers } from '../renderers/registerAll'

interface UseImageLoadingOptions {
    canvasBlocks: ParseBlock[]
    parseResult: UnifiedParseResult | null
    resolveImageUrl: ImageUrlResolver | undefined
    renderersRef: MutableRefObject<RegisteredRenderers | null>
    onRenderVersionBump: () => void
}

/**
 * Manages async image loading with viewport-based lazy loading,
 * deduplication and concurrency control.
 */
export function useImageLoading({
    canvasBlocks,
    parseResult,
    resolveImageUrl,
    renderersRef,
    onRenderVersionBump,
}: UseImageLoadingOptions) {
    const imageManagerRef = useRef<ImageLoadManager | null>(null)
    const visiblePagesRef = useRef<Set<number>>(new Set())
    const [visiblePagesVersion, setVisiblePagesVersion] = useState(0)

    const handleVisiblePagesChange = useCallback((pages: number[]) => {
        const newSet = new Set(pages)
        // Add ±1 page overscan for smoother scrolling
        for (const p of pages) {
            if (p > 0) newSet.add(p - 1)
            newSet.add(p + 1)
        }

        const prev = visiblePagesRef.current
        let same = newSet.size === prev.size
        if (same) {
            for (const p of newSet) {
                if (!prev.has(p)) { same = false; break }
            }
        }
        if (same) return

        visiblePagesRef.current = newSet
        setVisiblePagesVersion((v) => v + 1)
    }, [])

    // Keep the resolver ref up-to-date when the prop changes
    useEffect(() => {
        if (imageManagerRef.current) {
            imageManagerRef.current.setResolver(resolveImageUrl)
        }
    }, [resolveImageUrl])

    useEffect(() => {
        if (!renderersRef.current) return

        const imageBlocks = canvasBlocks.filter((b) => b.type === 'image')
        if (imageBlocks.length === 0) return

        // Lazily initialise the image manager on first use
        if (!imageManagerRef.current) {
            imageManagerRef.current = new ImageLoadManager(
                resolveImageUrl,
                () => {
                    if (renderersRef.current && imageManagerRef.current) {
                        renderersRef.current.image.setImageMap(
                            imageManagerRef.current.getImageMap(),
                        )
                        onRenderVersionBump()
                    }
                },
            )
        }

        const assets = parseResult?.assets
        if (!assets) return

        // Filter image blocks to only those on visible pages (viewport-based lazy loading)
        const visiblePages = visiblePagesRef.current
        if (visiblePages.size === 0) return
        const visibleImageBlocks = imageBlocks.filter((b) => visiblePages.has(b.page ?? 0))

        // Collect unique asset keys from visible image blocks
        const assetKeys: string[] = []
        const seen = new Set<string>()
        for (const block of visibleImageBlocks) {
            const key = getImageAssetKey(block)
            if (key && !seen.has(key)) {
                seen.add(key)
                assetKeys.push(key)
            }
        }

        if (assetKeys.length > 0) {
            imageManagerRef.current.loadImages(assets, assetKeys)
        }
    }, [canvasBlocks, parseResult?.assets, resolveImageUrl, visiblePagesVersion, renderersRef, onRenderVersionBump])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            imageManagerRef.current?.destroy()
            imageManagerRef.current = null
        }
    }, [])

    return {
        handleVisiblePagesChange,
    }
}
