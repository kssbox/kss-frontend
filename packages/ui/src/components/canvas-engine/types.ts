/**
 * Canvas Engine - Type Definitions
 *
 * Business-agnostic types for the virtual-scrolling canvas engine.
 * These types form the contract between canvas-engine and any business layer.
 */

// ============================================================================
// Coordinate & Layout
// ============================================================================

/**
 * Configuration for the 0–N normalized coordinate system.
 * All bbox values are expressed in this coordinate space.
 */
export interface CoordinateConfig {
    /** Normalized width of a single page (default: 1000) */
    pageWidth: number
    /** Normalized height of a single page (default: 1000) */
    pageHeight: number
    /** Gap between pages in CSS pixels (default: 20) */
    pageGap: number
}

/** Default coordinate configuration */
export const DEFAULT_COORDINATE_CONFIG: CoordinateConfig = {
    pageWidth: 1000,
    pageHeight: 1000,
    pageGap: 20,
}

/**
 * A rectangle in pixel space (after scale + page offset).
 */
export interface PixelRect {
    x: number
    y: number
    width: number
    height: number
}

/**
 * Bounding box in normalized coordinates (relative to a single page).
 * Values are in 0–pageWidth / 0–pageHeight range.
 */
export interface NormalizedBBox {
    x1: number
    y1: number
    x2: number
    y2: number
}

// ============================================================================
// Canvas Items (generic data model)
// ============================================================================

/**
 * A generic item that can be rendered on the canvas.
 * Business layers extend this with domain-specific fields.
 *
 * @typeParam TType - Union of item type strings (e.g. 'text' | 'table')
 * @typeParam TAttrs - Type-specific attributes
 */
export interface CanvasItem<TType extends string = string, TAttrs = Record<string, unknown>> {
    /** Unique identifier */
    id: string
    /** Item type – used to dispatch to the correct BlockRenderer */
    type: TType
    /** Text content (may be empty for images, etc.) */
    content: string
    /** 0-indexed page number */
    page: number
    /** Bounding box in normalized coordinates [x1, y1, x2, y2] */
    bbox?: number[]
    /** Type-specific attributes */
    attrs?: TAttrs
}

// ============================================================================
// Hit Testing
// ============================================================================

/**
 * Result of a hit test at a pixel position.
 *
 * @typeParam T - The concrete CanvasItem type
 */
export interface HitResult<T extends CanvasItem = CanvasItem> {
    /** The item that was hit, or null */
    item: T | null
    /** What was hit */
    hitType: 'none' | 'item' | 'sub-element'
    /** Optional sub-element info (e.g. table cell) */
    subElement?: {
        row: number
        col: number
        text: string
        bbox: number[]
    }
}

// ============================================================================
// Rendering
// ============================================================================

/**
 * Options passed to a BlockRenderer when rendering a single item.
 */
export interface BaseRenderOptions {
    /** Whether the item is visually selected / hovered */
    selected?: boolean
    /** Whether the item is in edit mode */
    editing?: boolean
    /** Additional renderer-specific options */
    [key: string]: unknown
}

/**
 * A pluggable renderer for a specific item type.
 *
 * @typeParam T - The concrete CanvasItem type this renderer handles
 */
export interface BlockRenderer<T extends CanvasItem = CanvasItem> {
    /** The item type(s) this renderer handles */
    readonly type: string | string[]

    /**
     * Render a single item onto the canvas.
     *
     * @param ctx - The 2D rendering context (already DPR-scaled)
     * @param item - The item to render
     * @param rect - Pre-computed pixel rect (scale + page offset applied)
     * @param options - Render options
     */
    render(
        ctx: CanvasRenderingContext2D,
        item: T,
        rect: PixelRect,
        options: BaseRenderOptions,
    ): void
}

// ============================================================================
// Edit Overlay
// ============================================================================

/**
 * Position for the edit overlay (textarea) in CSS pixels,
 * relative to the scroll container.
 */
export interface EditOverlayPosition {
    left: number
    top: number
    width: number
    height: number
}

// ============================================================================
// Page
// ============================================================================

/**
 * Describes a single page in the virtual list.
 */
export interface PageDescriptor {
    /** 0-indexed page number */
    pageIndex: number
    /** Height of this page in CSS pixels (after scale) */
    heightPx: number
}

// ============================================================================
// Engine Configuration
// ============================================================================

/**
 * Configuration for the CanvasEngine.
 */
export interface CanvasEngineConfig {
    /** Scale factor: maps normalized coords to CSS pixels */
    scale: number
    /** Debug mode */
    debugMode: boolean
    /** Coordinate system configuration */
    coordinates: CoordinateConfig
}

/**
 * Time-slice scheduler configuration.
 */
export interface SchedulerConfig {
    /** Maximum ms per frame before yielding (default: 16) */
    frameBudgetMs: number
    /** Priority map: type → priority (lower = higher priority) */
    priorityMap: Record<string, number>
    /** Default priority for unknown types */
    defaultPriority: number
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
    frameBudgetMs: 16,
    priorityMap: {},
    defaultPriority: 3,
}
