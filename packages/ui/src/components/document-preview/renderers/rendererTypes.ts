/**
 * Document Preview - Renderer Types
 *
 * Extended render options and context for document-preview renderers.
 */

import type { BaseRenderOptions, BlockRenderer, PixelRect } from '../../canvas-engine'
import type { ParseBlock, ContentDiffSegment, DiffOperation } from '../types'
import { DIFF_RENDERER_BG_COLORS } from '../core/diffColors'

/**
 * Extended render options for range-preview blocks.
 * Includes diff state and character-level diff segments.
 */
export interface RangeRenderOptions extends BaseRenderOptions {
    highlight?: boolean
    diffState?: DiffOperation
    contentDiff?: ContentDiffSegment[]
    diffSide?: 'original' | 'current' | 'unified'
}

/**
 * A block renderer specialized for ParseBlock.
 */
export type RangeBlockRenderer = BlockRenderer<ParseBlock>

/**
 * Shared context passed to renderers that need text utilities.
 */
export interface RangeRendererContext {
    fontSize: number
    fontFamily: string
    lineHeight: number
}

export const DEFAULT_RENDERER_CONTEXT: RangeRendererContext = {
    fontSize: 12,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1.5,
}

const ADAPTIVE_MIN_FONT_SIZE = 8
const ADAPTIVE_MAX_FONT_SIZE = 48

/**
 * Detect character aspect ratio (width / height) based on text content.
 * - Pure English/numbers: ~0.5 (narrow chars)
 * - Mixed Chinese/English: ~0.7
 * - Pure Chinese/CJK: ~1.0 (square chars)
 */
function detectAspectRatio(text: string): number {
    if (!text) return 0.5
    let cjkCount = 0
    const len = text.length
    for (let i = 0; i < len; i++) {
        const code = text.charCodeAt(i)
        if (
            (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK Unified Ideographs
            (code >= 0x3400 && code <= 0x4DBF) ||   // CJK Extension A
            (code >= 0xFF00 && code <= 0xFFEF) ||   // Fullwidth Forms
            (code >= 0x3000 && code <= 0x303F)      // CJK Symbols
        ) {
            cjkCount++
        }
    }
    const ratio = cjkCount / len
    if (ratio > 0.8) return 1.0
    if (ratio < 0.2) return 0.5
    return 0.7
}

/**
 * Calculate adaptive font size so text fills the bbox container.
 *
 * Heuristic formula: FontSize ≈ √(W × H / (N × aspectRatio))
 * Then iteratively validated to ensure text fits within bbox height.
 */
export function calculateAdaptiveFontSize(
    width: number,
    height: number,
    text: string,
): { fontSize: number; lineHeight: number } {
    const contentLength = text.replace(/\n/g, '').length
    if (contentLength === 0 || width <= 0 || height <= 0) {
        return { fontSize: DEFAULT_RENDERER_CONTEXT.fontSize, lineHeight: DEFAULT_RENDERER_CONTEXT.lineHeight }
    }

    const aspectRatio = detectAspectRatio(text)
    const newlineCount = (text.match(/\n/g) || []).length
    const CALC_LH = 1.3

    // Area-based heuristic: FontSize ≈ √(W × H / (N × aspectRatio))
    let fontSize = Math.sqrt((width * height) / (contentLength * aspectRatio))

    // Iterative validation: ensure text fits within bbox, grow if underutilized
    for (let i = 0; i < 3; i++) {
        const avgCharWidth = fontSize * aspectRatio
        const charsPerLine = Math.max(1, Math.floor(width / avgCharWidth))
        const totalLines = Math.ceil(contentLength / charsPerLine) + newlineCount
        const neededHeight = totalLines * fontSize * CALC_LH

        if (neededHeight <= height) {
            if (neededHeight < height * 0.6) {
                fontSize *= Math.sqrt(height / neededHeight)
                continue
            }
            break
        }
        // Overflow — scale down proportionally
        fontSize *= (height / neededHeight)
    }

    fontSize = Math.max(ADAPTIVE_MIN_FONT_SIZE, Math.min(ADAPTIVE_MAX_FONT_SIZE, Math.round(fontSize)))

    // Adaptive lineHeight: tighter for larger fonts
    const lineHeight = fontSize >= 24 ? 1.2 : fontSize >= 16 ? 1.3 : 1.4

    return { fontSize, lineHeight }
}

/**
 * Draw wrapped text on a canvas context.
 * Shared utility used by multiple renderers.
 *
 * Optimized: Uses word-based measurement with character width caching
 * instead of character-by-character ctx.measureText() calls.
 * For a 627K-char text, this reduces measureText calls from ~627K to ~10K.
 */

// Per-font character width cache (survives across render calls)
// Limited to MAX_FONT_CACHES entries to prevent unbounded growth
const _charWidthCaches = new Map<string, Map<string, number>>()
const MAX_FONT_CACHES = 10

function getCharWidth(ctx: CanvasRenderingContext2D, char: string, fontKey: string): number {
    let cache = _charWidthCaches.get(fontKey)
    if (!cache) {
        // Evict oldest entry if at capacity
        if (_charWidthCaches.size >= MAX_FONT_CACHES) {
            const firstKey = _charWidthCaches.keys().next().value
            if (firstKey) _charWidthCaches.delete(firstKey)
        }
        cache = new Map<string, number>()
        _charWidthCaches.set(fontKey, cache)
    }
    let w = cache.get(char)
    if (w === undefined) {
        w = ctx.measureText(char).width
        cache.set(char, w)
    }
    return w
}

/** Estimate string width using cached per-char widths (avoids ctx.measureText on full string) */
function estimateStringWidth(ctx: CanvasRenderingContext2D, str: string, fontKey: string): number {
    let total = 0
    for (let i = 0; i < str.length; i++) {
        total += getCharWidth(ctx, str[i], fontKey)
    }
    return total
}

export function drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number,
    fontSize: number,
    lineHeight: number = 1.5,
): number {
    const lh = fontSize * lineHeight
    const fontKey = ctx.font
    let lineY = y

    // Split by newlines first, then process each visual line
    const rawLines = text.split('\n')

    for (let li = 0; li < rawLines.length; li++) {
        if (lineY - y > maxHeight) break

        const rawLine = rawLines[li]

        // Fast path: empty line
        if (!rawLine) {
            lineY += lh
            continue
        }

        // Fast path: short line (< maxWidth by estimate) — skip word-wrap logic
        const estimatedWidth = estimateStringWidth(ctx, rawLine, fontKey)
        if (estimatedWidth <= maxWidth) {
            ctx.fillText(rawLine, x, lineY)
            lineY += lh
            continue
        }

        // Word-wrap: split into segments by spaces/CJK boundaries
        // For CJK-heavy text, fall back to chunk-based wrapping
        let lineStart = 0
        let currentWidth = 0

        for (let ci = 0; ci < rawLine.length; ci++) {
            const charW = getCharWidth(ctx, rawLine[ci], fontKey)

            if (currentWidth + charW > maxWidth && ci > lineStart) {
                // Emit current line
                ctx.fillText(rawLine.slice(lineStart, ci), x, lineY)
                lineY += lh
                if (lineY - y > maxHeight) break
                lineStart = ci
                currentWidth = charW
            } else {
                currentWidth += charW
            }
        }

        // Emit remainder of this raw line
        if (lineStart < rawLine.length && lineY - y <= maxHeight) {
            ctx.fillText(rawLine.slice(lineStart), x, lineY)
            lineY += lh
        }

        if (lineY - y > maxHeight) break
    }
    return lineY - y
}

