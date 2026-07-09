/**
 * Type definitions for Range Preview components based on EDIT-SYSTEM.md API spec
 *
 * These types strictly follow the backend API structure with snake_case fields.
 * DO NOT convert to camelCase - maintain API compatibility.
 */

import type { CSSProperties, ReactNode } from 'react'
import type { DiffResult } from './core/DiffComputer'

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Virtual Range Response from GET /knowledge_bases/{kb_id}/documents/{doc_id}/ranges
 */
export interface VirtualRangeResponse {
    range_id: string;
    doc_id: string;
    processing_status: ProcessingStatus;
    parse_result: UnifiedParseResult | null;
    edited_parse_result: UnifiedParseResult | null;
    created_at: number;
    updated_at: number;
}

/**
 * Processing status enum (0-4)
 */
export enum ProcessingStatus {
    PENDING = 0,
    PARSING = 1,
    PARSED = 2,
    EMBEDDING = 3,
    EMBEDDED = 4,
}

/**
 * Processing status labels for UI display
 */
export const ProcessingStatusLabels: Record<ProcessingStatus, string> = {
    [ProcessingStatus.PENDING]: 'Pending',
    [ProcessingStatus.PARSING]: 'Parsing',
    [ProcessingStatus.PARSED]: 'Parsed',
    [ProcessingStatus.EMBEDDING]: 'Embedding',
    [ProcessingStatus.EMBEDDED]: 'Ready',
};

// ============================================================================
// UnifiedParseResult Structure
// ============================================================================

/**
 * Unified parse result structure - the core data model
 */
export interface UnifiedParseResult {
    doc_id?: string;
    metadata?: ParseMetadata;
    blocks?: ParseBlock[];
    pages?: PageMetadata[];
    assets?: Record<string, AssetInfo>;
}

/**
 * Parse metadata - parser information and statistics
 */
export interface ParseMetadata {
    parser: string; // "LangchainParser", "VLMParser", etc.
    mime_type?: string;
    generated_at?: number;
    page_count?: number;
    char_count?: number;
    migrated?: boolean;
    migrated_at?: number;
    extra?: Record<string, unknown>;
}

/**
 * Parse block - the fundamental content unit
 */
export interface ParseBlock {
    id: string; // Snowflake ID, globally unique
    type: BlockType;
    content: string;
    page: number; // 0-indexed page number (required for multi-page layout)
    bbox?: number[]; // [x1, y1, x2, y2] coordinates (0-1000 normalized, relative to page)
    generated_bbox?: boolean; // Internal flag for synthetic bbox blocks
    confidence?: number;
    attrs?: BlockAttributes;
}

/**
 * Block type union
 */
export type BlockType = 'text' | 'heading' | 'table' | 'image' | 'formula' | 'list' | 'code' | 'html';

/**
 * Block render options
 */
export interface BlockRenderOptions {
    selected?: boolean;
    editing?: boolean;
    diffState?: 'added' | 'deleted' | 'updated' | 'moved' | 'unchanged';
    contentDiff?: ContentDiffSegment[]; // Character-level diff segments for 'updated' blocks
}

/**
 * Block type-specific attributes
 */
export interface BlockAttributes {
    // Heading attributes
    level?: number; // 1-6

    // List attributes
    list_type?: 'ordered' | 'unordered';
    list_items?: Array<{ text: string }>;
    items?: Array<string | { text: string }>; // Alternative format from some parsers

    // Table attributes
    rows?: number;
    cols?: number;

    // Code attributes
    language?: string;

    // Image attributes
    asset_key?: string; // Key to lookup in assets map

    // HTML attributes
    html_type?: 'table' | 'div' | 'other';

    // Generic attributes
    [key: string]: unknown;
}

/**
 * Page metadata
 */
export interface PageMetadata {
    page: number;
    width?: number;
    height?: number;
}

/**
 * Asset information (for files stored in MinIO)
 */
export interface AssetInfo {
    type: string; // "markdown", "ojson", "json", "image"
    path: string; // File path in storage
    bucket?: string; // MinIO bucket name
    mime_type?: string;
    size?: number;
}

// ============================================================================
// Edit API Types
// ============================================================================

/**
 * Block edit operation for POST /ranges/{range_id}/edit
 */
