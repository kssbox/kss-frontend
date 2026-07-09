/**
 * Canvas Engine - Canvas Engine
 *
 * Central orchestrator that owns coordinate system, renderer registry,
 * hit test engine, text renderer, and time-slice scheduler.
 * Provides the main API for rendering items on a canvas.
 */

import type {
    CanvasItem,
    CanvasEngineConfig,
    BaseRenderOptions,
    PixelRect,
    CoordinateConfig,
    HitResult,
    SchedulerConfig,
} from './types'
import { DEFAULT_COORDINATE_CONFIG } from './types'
import { CoordinateSystem } from './CoordinateSystem'
import { TextRenderer, type TextStyleConfig } from './TextRenderer'
import { HitTestEngine, type SubElementHitTester } from './HitTestEngine'
import { TimeSliceScheduler } from './TimeSliceScheduler'
import { BlockRendererRegistry } from './BlockRendererRegistry'

export class CanvasEngine<T extends CanvasItem = CanvasItem> {
    readonly coords: CoordinateSystem
    readonly text: TextRenderer
    readonly hitTest: HitTestEngine<T>
    readonly scheduler: TimeSliceScheduler
    readonly registry: BlockRendererRegistry<T>

    private debugMode: boolean = false

    constructor(config?: Partial<CanvasEngineConfig>) {
        const coordConfig = config?.coordinates ?? DEFAULT_COORDINATE_CONFIG
        this.coords = new CoordinateSystem(coordConfig)
        if (config?.scale) {
            this.coords.setScale(config.scale)
        }

        this.text = new TextRenderer()
        this.hitTest = new HitTestEngine<T>(this.coords)
        this.scheduler = new TimeSliceScheduler()
        this.registry = new BlockRendererRegistry<T>()
        this.debugMode = config?.debugMode ?? false
    }

    // ---------------------------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------------------------

    get scale(): number {
        return this.coords.scale
    }

    setScale(scale: number): void {
        this.coords.setScale(scale)
    }

    setDebugMode(debug: boolean): void {
        this.debugMode = debug
    }

    setTextStyle(style: Partial<TextStyleConfig>): void {
        this.text.setStyle(style)
    }

    setCoordinateConfig(config: Partial<CoordinateConfig>): void {
        this.coords.setConfig(config)
    }

    setSchedulerConfig(config: Partial<SchedulerConfig>): void {
        this.scheduler.setConfig(config)
    }

    registerSubHitTester(type: string, tester: SubElementHitTester<T>): void {
        this.hitTest.registerSubTester(type, tester)
    }

    // ---------------------------------------------------------------------------
    // Canvas Operations
    // ---------------------------------------------------------------------------

    /**
     * Clear the entire canvas.
     */
    clear(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.restore()
    }

