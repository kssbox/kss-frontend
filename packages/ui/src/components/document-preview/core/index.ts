/**
 * Core modules for Document Preview
 */

export { TableLayoutManager } from './TableLayoutManager';
export type { CellLayout, TableLayoutCache } from './TableLayoutManager';

export { ImageLoadManager } from './ImageLoadManager';

export { DiffComputer } from './DiffComputer'
export type { DiffResult } from './DiffComputer';

export { computeCharDiff } from './CharDiff';
export type { ContentDiffSegment } from '../types';

export {
    DIFF_PALETTE,
    DIFF_OVERLAY_COLORS,
    DIFF_RENDERER_BG_COLORS,
    DIFF_BLOCK_COLORS,
    CHAR_DIFF_STYLES,
    CHAR_DIFF_STYLES_TABLE,
    CELL_DIFF_BORDER,
    DIFF_MARKDOWN_BLOCK_STYLES,
} from './diffColors';