export interface BlockEdit {
    block_id: string;
    operation: 'update' | 'delete'; // NOTE: 'insert' not supported yet
    new_content?: string; // Required for 'update' operation (content field)
    new_attrs?: Record<string, unknown>; // Optional: update block attributes (e.g. { html: '...' } for HTML table blocks)
    // Legacy support for UI
    type?: string;
    params?: Record<string, any>;
}

/**
 * Edit request payload
 */
export interface EditRangeRequest {
    edits: BlockEdit[];
}

/**
 * Edit response - returns updated VirtualRangeResponse
 */
export type EditRangeResponse = VirtualRangeResponse;

// ============================================================================
// Diff Computation Types
// ============================================================================

/**
 * Block diff result
 */
export interface BlockDiffResult {
    block_id: string;
    operation: DiffOperation;
    originalBlock?: ParseBlock;
    editedBlock?: ParseBlock;
    contentDiff?: ContentDiffSegment[];
}

/**
 * Diff operation types
 */
export type DiffOperation = 'added' | 'deleted' | 'updated' | 'moved' | 'unchanged';

/**
 * Content-level diff segment (for character-level diff)
 */
export interface ContentDiffSegment {
    type: 'added' | 'deleted' | 'unchanged';
    text: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Image URL resolver callback.
 * Given an AssetInfo, returns a URL that the browser can use to load the image.
 * May return synchronously (e.g. a pre-signed URL) or asynchronously (e.g. fetch blob → objectURL).
 *
 * This is a hook for business layers to inject their own image loading logic
 * (auth headers, proxy endpoints, etc.) without coupling ui to any backend.
 * When not provided, image blocks render a placeholder.
 */
export type ImageUrlResolver = (asset: AssetInfo) => string | Promise<string>;

/**
 * RangePreviewRenderer component props
 */
export interface RangePreviewProps {
    /** Range data from API */
    rangeData: VirtualRangeResponse;

    /** Which version to display */
    mode?: 'original' | 'edited' | 'auto';

    /** Zoom level (1.0 = 100%) */
    zoom?: number;

    /** Show debug overlays (bounding boxes, etc.) */
    debug?: boolean;

    /** Enable edit mode (click to edit) */
    editMode?: boolean;

    /** Enable diff mode (show differences) */
    diffMode?: boolean;

    /** External diff data (if not provided, computed internally) */
    diffData?: DiffResult;

    /** Diff side (when used in comparison) */
    diffSide?: 'original' | 'current' | 'unified';

    /** Block click handler */
    onBlockClick?: (block: ParseBlock) => void;

    /** Block double click handler */
    onBlockDoubleClick?: (block: ParseBlock) => void;

    /** Edit save handler (returns BlockEdit[] to apply) */
    onSaveEdit?: (edits: BlockEdit[]) => void;

    /**
     * Resolve a storage asset reference into a browser-loadable image URL.
     * When not provided, image blocks render as placeholders.
     *
     * For optimisation the component deduplicates calls, caches results,
     * and limits concurrency internally — callers only need to handle
     * the single-asset case.
     */
    resolveImageUrl?: ImageUrlResolver;

    /** Container class name */
    className?: string;

    /** Container style */
    style?: CSSProperties;

    /**
     * Canvas page background color.
     * Default: '#ffffff'.
     */
    canvasBackgroundColor?: string;

    /** Hide the metadata banner (Parser, Pages, Chars, etc.) */
    hideMetadata?: boolean;

    /** Optional footer rendered after the preview content, useful for incremental-loading hints. */
    footerContent?: ReactNode;
}

/**
 * RangeEditor component props
 */
export interface RangeEditorProps {
    /** Range data from API */
    rangeData: VirtualRangeResponse;

    /** Edit save handler */
    onEdit: (edits: BlockEdit[]) => Promise<void>;

    /** Read-only mode */
    readOnly?: boolean;

    /** Zoom level (1.0 = 100%) */
    zoom?: number;

    /** Show debug overlays */
    debug?: boolean;

    /** Container class name */
    className?: string;

    /** Container style */
    style?: CSSProperties;
}

/**
 * RangePreviewDiffView component props
 */
export interface RangeDiffProps {
    /** Range data from API (must have both parse_result and edited_parse_result) */
    rangeData: VirtualRangeResponse;