    /**
     * Render page boundaries (backgrounds, borders, page numbers).
     */
    renderPageLayout(ctx: CanvasRenderingContext2D, totalPages: number, containerWidth: number): void {
        const pageHeightPx = this.coords.pageHeightPx

        for (let i = 0; i < totalPages; i++) {
            const pageY = this.coords.pageOffsetY(i)

            // Page background
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, pageY, containerWidth, pageHeightPx)

            // Page border
            ctx.strokeStyle = this.debugMode ? '#ff0000' : '#d1d5db'
            ctx.lineWidth = this.debugMode ? 5 : 1
            ctx.strokeRect(0, pageY, containerWidth, pageHeightPx)

            // Page number (debug)
            if (this.debugMode) {
                ctx.fillStyle = '#ff0000'
                ctx.font = 'bold 24px monospace'
                ctx.textAlign = 'left'
                ctx.fillText(`PAGE ${i + 1}`, 20, pageY + 30)
            }
        }
        ctx.beginPath()
    }

    // ---------------------------------------------------------------------------
    // Item Rendering
    // ---------------------------------------------------------------------------

    /**
     * Render a single item using the registry.
     * Falls back to a placeholder if no renderer is registered.
     */
    renderItem(ctx: CanvasRenderingContext2D, item: T, options: BaseRenderOptions = {}): void {
        if (!item.bbox) return

        const page = item.page ?? 0
        const rect = this.coords.bboxToPixelRect(item.bbox, page)

        // Delegate to registry
        const handled = this.registry.render(ctx, item, rect, options)

        if (!handled) {
            this.renderPlaceholder(ctx, rect, `Unknown: ${item.type}`)
        }

        // Debug bounding box
        if (this.debugMode) {
            this.renderDebugBox(ctx, item.bbox, page)
        }

        // Selection highlight
        if (options.selected) {
            this.renderSelectionHighlight(ctx, rect)
        }
    }

    /**
     * Render all items synchronously (for fast redraws, e.g. after edit blur).
     */
    renderAllSync(
        ctx: CanvasRenderingContext2D,
        items: T[],
        totalPages: number,
        containerWidth: number,
        optionsFn?: (item: T) => BaseRenderOptions,
    ): void {
        this.clear(ctx)
        this.renderPageLayout(ctx, totalPages, containerWidth)

        for (const item of items) {
            const options = optionsFn ? optionsFn(item) : {}
            this.renderItem(ctx, item, options)
        }
    }

    /**
     * Render items with time-slicing (async, interruptible).
     */
    async renderAllAsync(
        ctx: CanvasRenderingContext2D,
        items: T[],
        totalPages: number,
        containerWidth: number,
        optionsFn?: (item: T) => BaseRenderOptions,
        versionCheck?: () => boolean,
    ): Promise<void> {
        this.clear(ctx)
        this.renderPageLayout(ctx, totalPages, containerWidth)

        await this.scheduler.renderInSlices(
            items,
            (item) => {
                const options = optionsFn ? optionsFn(item) : {}
                this.renderItem(ctx, item, options)
            },
            versionCheck,
        )
    }

    // ---------------------------------------------------------------------------
    // Hit Testing (convenience)
    // ---------------------------------------------------------------------------

    /**
     * Hit test at pixel coordinates.
     */
    hitTestAt(items: T[], pixelX: number, pixelY: number): HitResult<T> {
        return this.hitTest.hitTest(items, pixelX, pixelY)
    }

    /**
     * Find the item at pixel coordinates.
     */
    itemAt(items: T[], pixelX: number, pixelY: number): T | null {
        return this.hitTest.itemAt(items, pixelX, pixelY)
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    /**
     * Clip rendering to a rect, execute callback, then restore.
     */
    withClip(ctx: CanvasRenderingContext2D, rect: PixelRect, render: () => void): void {
        ctx.save()
        ctx.beginPath()
        ctx.rect(rect.x, rect.y, rect.width, rect.height)
        ctx.clip()
        render()
        ctx.restore()
    }

    /**
     * Calculate the pixel rect for a bbox + page.
     */
    getPixelRect(bbox: number[], page: number): PixelRect {
        return this.coords.bboxToPixelRect(bbox, page)
    }

    // ---------------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------------

    private renderPlaceholder(ctx: CanvasRenderingContext2D, rect: PixelRect, label: string): void {
        ctx.save()
        ctx.beginPath()
        ctx.rect(rect.x, rect.y, rect.width, rect.height)
        ctx.clip()

        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

        ctx.fillStyle = '#888888'
        ctx.font = `${this.text.fontSize}px ${this.text.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2)

        ctx.restore()
    }

    private renderDebugBox(ctx: CanvasRenderingContext2D, bbox: number[], page: number): void {
        const rect = this.coords.bboxToPixelRect(bbox, page)

        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 2
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

        const text = `[(${Math.round(bbox[0])}, ${Math.round(bbox[1])}), (${Math.round(bbox[2])}, ${Math.round(bbox[3])})]`
        ctx.fillStyle = '#ff0000'
        ctx.font = '10px monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText(text, rect.x, rect.y - 2)
    }

    private renderSelectionHighlight(ctx: CanvasRenderingContext2D, rect: PixelRect): void {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height)

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'
        ctx.lineWidth = 1
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    }
}
