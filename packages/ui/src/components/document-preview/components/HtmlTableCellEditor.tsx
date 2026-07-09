/**
 * HtmlTableCellEditor
 *
 * Excel-style HTML table editor. Parses an HTML table string into a React table,
 * lets the user click cells to edit their text content, then emits the updated HTML
 * (only textContent modified – HTML structure preserved).
 *
 * Used by RangePreviewRenderer for table blocks with attrs.html (e.g. MineruParser output).
 */

import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { computeCharDiff } from '../core/CharDiff'
import type { ContentDiffSegment } from '../types'
import {
    DIFF_BLOCK_COLORS,
    CHAR_DIFF_STYLES_TABLE,
    CELL_DIFF_BORDER,
} from '../core/diffColors'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CellData {
    row: number
    col: number
    text: string
    isHeader: boolean
    colSpan: number
    rowSpan: number
}

interface ProgressiveTableCacheEntry {
    html: string
    rows: CellData[][]
    complete: boolean
    nextRowIndex: number
    regex: RegExp
    parsing: boolean
    listeners: Set<() => void>
    lastUsed: number
}

const TABLE_PARSE_CACHE_LIMIT = 6
const TABLE_PARSE_CHUNK_ROWS = 32
const TABLE_VIRTUALIZE_AFTER_ROWS = 160
const TABLE_RENDER_OVERSCAN_ROWS = 24
const TABLE_ROW_HEIGHT_ESTIMATE = 28
const TABLE_EDITOR_SURFACE = 'var(--surface-background, #ffffff)'
const TABLE_EDITOR_FOREGROUND = 'var(--surface-foreground, #111827)'
const TABLE_EDITOR_BORDER = 'var(--table-row-border, #d0d0d0)'
const TABLE_EDITOR_HEADER_BG = 'var(--table-header-bg, #f3f4f6)'
const TABLE_EDITOR_HEADER_FG = 'var(--table-header-fg, var(--surface-foreground, #111827))'
const TABLE_EDITOR_CELL_BG = 'var(--table-row-bg, #ffffff)'
const TABLE_EDITOR_CELL_FG = 'var(--table-cell-fg, var(--surface-foreground, #111827))'
const TABLE_EDITOR_ACTIVE_BG = 'color-mix(in oklab, var(--ring, #3b82f6) 16%, var(--surface-background, #ffffff))'
const TABLE_EDITOR_ACTIVE_FG = 'var(--surface-foreground, #111827)'
const TABLE_EDITOR_ACTIVE_BORDER = 'var(--ring, #3b82f6)'

const tableParseCache = new Map<string, ProgressiveTableCacheEntry>()
let decoderTextarea: HTMLTextAreaElement | null = null

function decodeHtmlText(text: string): string {
    const withoutTags = text.replace(/<[^>]*>/g, '')
    if (!/[&\\]/.test(withoutTags)) return withoutTags.trim()
    if (!decoderTextarea) {
        decoderTextarea = document.createElement('textarea')
    }
    decoderTextarea.innerHTML = withoutTags
    return decoderTextarea.value.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16))).trim()
}

function parseSpan(attrText: string, attrName: 'colspan' | 'rowspan'): number {
    const match = attrText.match(new RegExp(`${attrName}=["']?(\\d+)`, 'i'))
    const value = match ? Number.parseInt(match[1] ?? '', 10) : 1
    return Number.isFinite(value) && value > 0 ? value : 1
}

function parseHtmlTableRow(rowHtml: string, rowIndex: number): CellData[] {
    const cells: CellData[] = []
    const cellRegex = /<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/gi
    let cellMatch: RegExpExecArray | null
    let colIndex = 0

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        const tagName = (cellMatch[1] ?? '').toLowerCase()
        const attrText = cellMatch[2] ?? ''
        cells.push({
            row: rowIndex,
            col: colIndex,
            text: decodeHtmlText(cellMatch[3] ?? ''),
            isHeader: tagName === 'th',
            colSpan: parseSpan(attrText, 'colspan'),
            rowSpan: parseSpan(attrText, 'rowspan'),
        })
        colIndex += 1
    }

    return cells
}