    /**
     * Diff view mode:
     * - 'split': Side-by-side two-column view (left = original with deletions, right = edited with additions)
     * - 'unified': Single-column inline view with deletions (red) and additions (green) shown together
     * Defaults to 'split'.
     */
    diffViewMode?: 'split' | 'unified';

    /** Zoom level (1.0 = 100%) */
    zoom?: number;

    /** Show debug overlays */
    debug?: boolean;

    /** Diff block click handler */
    onDiffBlockClick?: (diff: BlockDiffResult) => void;

    /** Resolve image URL for image blocks (same as RangePreviewProps) */
    resolveImageUrl?: ImageUrlResolver;

    /** Show only diff blocks without whitespace gaps */
    diffOnly?: boolean;

    /** Hide the metadata banner (Parser, Pages, Chars, etc.) */
    hideMetadata?: boolean;

    /** Container class name */
    className?: string;

    /** Container style */
    style?: CSSProperties;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Canvas rendering context
 */
export interface RenderContext {
    ctx: CanvasRenderingContext2D;
    dpr: number;
    zoom: number;
    containerWidth: number;
    containerHeight: number;
    debug: boolean;
}

/**
 * Block rendering options for canvas
 */
export interface CanvasBlockRenderOptions {
    highlight?: boolean;
    diffState?: DiffOperation;
    selected?: boolean;
    editing?: boolean;
    contentDiff?: ContentDiffSegment[];
}

/**
 * Coordinate system bounds (0-1000 normalized)
 */
export interface BBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const RENDERABLE_ATTR_KEYS = [
    'list_items',
    'list_type',
    'rows',
    'cols',
    'asset_key',
    'html_type',
    'html',
    'level',
    'language',
] as const;

/**
 * Helper to validate bbox array
 */
export function isValidBboxArray(bbox?: number[]): boolean {
    if (!Array.isArray(bbox) || bbox.length !== 4) return false;
    const [x1, y1, x2, y2] = bbox;
    if (![x1, y1, x2, y2].every(v => Number.isFinite(v))) return false;
    return x2 > x1 && y2 > y1;
}

/**
 * Helper to decide markdown fallback for blocks without renderable attrs/bbox
 */
export function shouldRenderMarkdownFallback(block: ParseBlock): boolean {
    const hasRenderableAttrs = RENDERABLE_ATTR_KEYS.some(
        key => block.attrs && block.attrs[key] !== undefined && block.attrs[key] !== null
    );
    const hasContent = !!block.content?.trim();
    return block.generated_bbox === true && !hasRenderableAttrs && hasContent;
}

/**
 * Helper to convert bbox array to object
 */
export function bboxToObject(bbox: number[]): BBox | null {
    if (!bbox || bbox.length !== 4) return null;
    return {
        x1: bbox[0],
        y1: bbox[1],
        x2: bbox[2],
        y2: bbox[3],
    };
}

/**
 * Helper to get current parse result based on mode
 */
export function getCurrentParseResult(
    rangeData: VirtualRangeResponse,
    mode: 'original' | 'edited' | 'auto' = 'auto'
): UnifiedParseResult | null {
    if (mode === 'original') {
        return rangeData.parse_result;
    }
    if (mode === 'edited') {
        return rangeData.edited_parse_result;
    }
    // auto mode: prefer edited if available
    return rangeData.edited_parse_result || rangeData.parse_result;
}

/**
 * Helper to check if range has edits
 */
export function isRangeEdited(rangeData: VirtualRangeResponse): boolean {
    return rangeData.edited_parse_result !== null;
}

/**
 * Helper to get all blocks from parse result
 * Normalizes page values from 1-indexed (API) to 0-indexed (internal)
 */
export function getBlocks(parseResult: UnifiedParseResult | null): ParseBlock[] {
    const blocks = parseResult?.blocks || [];
    const DEFAULT_MARGIN = 40;
    const DEFAULT_GAP = 12;
    const DEFAULT_PAGE_HEIGHT = 1000;
    const DEFAULT_X1 = 40;
    const DEFAULT_X2 = 960;
    const DEFAULT_HTML_TOP_MARGIN = 16;
    const DEFAULT_HTML_BOTTOM_GAP = 16;

    const observedPages = [
        ...blocks.map(block => block.page),
        ...(parseResult?.pages || []).map(page => page.page),
    ].filter((page): page is number => Number.isFinite(page));
    const pageBase = observedPages.includes(0) ? 0 : 1;

    const pageCursorMap = new Map<number, number>();

    const getCursor = (page: number): number => {
        return pageCursorMap.get(page) ?? DEFAULT_MARGIN;
    };

    const setCursor = (page: number, y: number): void => {
        pageCursorMap.set(page, y);
    };

    const estimateHtmlOverlayHeight = (block: ParseBlock): number => {
        const html = typeof block.attrs?.html === 'string' ? block.attrs.html : '';
        const textLineCount = Math.max(
            1,
            (block.content || '')
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean).length,
        );
        const rowMatchCount = html.match(/<tr\b/gi)?.length ?? 0;
        const cellMatchCount = html.match(/<t[hd]\b/gi)?.length ?? 0;
        const estimatedRowCount = rowMatchCount || Number(block.attrs?.rows) || 1;
        const estimatedColCount = Math.max(1, Number(block.attrs?.cols) || Math.ceil(cellMatchCount / estimatedRowCount) || 1);
        const wrappedLineCount = Math.max(textLineCount, Math.ceil((block.content || '').length / Math.max(24, estimatedColCount * 12)));
        return Math.max(
            120,
            DEFAULT_HTML_TOP_MARGIN
                + estimatedRowCount * 28
                + wrappedLineCount * 18
                + DEFAULT_HTML_BOTTOM_GAP,
        );
    };

