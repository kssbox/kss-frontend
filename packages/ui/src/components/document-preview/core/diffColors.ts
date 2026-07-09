/**
 * Diff Color Constants — Single Source of Truth
 *
 * All diff-related colors/styles used across the document-preview module.
 * Import from here instead of defining local constants.
 */

import type { CSSProperties } from 'react'

// ─── Base Color Palette ─────────────────────────────────────────────────────
// These raw rgba values are the source for all derived constants below.

export const DIFF_PALETTE = {
    added: { r: 34, g: 197, b: 94 },   // green-500
    deleted: { r: 239, g: 68, b: 68 },  // red-500
    updated: { r: 234, g: 179, b: 8 },  // yellow-500
    moved: { r: 147, g: 51, b: 234 },   // purple-500 (canvas overlay)
    movedAlt: { r: 168, g: 85, b: 247 }, // purple-500 variant (markdown mode)
} as const

function rgba(c: { r: number; g: number; b: number }, a: number): string {
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`
}

function rgb(c: { r: number; g: number; b: number }): string {
    return `rgb(${c.r}, ${c.g}, ${c.b})`
}

// ─── Canvas Overlay (DiffOverlayRenderer) ────────────────────────────────────
// Used by DiffOverlayRenderer.ts for block-level background + border on canvas.

export const DIFF_OVERLAY_COLORS: Record<string, { bg: string; border: string }> = {
    unchanged: { bg: 'transparent', border: 'transparent' },
    added: { bg: rgba(DIFF_PALETTE.added, 0.2), border: rgba(DIFF_PALETTE.added, 0.5) },
    deleted: { bg: rgba(DIFF_PALETTE.deleted, 0.2), border: rgba(DIFF_PALETTE.deleted, 0.5) },
    updated: { bg: rgba(DIFF_PALETTE.updated, 0.2), border: rgba(DIFF_PALETTE.updated, 0.5) },
    moved: { bg: rgba(DIFF_PALETTE.moved, 0.2), border: rgba(DIFF_PALETTE.moved, 0.5) },
}

// ─── Canvas Renderer Background (rendererTypes) ──────────────────────────────
// Used by block renderers (Text, Heading, List, etc.) before drawing content.

export const DIFF_RENDERER_BG_COLORS: Record<string, string> = {
    added: rgba(DIFF_PALETTE.added, 0.15),
    deleted: rgba(DIFF_PALETTE.deleted, 0.15),
    updated: rgba(DIFF_PALETTE.updated, 0.15),
    moved: 'rgba(59, 130, 246, 0.15)', // blue-500 at 0.15 (intentionally different from overlay)
}

// ─── HTML Table Block Overlay (HtmlTableCellEditor) ─────────────────────
// Block-level colors for HTML table overlays — must match DIFF_OVERLAY_COLORS.

export const DIFF_BLOCK_COLORS = DIFF_OVERLAY_COLORS

// ─── Character-Level Inline Diff Styles ──────────────────────────────────────
// Used by DiffHighlightRenderer (markdown mode) and HtmlTableCellEditor (table cells).

export const CHAR_DIFF_STYLES: Record<string, CSSProperties> = {
    added: {
        backgroundColor: rgba(DIFF_PALETTE.added, 0.2),
        textDecoration: 'none',
        borderRadius: '2px',
        padding: '0 1px',
    },
    deleted: {
        backgroundColor: rgba(DIFF_PALETTE.deleted, 0.2),
        borderRadius: '2px',
        padding: '0 1px',
    },
}

// HtmlTableCellEditor uses slightly more opaque char diff (0.3 vs 0.2)
export const CHAR_DIFF_STYLES_TABLE: Record<string, CSSProperties> = {
    added: {
        backgroundColor: rgba(DIFF_PALETTE.added, 0.3),
        borderRadius: '2px',
        padding: '0 1px',
    },
    deleted: {
        backgroundColor: rgba(DIFF_PALETTE.deleted, 0.3),
        borderRadius: '2px',
        padding: '0 1px',
    },
}

// ─── Cell Diff Border (HtmlTableCellEditor) ──────────────────────────────────

export const CELL_DIFF_BORDER: Record<string, string> = {
    original: rgba(DIFF_PALETTE.deleted, 0.45),
    current: rgba(DIFF_PALETTE.added, 0.45),
    unified: rgba(DIFF_PALETTE.added, 0.45),
}

// ─── Full Markdown Mode Block Styles (RangePreviewRenderer) ──────────────────
// Used in the full-markdown fallback rendering path.

export const DIFF_MARKDOWN_BLOCK_STYLES: Record<string, CSSProperties> = {
    added: { backgroundColor: rgba(DIFF_PALETTE.added, 0.1), borderLeft: `3px solid ${rgb(DIFF_PALETTE.added)}`, paddingLeft: '12px' },
    deleted: { backgroundColor: rgba(DIFF_PALETTE.deleted, 0.1), borderLeft: `3px solid ${rgb(DIFF_PALETTE.deleted)}`, paddingLeft: '12px', textDecoration: 'line-through', opacity: 0.7 },
    updated: { backgroundColor: rgba(DIFF_PALETTE.updated, 0.1), borderLeft: `3px solid ${rgb(DIFF_PALETTE.updated)}`, paddingLeft: '12px' },
    moved: { backgroundColor: rgba(DIFF_PALETTE.movedAlt, 0.1), borderLeft: `3px solid ${rgb(DIFF_PALETTE.movedAlt)}`, paddingLeft: '12px' },
}
