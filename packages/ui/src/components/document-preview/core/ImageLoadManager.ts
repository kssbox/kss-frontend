/**
 * Image Load Manager for Range Preview
 *
 * Handles async image loading with:
 * - Deduplication of concurrent requests for the same asset
 * - Concurrency control (max N simultaneous loads)
 * - LRU-style caching of loaded HTMLImageElement instances
 * - Blob URL lifecycle management (revocation on destroy)
 * - Error resilience (failed loads tracked, skipped on retry)
 *
 * Follows the same pattern as TableLayoutManager: external data is fed
 * into the renderer via `setImageMap()` + `renderVersion` bump.
 */

import type { AssetInfo, ImageUrlResolver } from '../types'

/** Maximum number of concurrent image loads */
const MAX_CONCURRENT_LOADS = 4

export class ImageLoadManager {
    /** Resolved & decoded images, keyed by asset_key */
    private imageCache: Map<string, HTMLImageElement> = new Map()

    /** Blob URLs we created (for revocation on destroy) */
    private blobUrls: Set<string> = new Set()

    /**
     * In-flight load promises keyed by asset_key.
     * Used for both deduplication and concurrency bookkeeping.
     */
    private pendingLoads: Map<string, Promise<void>> = new Map()

    /** Asset keys whose load failed — skip on subsequent attempts */
    private failedKeys: Set<string> = new Set()

    /** Business-provided URL resolver; null = images stay as placeholders */
    private resolver: ImageUrlResolver | undefined

    /** Callback to notify the component that new image(s) are available */
    private onImageLoaded: (() => void) | undefined

    /** Tracks whether the manager has been destroyed */
    private destroyed = false

    /** Queued asset keys waiting for a concurrency slot */
    private queue: Array<{ key: string; asset: AssetInfo }> = []

    /** Number of loads currently in flight */
    private activeCount = 0

    constructor(
        resolver?: ImageUrlResolver,
        onImageLoaded?: () => void,
    ) {
        this.resolver = resolver
        this.onImageLoaded = onImageLoaded
    }

    /**
     * Update the resolver (e.g. when props change).
     * Also clears the failed-keys set so previously-failed images can be retried
     * with the new resolver.
     */
    setResolver(resolver?: ImageUrlResolver): void {
        const changed = this.resolver !== resolver
        this.resolver = resolver
        if (changed) {
            this.failedKeys.clear()
        }
    }

    // ─── Public API ──────────────────────────────────────────────

    /**
     * Request loading for a set of assets.
     * Skips already-cached, in-flight, or failed keys.
     * Internally queues and respects concurrency limit.
     */
    loadImages(
        assets: Record<string, AssetInfo> | undefined,
        assetKeys: string[],
    ): void {
        if (!assets || !this.resolver || this.destroyed) return

        for (const key of assetKeys) {
            // Skip if already handled
            if (
                this.imageCache.has(key) ||
                this.pendingLoads.has(key) ||
                this.failedKeys.has(key)
            ) {
                continue
            }

            const asset = assets[key]
            if (!asset) continue

            this.queue.push({ key, asset })
        }

        this.drainQueue()
    }

    /**
     * Synchronous lookup — used by ImageBlockRenderer during render().
     */
    getImage(assetKey: string): HTMLImageElement | null {
        return this.imageCache.get(assetKey) ?? null
    }

    /**
     * Return the full image cache map (set on ImageBlockRenderer).
     */
    getImageMap(): Map<string, HTMLImageElement> {
        return this.imageCache
    }

    /**
     * Tear down: revoke blob URLs, cancel queued loads, clear caches.
     */
    destroy(): void {
        this.destroyed = true
        this.queue.length = 0

        // Revoke all blob URLs we created
        for (const url of this.blobUrls) {
            try {
                URL.revokeObjectURL(url)
            } catch {
                // Ignore — may already be revoked
            }
        }

        this.imageCache.clear()
        this.blobUrls.clear()
        this.pendingLoads.clear()
        this.failedKeys.clear()
    }

    // ─── Internal ────────────────────────────────────────────────

    /**
     * Process the queue up to the concurrency limit.
     */
    private drainQueue(): void {
        while (this.queue.length > 0 && this.activeCount < MAX_CONCURRENT_LOADS) {
            const item = this.queue.shift()!
            this.startLoad(item.key, item.asset)
        }
    }

    /**
     * Start loading a single image.
     */
    private startLoad(key: string, asset: AssetInfo): void {
        this.activeCount++

        const promise = this.doLoad(key, asset).finally(() => {
            this.activeCount--
            this.pendingLoads.delete(key)
            // Process next queued item
            if (!this.destroyed) {
                this.drainQueue()
            }
        })

        this.pendingLoads.set(key, promise)
    }

    /**
     * Resolve URL → load HTMLImageElement → store in cache → notify.
     */
    private async doLoad(key: string, asset: AssetInfo): Promise<void> {
        if (this.destroyed || !this.resolver) return

        try {
            const url = await this.resolver(asset)
            if (this.destroyed) return

            // Track blob URLs for cleanup
            if (url.startsWith('blob:')) {
                this.blobUrls.add(url)
            }

            const img = await this.loadImageElement(url)
            if (this.destroyed) return

            this.imageCache.set(key, img)

            // Notify component so it bumps renderVersion
            this.onImageLoaded?.()
        } catch (error) {
            if (!this.destroyed) {
                this.failedKeys.add(key)
                // eslint-disable-next-line no-console
                console.warn(`[ImageLoadManager] Failed to load image for asset "${key}":`, error)
            }
        }
    }

    /**
     * Load an HTMLImageElement from a URL.
     * Returns a promise that resolves when the image is fully decoded.
     */
    private loadImageElement(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            // Note: crossOrigin is not set since we use blob: URLs (same-origin)

            img.onload = () => {
                // Use decode() when available for off-main-thread decode
                if (typeof img.decode === 'function') {
                    img.decode().then(() => resolve(img)).catch(() => resolve(img))
                } else {
                    resolve(img)
                }
            }

            img.onerror = (_event) => {
                reject(new Error(`Image load failed: ${url}`))
            }

            img.src = url
        })
    }
}
