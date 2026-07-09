import type React from 'react'
import type { ParseBlock } from './types'
import { shouldRenderMarkdownFallback } from './types'
import { DEFAULT_COORDINATE_CONFIG } from '../canvas-engine'

export const DEFAULT_ZOOM = 1
export const DEFAULT_BASE_SIZE = DEFAULT_COORDINATE_CONFIG.pageWidth // 1000
const CHINESE_SECTION_HEADING_PATTERN = /^\s*[一二三四五六七八九十百千]+、[^\n]+$/gm
export const DOCUMENT_SURFACE_STYLE: React.CSSProperties = {
    background: '#f8fafc',
    color: '#111827',
}
export const DOCUMENT_PAPER_STYLE: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--surface-foreground, #111827)',
}
export const DOCUMENT_SHEET_LABEL_STYLE: React.CSSProperties = {
    color: 'var(--surface-foreground, #374151)',
}
export const INLINE_EDIT_TEXTAREA_CLASS_NAME = 'absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-0 shadow-none outline-none focus:outline-none'
export const INLINE_EDIT_TEXTAREA_STYLE: React.CSSProperties = {
    color: 'inherit',
    background: 'transparent',
    minHeight: 0,
    height: '100%',
    maxHeight: 'none',
    overflow: 'auto',
    font: 'inherit',
    lineHeight: 'inherit',
    caretColor: 'currentColor',
}

export interface EditableFlowBlock extends ParseBlock {
    sourceBlockId: string
    editableStart: number
    editableEnd: number
    segmented: boolean
}

/**
 * Resolve the effective rendering type for a block.
 * If attrs.html exists, override the block type so the engine dispatches
 * to the correct renderer (table or html) instead of the original type.
 * This keeps CanvasEngine generic — all data transformation is front-loaded.
 */
export function resolveBlockType(block: ParseBlock): ParseBlock['type'] {
    if (typeof block.attrs?.html === 'string' && block.attrs.html) {
        return /<table/i.test(block.attrs.html) ? 'table' : 'html'
    }
    return block.type
}

/**
 * Check if a block should be treated as a table for rendering.
 */
export function isEffectiveTable(block: ParseBlock): boolean {
    return resolveBlockType(block) === 'table'
}

/**
 * Check if a block has attrs.html with a <table> tag.
 * These blocks are rendered as DOM overlays (not via canvas TableLayoutManager).
 */
export function isHtmlTableBlock(block: ParseBlock): boolean {
    return typeof block.attrs?.html === 'string' && /<table/i.test(block.attrs.html as string)
}

export function isGeneratedHtmlTableFlowBlock(block: ParseBlock): boolean {
    return block.generated_bbox === true && isHtmlTableBlock(block)
}

export function shouldUseRenderedMarkdownEditor(block: ParseBlock): boolean {
    return !isGeneratedHtmlTableFlowBlock(block)
        && resolveBlockType(block) !== 'image'
        && Array.isArray(block.bbox)
        && block.bbox.length === 4
        && Number.isFinite(block.page)
}

/**
 * Convert single \n to hard line breaks (two trailing spaces + \n) for markdown rendering.
 * Preserves \n\n (paragraph breaks) as-is.
 */
export function normalizeNewlinesForMarkdown(content: string): string {
    // Use lookbehind for two spaces to avoid double-application (idempotent).
    // Also handles \r\n by normalizing to \n first.
    return content.replace(/\r\n/g, '\n').replace(/(?<! {2})(?<!\n)\n(?!\n)/g, '  \n')
}

function getSectionHeadingMatches(content: string): Array<{ index: number; text: string }> {
    return Array.from(content.matchAll(new RegExp(CHINESE_SECTION_HEADING_PATTERN))).flatMap((match) => {
        if (typeof match.index !== 'number') {
            return []
        }
        return [{ index: match.index, text: match[0] }]
    })
}

export function splitEditableFlowBlock(block: ParseBlock): EditableFlowBlock[] {
    const content = block.content || ''
    const formFeedRanges: Array<{ start: number; end: number; pageOffset: number }> = []
    let formFeedStart = 0
    let pageOffset = 0

    for (const match of content.matchAll(/\f/g)) {
        formFeedRanges.push({ start: formFeedStart, end: match.index ?? formFeedStart, pageOffset })
        formFeedStart = (match.index ?? formFeedStart) + 1
        pageOffset += 1
    }
    if (pageOffset > 0) {
        formFeedRanges.push({ start: formFeedStart, end: content.length, pageOffset })
    }

    if (shouldRenderMarkdownFallback(block) && formFeedRanges.length > 1) {
        const basePage = Number.isFinite(block.page) ? block.page : 0
        const segmentedBlocks = formFeedRanges.flatMap((range) => {
            const rawSlice = content.slice(range.start, range.end)
            const leadingWhitespaceLength = rawSlice.match(/^\s*/)?.[0].length ?? 0
            const trailingWhitespaceLength = rawSlice.match(/\s*$/)?.[0].length ?? 0
            const editableStart = range.start + leadingWhitespaceLength
            const editableEnd = Math.max(editableStart, range.end - trailingWhitespaceLength)
            const segmentContent = content.slice(editableStart, editableEnd)

            if (!segmentContent.trim()) {
                return []
            }

            return [{
                ...block,
                id: `${block.id}::page:${range.pageOffset}`,
                page: basePage + range.pageOffset,
                content: segmentContent,
                sourceBlockId: block.id,
                editableStart,
                editableEnd,
                segmented: true,
            }]
        })

        if (segmentedBlocks.length > 0) {
            return segmentedBlocks
        }
    }

    const headingMatches = getSectionHeadingMatches(content)

    if (!shouldRenderMarkdownFallback(block) || headingMatches.length < 2) {
        return [{
            ...block,
            sourceBlockId: block.id,
            editableStart: 0,
            editableEnd: content.length,
            segmented: false,
        }]
    }

    const rawRanges: Array<{ start: number; end: number }> = []
    let cursor = 0

    headingMatches.forEach((match, index) => {
        if (match.index > cursor && content.slice(cursor, match.index).trim()) {
            rawRanges.push({ start: cursor, end: match.index })
        }

        const nextStart = headingMatches[index + 1]?.index ?? content.length
        rawRanges.push({ start: match.index, end: nextStart })
        cursor = nextStart
    })

    if (cursor < content.length && content.slice(cursor).trim()) {
        rawRanges.push({ start: cursor, end: content.length })
    }

    const segmentedBlocks = rawRanges.flatMap((range, index) => {
        const rawSlice = content.slice(range.start, range.end)
        const leadingWhitespaceLength = rawSlice.match(/^\s*/)?.[0].length ?? 0
        const trailingWhitespaceLength = rawSlice.match(/\s*$/)?.[0].length ?? 0
        const editableStart = range.start + leadingWhitespaceLength
        const editableEnd = Math.max(editableStart, range.end - trailingWhitespaceLength)
        const segmentContent = content.slice(editableStart, editableEnd)

        if (!segmentContent.trim()) {
            return []
        }

        return [{
            ...block,
            id: `${block.id}::segment:${index}`,
            content: segmentContent,
            sourceBlockId: block.id,
            editableStart,
            editableEnd,
            segmented: true,
        }]
    })

    return segmentedBlocks.length > 0
        ? segmentedBlocks
        : [{
            ...block,
            sourceBlockId: block.id,
            editableStart: 0,
            editableEnd: content.length,
            segmented: false,
        }]
}

