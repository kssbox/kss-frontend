/**
 * Canvas Engine - Coordinate System
 *
 * Converts between normalized coordinates (0–1000) and pixel coordinates,
 * handling multi-page layout with page offsets and gaps.
 */

import type { CoordinateConfig, PixelRect, NormalizedBBox, PageDescriptor } from './types'
import { DEFAULT_COORDINATE_CONFIG } from './types'

export class CoordinateSystem {
    private config: CoordinateConfig
    private _scale: number = 1

    constructor(config: CoordinateConfig = DEFAULT_COORDINATE_CONFIG) {
        this.config = { ...config }
    }

    // ---------------------------------------------------------------------------
    // Accessors
    // ---------------------------------------------------------------------------

    get scale(): number {
        return this._scale
    }

    get pageHeight(): number {
        return this.config.pageHeight
    }

    get pageWidth(): number {
        return this.config.pageWidth
    }

    get pageGap(): number {
        return this.config.pageGap
    }

    /** Height of one page in CSS pixels (scaled) */
    get pageHeightPx(): number {
        return this.config.pageHeight * this._scale
    }

    /** Total height of one page row (page + gap) in CSS pixels */
    get pageStridePx(): number {
        return this.pageHeightPx + this.config.pageGap
    }

    // ---------------------------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------------------------

    /**
     * Update scale factor (e.g. when container width or zoom changes).
     */
    setScale(scale: number): void {
        this._scale = scale
    }

    /**
     * Update coordinate config.
     */
    setConfig(config: Partial<CoordinateConfig>): void {
        Object.assign(this.config, config)
    }

    // ---------------------------------------------------------------------------
    // Conversions
    // ---------------------------------------------------------------------------

    /**
     * Calculate the vertical pixel offset for a given page.
     */
    pageOffsetY(page: number): number {
        return page * this.pageStridePx
    }

    /**
     * Convert a normalized bbox + page to a PixelRect.
     */
    bboxToPixelRect(bbox: number[], page: number): PixelRect {
        if (!bbox || bbox.length !== 4) {
            return { x: 0, y: 0, width: 0, height: 0 }
        }
        const s = this._scale
        const offsetY = this.pageOffsetY(page)
        return {
            x: bbox[0] * s,
            y: bbox[1] * s + offsetY,
            width: (bbox[2] - bbox[0]) * s,
            height: (bbox[3] - bbox[1]) * s,
        }
    }

    /**
     * Convert a NormalizedBBox object to a PixelRect.
     */
    normalizedToPixelRect(nbox: NormalizedBBox, page: number): PixelRect {
        return this.bboxToPixelRect([nbox.x1, nbox.y1, nbox.x2, nbox.y2], page)
    }

    /**
     * Convert pixel coordinates to normalized coords + page number.
     */
    pixelToNormalized(pixelX: number, pixelY: number): { x: number; y: number; page: number } {
        const stride = this.pageStridePx
        const page = stride > 0 ? Math.floor(pixelY / stride) : 0
        const offsetY = this.pageOffsetY(page)
        return {
            x: pixelX / this._scale,
            y: (pixelY - offsetY) / this._scale,
            page,
        }
    }

    /**
     * Check if a normalized point is inside a bbox.
     */
    isPointInBBox(x: number, y: number, bbox: number[]): boolean {
        if (!bbox || bbox.length !== 4) return false
        return x >= bbox[0] && x <= bbox[2] && y >= bbox[1] && y <= bbox[3]
    }

    /**
     * Generate page descriptors for virtualizer.
     *
     * @param totalPages - Total number of pages
     * @returns Array of PageDescriptor with computed pixel heights
     */
    getPageDescriptors(totalPages: number): PageDescriptor[] {
        const pages: PageDescriptor[] = []
        for (let i = 0; i < totalPages; i++) {
            pages.push({
                pageIndex: i,
                heightPx: this.pageHeightPx + (i < totalPages - 1 ? this.config.pageGap : 0),
            })
        }
        return pages
    }

    /**
     * Calculate the total height of all pages in CSS pixels.
     */
    totalHeight(totalPages: number): number {
        if (totalPages <= 0) return 0
        return totalPages * this.pageHeightPx + (totalPages - 1) * this.config.pageGap
    }

    /**
     * Calculate the EditOverlay position for a block bbox.
     */
    editOverlayPosition(
        bbox: [number, number, number, number],
        page: number,
        containerWidth: number,
        zoom: number,
    ): { left: number; top: number; width: number; height: number } {
        const scaleFactor = (containerWidth / this.config.pageWidth) * zoom
        const pageOffset = page * (this.config.pageHeight * scaleFactor + this.config.pageGap)

        return {
            left: bbox[0] * scaleFactor,
            top: bbox[1] * scaleFactor + pageOffset,
            width: (bbox[2] - bbox[0]) * scaleFactor,
            height: (bbox[3] - bbox[1]) * scaleFactor,
        }
    }
}