/**
 * Draw text with character-level diff highlighting.
 * Optimized with character width caching.
 */
export function drawDiffText(
    ctx: CanvasRenderingContext2D,
    segments: ContentDiffSegment[],
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number,
    fontSize: number,
    lineHeight: number = 1.5,
    diffSide?: 'original' | 'current' | 'unified',
): void {
    let currentX = x
    let currentY = y
    const lh = fontSize * lineHeight
    const fontKey = ctx.font

    ctx.textBaseline = 'top'

    for (const segment of segments) {
        const text = segment.text

        // Skip deleted segments in current view
        if (segment.type === 'deleted' && diffSide === 'current') continue
        // Skip added segments in original view
        if (segment.type === 'added' && diffSide === 'original') continue

        for (let i = 0; i < text.length; i++) {
            const char = text[i]
            const charWidth = getCharWidth(ctx, char, fontKey)

            // Wrap
            if (currentX + charWidth > x + maxWidth && char !== '\n') {
                currentX = x
                currentY += lh
                if (currentY - y > maxHeight) return
            }

            // Newline
            if (char === '\n') {
                currentX = x
                currentY += lh
                if (currentY - y > maxHeight) return
                continue
            }

            // Diff background
            if (segment.type === 'added') {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'
                ctx.fillRect(currentX, currentY, charWidth, fontSize * 1.2)
            } else if (segment.type === 'deleted') {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
                ctx.fillRect(currentX, currentY, charWidth, fontSize * 1.2)
            }

            // Text
            ctx.fillStyle = segment.type === 'deleted' ? '#991b1b' : '#000000'
            ctx.fillText(char, currentX, currentY)

            currentX += charWidth
        }
    }
}

/**
 * Helper: clip to rect, run callback, restore.
 */
export function withClip(
    ctx: CanvasRenderingContext2D,
    rect: PixelRect,
    render: () => void,
): void {
    ctx.save()
    ctx.beginPath()
    ctx.rect(rect.x, rect.y, rect.width, rect.height)
    ctx.clip()
    render()
    ctx.restore()
}

/**
 * Diff background color map.
 * Renders a semi-transparent background for blocks with a diff state.
 * Call this at the beginning of a renderer's render() method, before drawing content.
 */

export function renderDiffBackground(
    ctx: CanvasRenderingContext2D,
    rect: PixelRect,
    diffState: string | undefined,
): void {
    if (!diffState || diffState === 'unchanged') return
    const color = DIFF_RENDERER_BG_COLORS[diffState]
    if (!color) return
    ctx.fillStyle = color
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
}
