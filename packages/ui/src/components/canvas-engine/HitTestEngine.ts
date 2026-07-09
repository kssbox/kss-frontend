/**
 * Canvas Engine - Hit Test Engine
 *
 * Generic hit-testing against a list of CanvasItems.
 * Business layers can extend by providing custom sub-element hit testers.
 */

import type { CanvasItem, HitResult } from './types'
import { CoordinateSystem } from './CoordinateSystem'

/**
 * Optional callback for sub-element hit testing (e.g. table cells).
 */
export type SubElementHitTester<T extends CanvasItem = CanvasItem> = (
    item: T,
    normalizedX: number,
    normalizedY: number,
) => HitResult<T> | null

export class HitTestEngine<T extends CanvasItem = CanvasItem> {
    private coords: CoordinateSystem
    private subTesters: Map<string, SubElementHitTester<T>> = new Map()

    constructor(coords: CoordinateSystem) {
        this.coords = coords
    }

    /**
     * Register a sub-element hit tester for a specific item type.
     */
    registerSubTester(type: string, tester: SubElementHitTester<T>): void {
        this.subTesters.set(type, tester)
    }

    /**
     * Perform a hit test at pixel coordinates against a list of items.
     * Items are tested in reverse order (topmost first).
     *
     * @param items - All items to test against
     * @param pixelX - X in CSS pixels (relative to canvas)
     * @param pixelY - Y in CSS pixels (relative to canvas)
     * @returns HitResult
     */
    hitTest(items: T[], pixelX: number, pixelY: number): HitResult<T> {
        const { x, y, page } = this.coords.pixelToNormalized(pixelX, pixelY)

        // Reverse iterate - items drawn later are on top
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i]
            if (item.page !== page) continue
            if (!item.bbox || !this.coords.isPointInBBox(x, y, item.bbox)) continue

            // Try sub-element hit test first
            const subTester = this.subTesters.get(item.type)
            if (subTester) {
                const subResult = subTester(item, x, y)
                if (subResult) return subResult
            }

            return { item, hitType: 'item' }
        }

        return { item: null, hitType: 'none' }
    }

    /**
     * Find the item at pixel coordinates.
     */
    itemAt(items: T[], pixelX: number, pixelY: number): T | null {
        return this.hitTest(items, pixelX, pixelY).item
    }

    /**
     * Filter items belonging to a specific page.
     */
    itemsOnPage(items: T[], page: number): T[] {
        return items.filter(item => item.page === page)
    }
}
