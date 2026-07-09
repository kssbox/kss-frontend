/**
 * Document Preview Components
 *
 * Components for displaying and editing document ranges with UnifiedParseResult data structure.
 * Formerly "range-preview". Renamed for clarity.
 */

// Main components
export { RangePreviewRenderer } from './RangePreviewRenderer';
export { RangeDiffView } from './RangeDiffView';

// Sub-components
export { DebugPanel } from './components/DebugPanel';
export type { DebugPanelProps } from './components/DebugPanel';

// Hooks - renamed to avoid conflicts with ojson
export {
    useEditMode as useRangeEditMode,
    useDprDetection as useRangeDprDetection,
    calculateEditBoxPosition as calculateRangeEditBoxPosition,
} from './hooks';
export type {
    EditBoxPosition as RangeEditBoxPosition,
    TableCellInfo,
} from './hooks';

// Types
export type {
    VirtualRangeResponse,
    UnifiedParseResult,
    ParseBlock,
    ParseMetadata,
    AssetInfo,
    PageMetadata,
    BlockType,
    BlockAttributes,
    BlockEdit,
    EditRangeRequest,
    EditRangeResponse,
    BlockDiffResult,
    DiffOperation,
    ContentDiffSegment,
    RangePreviewProps,
    RangeDiffProps,
    ProcessingStatus,
    ImageUrlResolver,
    BBox,
} from './types';

export {
    ProcessingStatusLabels,
    getCurrentParseResult,
    isRangeEdited,
    getBlocks,
    findBlockById,
    bboxToObject,
    getImageAssetKey,
} from './types';

// Core modules (for advanced usage)
export {
    TableLayoutManager as RangeTableLayoutManager,
    DiffComputer as RangeDiffComputer,
    ImageLoadManager as RangeImageLoadManager,
} from './core';

export type {
    CellLayout as RangeCellLayout,
    TableLayoutCache as RangeTableLayoutCache,
} from './core';
