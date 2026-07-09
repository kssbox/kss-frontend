/**
 * Canvas Engine - Block Renderer Registry
 *
 * Manages pluggable renderers for different item types.
 * Business layers register their renderers; the engine dispatches via this registry.
 */

import type { CanvasItem, BlockRenderer, BaseRenderOptions, PixelRect } from './types'

export class BlockRendererRegistry<T extends CanvasItem = CanvasItem> {
    private renderers: Map<string, BlockRenderer<T>> = new Map()

    /**
     * Register a renderer for one or more item types.
     */
    register(renderer: BlockRenderer<T>): void {
        const types = Array.isArray(renderer.type) ? renderer.type : [renderer.type]
        for (const t of types) {
            this.renderers.set(t, renderer)
        }
    }

    /**
     * Unregister a renderer by type.
     */
    unregister(type: string): void {
        this.renderers.delete(type)
    }

    /**
     * Get the renderer for a given item type.
     */
    get(type: string): BlockRenderer<T> | undefined {
        return this.renderers.get(type)
    }

    /**
     * Check if a renderer exists for a type.
     */
    has(type: string): boolean {
        return this.renderers.has(type)
    }

    /**
     * Render a single item using its registered renderer.
     * Returns false if no renderer was found.
     */
    render(
        ctx: CanvasRenderingContext2D,
        item: T,
        rect: PixelRect,
        options: BaseRenderOptions,
    ): boolean {
        const renderer = this.renderers.get(item.type)
        if (!renderer) return false
        renderer.render(ctx, item, rect, options)
        return true
    }

    /**
     * Get all registered type names.
     */
    types(): string[] {
        return [...this.renderers.keys()]
    }

    /**
     * Clear all registered renderers.
     */
    clear(): void {
        this.renderers.clear()
    }
}