function evictTableParseCacheIfNeeded() {
    if (tableParseCache.size <= TABLE_PARSE_CACHE_LIMIT) return
    const entries = Array.from(tableParseCache.entries()).sort((left, right) => left[1].lastUsed - right[1].lastUsed)
    for (const [key, entry] of entries.slice(0, tableParseCache.size - TABLE_PARSE_CACHE_LIMIT)) {
        if (entry.listeners.size === 0) {
            tableParseCache.delete(key)
        }
    }
}

function getTableParseEntry(html: string): ProgressiveTableCacheEntry {
    const cached = tableParseCache.get(html)
    if (cached) {
        cached.lastUsed = Date.now()
        return cached
    }

    const entry: ProgressiveTableCacheEntry = {
        html,
        rows: [],
        complete: false,
        nextRowIndex: 0,
        regex: /<tr\b[^>]*>[\s\S]*?<\/tr>/gi,
        parsing: false,
        listeners: new Set(),
        lastUsed: Date.now(),
    }
    tableParseCache.set(html, entry)
    evictTableParseCacheIfNeeded()
    return entry
}

function notifyTableParseListeners(entry: ProgressiveTableCacheEntry) {
    for (const listener of entry.listeners) {
        listener()
    }
}

function scheduleTableParse(entry: ProgressiveTableCacheEntry) {
    if (entry.complete || entry.parsing) return
    entry.parsing = true

    const runChunk = () => {
        if (entry.listeners.size === 0) {
            entry.parsing = false
            return
        }

        const startedAt = performance.now()
        let parsedRows = 0
        let rowMatch: RegExpExecArray | null

        while (parsedRows < TABLE_PARSE_CHUNK_ROWS && performance.now() - startedAt < 12) {
            rowMatch = entry.regex.exec(entry.html)
            if (!rowMatch) {
                entry.complete = true
                entry.parsing = false
                notifyTableParseListeners(entry)
                return
            }

            const cells = parseHtmlTableRow(rowMatch[0], entry.nextRowIndex)
            if (cells.length > 0) {
                entry.rows.push(cells)
            }
            entry.nextRowIndex += 1
            parsedRows += 1
        }

        notifyTableParseListeners(entry)
        window.setTimeout(runChunk, 0)
    }

    window.setTimeout(runChunk, 0)
}

export interface HtmlTableCellRef {
    row: number
    col: number
    text: string
    width?: number
    height?: number
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

/**
 * Parse an HTML string containing a <table> into a 2D CellData array.
 * Only the first found <table> is used.
 * Uses HTMLTableElement.rows (scoped to the immediate table) to avoid
 * traversing nested tables via deep querySelectorAll.
 */
function parseHtmlTable(html: string): CellData[][] {
    const div = document.createElement('div')
    div.innerHTML = html
    const table = div.querySelector('table') as HTMLTableElement | null
    if (!table) return []

    const rows: CellData[][] = []
    // table.rows is scoped to the immediate table (not nested tables)
    const rowCount = table.rows.length
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx += 1) {
        const tr = table.rows[rowIdx]
        if (!tr) continue
        const cells: CellData[] = []
        for (let colIdx = 0; colIdx < tr.cells.length; colIdx += 1) {
            const cell = tr.cells[colIdx]
            if (!cell) continue
            cells.push({
                row: rowIdx,
                col: colIdx,
                text: cell.textContent?.trim() ?? '',
                isHeader: cell.tagName.toLowerCase() === 'th',
                colSpan: cell.colSpan || 1,
                rowSpan: cell.rowSpan || 1,
            })
        }
        if (cells.length > 0) rows.push(cells)
    }
    return rows
}

/**
 * Update a single cell's textContent in the HTML, returning the modified HTML string.
 * All HTML structure (tags, attributes, colspan, etc.) is preserved.
 * Uses HTMLTableElement.rows (scoped to immediate table) to avoid nested-table issues.
 */