    return blocks.map(block => {
        const rawPage = Number.isFinite(block.page) ? block.page : pageBase;
        const basePage = Math.max(0, rawPage - pageBase);
        const hasRenderableAttrs = RENDERABLE_ATTR_KEYS.some(
            key => block.attrs && block.attrs[key] !== undefined && block.attrs[key] !== null
        );
        const hasHtmlOverlay =
            typeof block.attrs?.html === 'string'
            && block.attrs.html.trim().length > 0
            && (block.attrs?.html_type === 'table' || /<table/i.test(block.attrs.html));
        const hasContent = !!block.content?.trim();

        if (isValidBboxArray(block.bbox)) {
            const bbox = block.bbox as number[];
            const nextCursor = bbox[3] + DEFAULT_GAP + (hasHtmlOverlay ? DEFAULT_HTML_BOTTOM_GAP : 0);
            setCursor(basePage, Math.max(getCursor(basePage), nextCursor));
            return {
                ...block,
                page: basePage,
            };
        }

        if (!hasContent && !hasRenderableAttrs) {
            return {
                ...block,
                page: basePage,
            };
        }

        const contentLength = (block.content || '').length;
        const lineCount = Math.max(1, Math.ceil(contentLength / 50));
        const lineHeight = 18;
        const minHeight = 24;
        const height = hasHtmlOverlay
            ? estimateHtmlOverlayHeight(block)
            : Math.max(minHeight, lineCount * lineHeight);

        let page = basePage;
        let yStart = getCursor(page);

        if (hasHtmlOverlay && !pageCursorMap.has(page)) {
            yStart = DEFAULT_HTML_TOP_MARGIN;
        }

        if (height <= DEFAULT_PAGE_HEIGHT - DEFAULT_MARGIN && yStart + height > DEFAULT_PAGE_HEIGHT - DEFAULT_MARGIN) {
            page = page + 1;
            yStart = hasHtmlOverlay ? DEFAULT_HTML_TOP_MARGIN : DEFAULT_MARGIN;
        }

        const bbox: number[] = [DEFAULT_X1, yStart, DEFAULT_X2, yStart + height];
        setCursor(page, yStart + height + DEFAULT_GAP);

        return {
            ...block,
            page,
            bbox,
            generated_bbox: true,
        };
    });
}

/**
 * Helper to find block by ID
 */
export function findBlockById(blocks: ParseBlock[], blockId: string): ParseBlock | undefined {
    return blocks.find(b => b.id === blockId);
}

/**
 * Helper to extract the image asset key from a block.
 * Prefers `attrs.asset_key`, falls back to `attrs.format`
 * (used by some RAG parsers as asset reference ID).
 */
export function getImageAssetKey(block: ParseBlock): string | undefined {
    return (block.attrs?.asset_key ?? block.attrs?.format) as string | undefined;
}
