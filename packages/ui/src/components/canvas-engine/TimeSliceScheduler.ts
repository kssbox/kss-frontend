/**
 * Canvas Engine - Time Slice Scheduler
 *
 * Renders items in priority-sorted batches, yielding to the main thread
 * every `frameBudgetMs` to avoid jank.
 */

import type { CanvasItem, SchedulerConfig } from './types'
import { DEFAULT_SCHEDULER_CONFIG } from './types'

export class TimeSliceScheduler {
    private config: SchedulerConfig

    constructor(config: Partial<SchedulerConfig> = {}) {
        this.config = { ...DEFAULT_SCHEDULER_CONFIG, ...config }
    }

    /**
     * Update the scheduler configuration.
     */
    setConfig(config: Partial<SchedulerConfig>): void {
        Object.assign(this.config, config)
    }

    /**
     * Sort items by type priority (lower = higher priority).
     */
    sortByPriority<T extends CanvasItem>(items: T[]): T[] {
        return [...items].sort((a, b) => {
            const pa = this.config.priorityMap[a.type] ?? this.config.defaultPriority
            const pb = this.config.priorityMap[b.type] ?? this.config.defaultPriority
            return pa - pb
        })
    }

    /**
     * Execute a render loop with time-slicing.
     *
     * @param items - Items to render (will be sorted by priority)
     * @param renderFn - Function to call for each item
     * @param versionCheck - Optional function that returns false if this render is stale
     * @returns Promise that resolves when all items are rendered (or aborted)
     */
    async renderInSlices<T extends CanvasItem>(
        items: T[],
        renderFn: (item: T) => void,
        versionCheck?: () => boolean,
    ): Promise<void> {
        const sorted = this.sortByPriority(items)
        let startTime = performance.now()

        for (let i = 0; i < sorted.length; i++) {
            // Abort if render version changed
            if (versionCheck && !versionCheck()) return

            renderFn(sorted[i])

            // Yield if we've exhausted the frame budget
            if (performance.now() - startTime > this.config.frameBudgetMs) {
                await new Promise<void>(resolve => setTimeout(resolve, 0))
                startTime = performance.now()
            }
        }
    }
}