function updateCellTextInHtml(html: string, row: number, col: number, text: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    const table = div.querySelector('table') as HTMLTableElement | null
    if (!table) return html
    const targetRow = table.rows[row]
    if (!targetRow) return html
    const targetCell = targetRow.cells[col] as HTMLTableCellElement | undefined
    if (!targetCell) return html
    const currentText = targetCell.textContent?.trim() ?? ''
    if (currentText === text.trim()) return html
    // Only set textContent – preserves surrounding HTML outside the cell
    targetCell.textContent = text
    return div.innerHTML
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface HtmlTableCellEditorProps {
    /** The HTML string from attrs.html */
    html: string
    /** Absolute position inside the scroll container (pixels) */
    left: number
    top: number
    width: number
    /** Called when the user finishes editing (blur or keyboard save). Receives updated HTML. */
    onSave: (newHtml: string) => void
    /** Called when the editor should be unmounted */
    onClose: () => void
    /** View-only mode: renders the table without edit interactions */
    viewOnly?: boolean
    /** Diff state of the containing block (for visual highlighting) */
    diffState?: 'added' | 'deleted' | 'updated' | 'moved' | 'unchanged'
    /** HTML from the other side (original or edited) for per-cell comparison */
    compareHtml?: string
    /** Which side of the diff this is rendering (affects highlight colors) */
    diffSide?: 'original' | 'current' | 'unified'
    /** Render in normal document flow instead of absolute overlay positioning */
    inline?: boolean
    /** In diff-only mode, hide unchanged rows and keep only changed rows plus header context */
    diffOnly?: boolean
    /** Called in view mode when the user chooses a specific cell to edit */
    onRequestEditCell?: (cell: HtmlTableCellRef) => void
    /** Preselect a cell after the editor enters edit mode */
    initialEditingCell?: HtmlTableCellRef | null
}

/**
 * Render character-level diff segments inline inside a table cell.
 * - original side: shows deleted (red), skips added
 * - current/unified side: shows added (green), skips deleted (unified also shows deleted)
 */
function renderCharDiff(segments: ContentDiffSegment[], side: 'original' | 'current' | 'unified'): React.ReactNode {
    return segments.map((seg, i) => {
        if (seg.type === 'unchanged') return <span key={i}>{seg.text}</span>
        if (side === 'original') {
            if (seg.type === 'deleted') return <span key={i} style={CHAR_DIFF_STYLES_TABLE.deleted}>{seg.text}</span>
            return null // skip 'added' on original side
        }
        if (side === 'current') {
            if (seg.type === 'added') return <span key={i} style={CHAR_DIFF_STYLES_TABLE.added}>{seg.text}</span>
            return null // skip 'deleted' on current side
        }
        // unified: show both
        if (seg.type === 'deleted') return <span key={i} style={CHAR_DIFF_STYLES_TABLE.deleted}>{seg.text}</span>
        if (seg.type === 'added') return <span key={i} style={CHAR_DIFF_STYLES_TABLE.added}>{seg.text}</span>
        return null
    })
}

export function HtmlTableCellEditor({
    html,
    left,
    top,
    width,
    onSave,
    onClose,
    viewOnly = false,
    diffState,
    compareHtml,
    diffSide,
    inline = false,
    diffOnly = false,
    onRequestEditCell,
    initialEditingCell,
}: HtmlTableCellEditorProps) {
    const TABLE_BOTTOM_PADDING = 16
    const initialCacheEntry = getTableParseEntry(html)
    const [tableData, setTableData] = useState<CellData[][]>(() => initialCacheEntry.rows.slice())
    const [isTableParseComplete, setIsTableParseComplete] = useState(initialCacheEntry.complete)
    const [scrollTop, setScrollTop] = useState(0)
    const [viewportHeight, setViewportHeight] = useState(480)
    const [currentHtml, setCurrentHtml] = useState(html)
    const [editingCell, setEditingCell] = useState<HtmlTableCellRef | null>(null)
    const [cellEditValue, setCellEditValue] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const activeParseEntryRef = useRef<ProgressiveTableCacheEntry | null>(initialCacheEntry)

    // Parse the immutable original html prop once for stable diff comparison.
    // Do NOT use `tableData` here — it is mutable and changes during user edits.
    const needsCellDiff = diffState === 'updated' && Boolean(compareHtml) && Boolean(diffSide)
    const originalData = React.useMemo(
        () => needsCellDiff ? parseHtmlTable(html) : tableData,
        [html, needsCellDiff, tableData],
    )

    // Per-cell character-level diff: map of "row,col" → ContentDiffSegment[]
    const cellDiffMap = React.useMemo(() => {
        if (!needsCellDiff || !compareHtml || !diffSide) return null
        const compareData = parseHtmlTable(compareHtml)
        const map = new Map<string, ContentDiffSegment[]>()

        originalData.forEach((rowCells, rowIdx) => {
            rowCells.forEach((cell, colIdx) => {
                const compareCell = compareData[rowIdx]?.[colIdx]
                const compareText = compareCell?.text ?? ''
                if (cell.text !== compareText) {
                    // original side: html=original, compareHtml=edited → diff(cell.text, compareText)
                    // current/unified side: html=edited, compareHtml=original → diff(compareText, cell.text)
                    const [oldText, newText] = diffSide === 'original'
                        ? [cell.text, compareText]
                        : [compareText, cell.text]
                    map.set(`${rowIdx},${colIdx}`, computeCharDiff(oldText, newText))
                }
            })
        })

        // Handle cells that exist in compare but not in this table (structural diff)
        compareData.forEach((rowCells, rowIdx) => {
            rowCells.forEach((cell, colIdx) => {
                if (!originalData[rowIdx]?.[colIdx]) {
                    const key = `${rowIdx},${colIdx}`
                    if (!map.has(key)) {
                        const [oldText, newText] = diffSide === 'original'
                            ? ['', cell.text]
                            : [cell.text, '']
                        map.set(key, computeCharDiff(oldText, newText))
                    }
                }
            })
        })

        return map.size > 0 ? map : null
    }, [compareHtml, originalData, diffSide, needsCellDiff])

    const visibleRowIndexes = React.useMemo(() => {
        if (!diffOnly || !cellDiffMap || cellDiffMap.size === 0) {
            return tableData.map((_, index) => index)
        }

        const changedRows = new Set<number>()
        for (const key of cellDiffMap.keys()) {
            const rowIndex = Number.parseInt(key.split(',')[0] ?? '', 10)
            if (Number.isFinite(rowIndex)) {
                changedRows.add(rowIndex)
            }
        }

        if (changedRows.size === 0) {
            return tableData.map((_, index) => index)
        }

        const headerRows: number[] = []
        for (let index = 0; index < tableData.length; index += 1) {
            const row = tableData[index]
            if (row.length > 0 && row.every((cell) => cell.isHeader)) {
                headerRows.push(index)
                continue
            }
            break
        }

        return Array.from(new Set([...headerRows, ...changedRows])).sort((left, right) => left - right)
    }, [cellDiffMap, diffOnly, tableData])

    const containerRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const internalPointerTransitionRef = useRef(false)
    const internalPointerResetTimerRef = useRef<number | null>(null)

    // Sync mutable refs during render (not in effects) so event handlers always
    // see the latest values even in React 18 Concurrent Mode.
    const currentHtmlRef = useRef(currentHtml)
    const editingCellRef = useRef(editingCell)
    const cellEditValueRef = useRef(cellEditValue)
    currentHtmlRef.current = currentHtml
    editingCellRef.current = editingCell
    cellEditValueRef.current = cellEditValue

    const shouldVirtualizeRows = inline && !diffOnly && visibleRowIndexes.length > TABLE_VIRTUALIZE_AFTER_ROWS
    const virtualWindow = React.useMemo(() => {
        if (!shouldVirtualizeRows) {
            return {
                topSpacerHeight: 0,
                bottomSpacerHeight: 0,
                rows: visibleRowIndexes.map((index) => ({ index, cells: tableData[index] })).filter((row) => Array.isArray(row.cells)),
            }
        }

        const startIndex = Math.max(0, Math.floor(scrollTop / TABLE_ROW_HEIGHT_ESTIMATE) - TABLE_RENDER_OVERSCAN_ROWS)
        const endIndex = Math.min(
            visibleRowIndexes.length,
            Math.ceil((scrollTop + viewportHeight) / TABLE_ROW_HEIGHT_ESTIMATE) + TABLE_RENDER_OVERSCAN_ROWS,
        )

        return {
            topSpacerHeight: startIndex * TABLE_ROW_HEIGHT_ESTIMATE,
            bottomSpacerHeight: Math.max(0, (visibleRowIndexes.length - endIndex) * TABLE_ROW_HEIGHT_ESTIMATE),
            rows: visibleRowIndexes
                .slice(startIndex, endIndex)
                .map((index) => ({ index, cells: tableData[index] }))
                .filter((row) => Array.isArray(row.cells)),
        }
    }, [diffOnly, inline, scrollTop, shouldVirtualizeRows, tableData, viewportHeight, visibleRowIndexes])

    const visibleRows = virtualWindow.rows

    // Sync when html prop changes (e.g. attrs override applied externally)
    useEffect(() => {
        const entry = getTableParseEntry(html)
        activeParseEntryRef.current = entry

        const syncRows = () => {
            setTableData(entry.rows.slice())
            setIsTableParseComplete(entry.complete)
        }

        entry.listeners.add(syncRows)
        syncRows()
        scheduleTableParse(entry)
        setCurrentHtml(html)
        currentHtmlRef.current = html

        return () => {
            entry.listeners.delete(syncRows)
        }
    }, [html])

    useLayoutEffect(() => {
        const element = scrollRef.current
        if (!element) return

        const updateMeasurements = () => {
            setViewportHeight(element.clientHeight || 480)
            setScrollTop(element.scrollTop)
        }

        updateMeasurements()
        const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateMeasurements)
        resizeObserver?.observe(element)
        return () => resizeObserver?.disconnect()
    }, [])

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(event.currentTarget.scrollTop)
    }, [])

    useEffect(() => {
        if (viewOnly || !initialEditingCell) return
        setEditingCell(initialEditingCell)
        setCellEditValue(initialEditingCell.text)
    }, [initialEditingCell, viewOnly])

    useLayoutEffect(() => {
        const textarea = textareaRef.current
        if (!textarea || !editingCell) return

        textarea.style.height = '0px'
        const minimumHeight = Math.max(28, Math.ceil(editingCell.height ?? 0) - 2)
        textarea.style.height = `${Math.max(minimumHeight, textarea.scrollHeight)}px`
    }, [cellEditValue, editingCell])

    useEffect(() => {
        return () => {
            if (internalPointerResetTimerRef.current != null) {
                window.clearTimeout(internalPointerResetTimerRef.current)
            }
        }
    }, [])

    // ---------------------------------------------------------------------------
    // Cell commit helpers
    // ---------------------------------------------------------------------------

    const commitCell = useCallback((row: number, col: number, value: string) => {
        const newHtml = updateCellTextInHtml(currentHtmlRef.current, row, col, value)
        currentHtmlRef.current = newHtml
        setCurrentHtml(newHtml)
        const activeEntry = activeParseEntryRef.current
        if (activeEntry) {
            const rowCells = activeEntry.rows[row]
            if (rowCells) {
                activeEntry.rows[row] = rowCells.map(cell =>
                    cell.row === row && cell.col === col ? { ...cell, text: value } : cell,
                )
                setTableData(activeEntry.rows.slice())
            }
        } else {
            setTableData(prev =>
                prev.map(rowCells =>
                    rowCells.map(cell =>
                        cell.row === row && cell.col === col ? { ...cell, text: value } : cell,
                    ),
                ),
            )
        }
        // Notify parent on each cell commit so the toolbar "保存" button enables immediately
        onSave(newHtml)
    }, [onSave])

    // ---------------------------------------------------------------------------
    // Interaction handlers
    // ---------------------------------------------------------------------------

    const handleCellClick = useCallback(
        (cell: HtmlTableCellRef) => {
            if (viewOnly) return
            // Commit any in-progress cell edit first
            const prev = editingCellRef.current
            if (prev) {
                commitCell(prev.row, prev.col, cellEditValueRef.current)
            }
            setEditingCell(cell)
            setCellEditValue(cell.text)
        },
        [viewOnly, commitCell],
    )

    const handleInputBlur = useCallback(() => {
        const current = editingCellRef.current
        // Guard against double-fire: Enter/Tab calls this then DOM blur fires again.
        // Immediately null the ref so the second invocation is a no-op.
        if (!current) return
        editingCellRef.current = null
        commitCell(current.row, current.col, cellEditValueRef.current)
        setEditingCell(null)
    }, [commitCell])

    const handleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            e.stopPropagation()
            if (e.key === 'Tab') {
                e.preventDefault()
                handleInputBlur()
            } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleInputBlur()
            } else if (e.key === 'Escape') {
                e.preventDefault()
                setEditingCell(null)
            }
        },
        [handleInputBlur],
    )

    const handleContainerPointerDownCapture = useCallback(() => {
        internalPointerTransitionRef.current = true
        if (internalPointerResetTimerRef.current != null) {
            window.clearTimeout(internalPointerResetTimerRef.current)
        }
        internalPointerResetTimerRef.current = window.setTimeout(() => {
            internalPointerTransitionRef.current = false
            internalPointerResetTimerRef.current = null
        }, 0)
    }, [])

    // When focus leaves the whole editor container → save + close
    const handleContainerBlur = useCallback(
        (e: React.FocusEvent) => {
            if (viewOnly) return
            if (containerRef.current?.contains(e.relatedTarget as Node)) return
            if (internalPointerTransitionRef.current) return

            // Commit pending cell if any
            const current = editingCellRef.current
            let finalHtml = currentHtmlRef.current
            if (current) {
                finalHtml = updateCellTextInHtml(finalHtml, current.row, current.col, cellEditValueRef.current)
            }
            onSave(finalHtml)
            onClose()
        },
        [viewOnly, onSave, onClose],
    )

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    if (tableData.length === 0) return null

    // Container border: diff-state colour takes priority over edit-mode colour
    const diffColor = diffState && diffState !== 'unchanged' ? DIFF_BLOCK_COLORS[diffState] : null
    const containerBorder = (() => {
        if (!viewOnly) return '2px solid #3b82f6'
        if (diffColor) return `2px solid ${diffColor.border}`
        return '1px solid #e5e7eb'
    })()
    const containerBoxShadow = (() => {
        if (!viewOnly) return '0 4px 16px rgba(59,130,246,0.15)'
        return 'none'
    })()

    return (
        <div
            ref={containerRef}
            style={{
                position: inline ? 'relative' : 'absolute',
                left: inline ? undefined : left,
                top: inline ? undefined : top,
                width: inline ? '100%' : width,
                zIndex: inline ? undefined : (viewOnly ? 5 : 20),
                paddingBottom: inline ? undefined : `${TABLE_BOTTOM_PADDING}px`,
                boxSizing: 'border-box',
                pointerEvents: inline ? 'auto' : 'none',
            }}
        >
            <div
                ref={scrollRef}
                tabIndex={viewOnly ? undefined : -1}
                onPointerDownCapture={viewOnly ? undefined : handleContainerPointerDownCapture}
                onBlur={viewOnly ? undefined : handleContainerBlur}
                onScroll={shouldVirtualizeRows ? handleScroll : undefined}
                data-range-preview-scroll={shouldVirtualizeRows ? 'true' : undefined}
                style={{
                    border: containerBorder,
                    background: TABLE_EDITOR_SURFACE,
                    color: TABLE_EDITOR_FOREGROUND,
                    overflowX: 'auto',
                    overflowY: shouldVirtualizeRows ? 'auto' : 'hidden',
                    maxHeight: shouldVirtualizeRows ? '72vh' : undefined,
                    maxWidth: '100%',
                    overscrollBehaviorX: 'contain',
                    overscrollBehaviorY: shouldVirtualizeRows ? 'contain' : undefined,
                    boxShadow: containerBoxShadow,
                    borderRadius: '2px',
                    pointerEvents: 'auto',
                }}
            >
                <table
                    style={{
                        borderCollapse: 'collapse',
                        width: 'max-content',
                        minWidth: '100%',
                        tableLayout: 'auto',
                        fontSize: '12px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                >
                    <tbody>
                        {virtualWindow.topSpacerHeight > 0 && (
                            <tr aria-hidden="true">
                                <td style={{ height: virtualWindow.topSpacerHeight, padding: 0, border: 0 }} />
                            </tr>
                        )}
                        {visibleRows.map(({ index: rowIdx, cells: rowCells }) => (
                            <tr key={rowIdx}>
                                {rowCells.map((cell, colIdx) => {
                                    const isEditing =
                                        !viewOnly &&
                                        editingCell?.row === rowIdx &&
                                        editingCell?.col === colIdx
                                    const cellDiffSegments = cellDiffMap?.get(`${rowIdx},${colIdx}`) ?? null
                                    const isCellChanged = !!cellDiffSegments

                                    const Tag: 'td' | 'th' = cell.isHeader ? 'th' : 'td'

                                    return (
                                        <Tag
                                            key={colIdx}
                                            colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                                            rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                                            onClick={
                                                viewOnly
                                                    ? (event) => {
                                                        event.stopPropagation()
                                                        onRequestEditCell?.({
                                                            row: rowIdx,
                                                            col: colIdx,
                                                            text: cell.text,
                                                            width: event.currentTarget.getBoundingClientRect().width,
                                                            height: event.currentTarget.getBoundingClientRect().height,
                                                        })
                                                    }
                                                    : !isEditing
                                                        ? (event) => handleCellClick({
                                                            row: rowIdx,
                                                            col: colIdx,
                                                            text: cell.text,
                                                            width: event.currentTarget.getBoundingClientRect().width,
                                                            height: event.currentTarget.getBoundingClientRect().height,
                                                        })
                                                        : undefined
                                            }
                                            style={{
                                                border: isEditing
                                                    ? `1px solid ${TABLE_EDITOR_ACTIVE_BORDER}`
                                                    : isCellChanged && diffSide
                                                        ? `1px solid ${CELL_DIFF_BORDER[diffSide] ?? TABLE_EDITOR_BORDER}`
                                                        : `1px solid ${TABLE_EDITOR_BORDER}`,
                                                padding: isEditing ? 0 : '3px 6px',
                                                cursor: viewOnly ? (onRequestEditCell ? 'text' : 'default') : 'pointer',
                                                background: isEditing
                                                    ? TABLE_EDITOR_ACTIVE_BG
                                                    : cell.isHeader
                                                        ? TABLE_EDITOR_HEADER_BG
                                                        : TABLE_EDITOR_CELL_BG,
                                                color: isEditing
                                                    ? TABLE_EDITOR_ACTIVE_FG
                                                    : cell.isHeader
                                                        ? TABLE_EDITOR_HEADER_FG
                                                        : TABLE_EDITOR_CELL_FG,
                                                fontWeight: cell.isHeader ? 600 : 'normal',
                                                verticalAlign: 'top',
                                                minWidth: '32px',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'normal',
                                                overflowWrap: 'normal',
                                                position: 'relative',
                                                lineHeight: '1.4',
                                            }}
                                        >
                                            {isEditing ? (
                                                <textarea
                                                    ref={textareaRef}
                                                    aria-label="编辑单元格"
                                                    title="编辑单元格"
                                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                                    autoFocus
                                                    value={cellEditValue}
                                                    onChange={e => setCellEditValue(e.target.value)}
                                                    onBlur={handleInputBlur}
                                                    onKeyDown={handleInputKeyDown}
                                                    onClick={e => e.stopPropagation()}
                                                    style={{
                                                        width: '100%',
                                                        minHeight: `${Math.max(28, Math.ceil(editingCell?.height ?? 0) - 2)}px`,
                                                        resize: 'none',
                                                        overflow: 'hidden',
                                                        border: 'none',
                                                        outline: 'none',
                                                        padding: '3px 6px',
                                                        fontSize: '12px',
                                                        fontFamily: 'inherit',
                                                        background: 'transparent',
                                                        color: TABLE_EDITOR_ACTIVE_FG,
                                                        caretColor: TABLE_EDITOR_ACTIVE_FG,
                                                        display: 'block',
                                                        boxSizing: 'border-box',
                                                        lineHeight: '1.4',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'normal',
                                                        overflowWrap: 'normal',
                                                    }}
                                                />
                                            ) : cellDiffSegments && diffSide ? (
                                                renderCharDiff(cellDiffSegments, diffSide)
                                            ) : (
                                                cell.text
                                            )}
                                        </Tag>
                                    )
                                })}
                            </tr>
                        ))}
                        {virtualWindow.bottomSpacerHeight > 0 && (
                            <tr aria-hidden="true">
                                <td style={{ height: virtualWindow.bottomSpacerHeight, padding: 0, border: 0 }} />
                            </tr>
                        )}
                    </tbody>
                </table>
                {!isTableParseComplete && (
                    <div
                        style={{
                            padding: '8px 12px',
                            fontSize: 12,
                            color: 'var(--surface-muted-foreground, #6b7280)',
                            borderTop: '1px solid var(--table-footer-border, var(--border, #e5e7eb))',
                        }}
                    >
                        正在加载更多行...
                    </div>
                )}
            </div>
        </div>
    )
}
