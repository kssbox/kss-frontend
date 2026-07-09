/**
 * Canvas Engine - Public API
 *
 * A business-agnostic, virtual-scrolling canvas engine for rendering
 * multi-page documents with pluggable block renderers.
 *
 * Usage:
 *   1. Create a CanvasEngine
 *   2. Register BlockRenderers for your item types
 *   3. Render using VirtualPageList or PageCanvas
 */

// Types
export type {
    CoordinateConfig,
    PixelRect,
    NormalizedBBox,
    CanvasItem,
    HitResult,
    BaseRenderOptions,
    BlockRenderer,
    EditOverlayPosition,
    PageDescriptor,
    CanvasEngineConfig,
    SchedulerConfig,
} from './types'

export {
    DEFAULT_COORDINATE_CONFIG,
    DEFAULT_SCHEDULER_CONFIG,
} from './types'

// Core classes
export { CanvasEngine } from './CanvasEngine'
export { CoordinateSystem } from './CoordinateSystem'
export { TextRenderer, type TextStyleConfig, DEFAULT_TEXT_STYLE } from './TextRenderer'
export { HitTestEngine, type SubElementHitTester } from './HitTestEngine'
export { TimeSliceScheduler } from './TimeSliceScheduler'
export { BlockRendererRegistry } from './BlockRendererRegistry'

// Components
export { PageCanvas, type PageCanvasProps } from './PageCanvas'
export { VirtualPageList, type VirtualPageListProps } from './VirtualPageList'
