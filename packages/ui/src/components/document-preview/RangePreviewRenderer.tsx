/**
 * RangePreviewRenderer Component (v2 - Virtual Scrolling Architecture)
 *
 * Main component for displaying a document range with unified parse result.
 * Supports: viewing, editing, diff mode, table cell editing.
 *
 * Architecture:
 *   - Uses canvas-engine/VirtualPageList for per-page canvas rendering
 *   - Each page gets its own <canvas>, solving the "huge single canvas" problem
 *   - Block renderers are pluggable via canvas-engine/BlockRendererRegistry
 *   - 100% backward compatible with RangePreviewProps
 */

import React, { useRef, useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react'
import type { JSX } from 'react'
import type { ParseBlock, RangePreviewProps } from './types'
import { getCurrentParseResult, isRangeEdited, getBlocks, shouldRenderMarkdownFallback } from './types'
import { TableLayoutManager } from './core'
import { calculateAdaptiveFontSize, DEFAULT_RENDERER_CONTEXT } from './renderers/rendererTypes'
import { Markdown } from '../markdown'
import { FullMarkdownPreview } from './FullMarkdownPreview'
import { DebugInfo, EmptyParseResultPreview, LoadingPreview } from './RangePreviewStatus'
import { RangePreviewMetadata } from './RangePreviewMetadata'
import { HtmlTableCellEditor } from './components/HtmlTableCellEditor'
import type { HtmlTableCellRef } from './components/HtmlTableCellEditor'
import {
    useEditMode,
    useDprDetection,
    useContainerWidth,
    useTableLoading,
    useImageLoading,
    useDiffComputation,
    calculateEditBoxPosition,
} from './hooks'

// canvas-engine imports
import {
    CanvasEngine,
    VirtualPageList,
    DEFAULT_COORDINATE_CONFIG,
    type BaseRenderOptions,
} from '../canvas-engine'

// renderers
import { registerAllRenderers } from './renderers/registerAll'
import type { RegisteredRenderers } from './renderers/registerAll'
import type { RangeRenderOptions } from './renderers/rendererTypes'

import {
    DEFAULT_BASE_SIZE,
    DEFAULT_ZOOM,
    DOCUMENT_SURFACE_STYLE,
    isEffectiveTable,
    isGeneratedHtmlTableFlowBlock,
    isHtmlTableBlock,
    normalizeNewlinesForMarkdown,
    resolveBlockType,
    splitEditableFlowBlock,
    type EditableFlowBlock,
} from './RangePreviewRenderer.helpers'

export function RangePreviewRenderer(props: RangePreviewProps): JSX.Element {
    const {
        rangeData,
        mode = 'auto',
        zoom = DEFAULT_ZOOM,
        debug = false,
        editMode = false,
        diffMode = false,
        diffData: externalDiffData,
        diffSide,
        onBlockClick,
        onBlockDoubleClick,
        onSaveEdit,
        resolveImageUrl,
        className,
        style,
        canvasBackgroundColor = '#ffffff',
        hideMetadata = false,
        footerContent,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const pendingCursorRef = useRef<number | null>(null)
    const renderedMarkdownDirtyBlockIdRef = useRef<string | null>(null)
    const [editTextareaHeight, setEditTextareaHeight] = useState<number | null>(null)

    // HTML table edit state (for table blocks with attrs.html)
    const [htmlTableEditBlockId, setHtmlTableEditBlockId] = useState<string | null>(null)
    const [htmlTableInitialCell, setHtmlTableInitialCell] = useState<HtmlTableCellRef | null>(null)
    const htmlTableEditBlockIdRef = useRef<string | null>(null)
    // Sync ref during render (not in effect) to avoid stale values in event handlers
    htmlTableEditBlockIdRef.current = htmlTableEditBlockId

    // Attrs overrides for HTML table edits (block.id → partial BlockAttributes)
    const attrsOverridesRef = useRef<Map<string, Record<string, unknown>>>(new Map())

    const dpr = useDprDetection()
    const { containerWidth } = useContainerWidth(containerRef)
    const [renderVersion, setRenderVersion] = useState(0)
    const bumpRenderVersion = useCallback(() => setRenderVersion((v) => v + 1), [])

    // Refs for volatile state
    const editModeRef = useRef(editMode)
    useEffect(() => {
        editModeRef.current = editMode
    }, [editMode])

    // Content overrides for pending edits
    const contentOverridesRef = useRef<Map<string, string>>(new Map())

    // Edit mode hook
    const editHook = useEditMode()
    const {
        editingBlockId,
        editValue,
        setEditValue,
        startEditBlock,
        finishEdit,
    } = editHook


    const engineRef = useRef<CanvasEngine<ParseBlock> | null>(null)
    const renderersRef = useRef<RegisteredRenderers | null>(null)
    const tableManagerRef = useRef<TableLayoutManager | null>(null)

    // Initialize engine once (avoids re-creation on every render)
    if (!engineRef.current) {
        engineRef.current = new CanvasEngine<ParseBlock>({
            debugMode: debug,
        })
        // Inject document-specific block type priorities (kept out of canvas-engine defaults)
        engineRef.current.setSchedulerConfig({
            priorityMap: {
                text: 0,
                heading: 0,
                list: 1,
                table: 1,
                code: 1,
                image: 2,
                html: 2,
                formula: 2,
            },
        })
        renderersRef.current = registerAllRenderers(engineRef.current)
        tableManagerRef.current = new TableLayoutManager()
    }

    const engine = engineRef.current

    // Update engine config when props change
    useEffect(() => {
        engine.setDebugMode(debug)
    }, [engine, debug])

    useEffect(() => {
        if (containerWidth > 0) {
            const scale = (containerWidth * zoom) / DEFAULT_BASE_SIZE
            engine.setScale(scale)
            bumpRenderVersion()
        }
    }, [engine, containerWidth, zoom, bumpRenderVersion])

    // Cleanup table manager on unmount
    useEffect(() => {
        return () => {
            tableManagerRef.current?.destroy()
        }
    }, [])


    const parseResult = useMemo(() => {
        return getCurrentParseResult(rangeData, mode)
    }, [rangeData, mode])

    const blocks = useMemo(() => {
        return getBlocks(parseResult)
    }, [parseResult])

    const flowBlocks = useMemo(() => {
        return blocks.filter((block) => shouldRenderMarkdownFallback(block) || isGeneratedHtmlTableFlowBlock(block))
    }, [blocks])

    const markdownFallbackBlocks = useMemo(() => {
        return flowBlocks.filter((block) => shouldRenderMarkdownFallback(block))
    }, [flowBlocks])

    const editableFlowBlocks = useMemo(() => {
        return flowBlocks.flatMap((block) => {
            if (!shouldRenderMarkdownFallback(block)) {
                return [{
                    ...block,
                    sourceBlockId: block.id,
                    editableStart: 0,
                    editableEnd: (block.content || '').length,
                    segmented: false,
                } satisfies EditableFlowBlock]
            }

            const overriddenContent = contentOverridesRef.current.get(block.id)
            const effectiveBlock = overriddenContent != null
                ? { ...block, content: overriddenContent }
                : block
            return splitEditableFlowBlock(effectiveBlock)
        })
        // renderVersion captures contentOverridesRef changes after local edits
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flowBlocks, renderVersion])

    const editableFlowBlockMap = useMemo(() => {
        return new Map(editableFlowBlocks.map((block) => [block.id, block]))
    }, [editableFlowBlocks])

    const isEditingInlineFlowBlock = useMemo(() => {
        return Boolean(editingBlockId && editableFlowBlockMap.has(editingBlockId))
    }, [editableFlowBlockMap, editingBlockId])

    const canvasBlocks = useMemo(() => {
        return blocks.filter((block) => !shouldRenderMarkdownFallback(block) && !isGeneratedHtmlTableFlowBlock(block))
    }, [blocks])

    // Total pages
    const totalPages = useMemo(() => {
        const maxPage = blocks.length > 0 ? Math.max(...blocks.map((b) => b.page ?? 0)) : 0
        const metaPages = parseResult?.metadata?.page_count || 1
        const pageListCount = parseResult?.pages?.length || 0
        return Math.max(metaPages, pageListCount, maxPage + 1)
    }, [blocks, parseResult?.metadata?.page_count, parseResult?.pages?.length])

    // Diff data
    const { diffDataToUse, diffStateMap, contentDiffMap } = useDiffComputation({
        rangeData,
        diffMode,
        externalDiffData,
        diffSide,
    })


    const { triggerTableReload } = useTableLoading({
        canvasBlocks,
        zoom,
        debug,
        editModeRef,
        contentOverridesRef,
        attrsOverridesRef,
        tableManagerRef,
        renderersRef,
        isHtmlTableBlock,
        isEffectiveTable,
        onRenderVersionBump: bumpRenderVersion,
    })


    const { handleVisiblePagesChange } = useImageLoading({
        canvasBlocks,
        parseResult,
        resolveImageUrl,
        renderersRef,
        onRenderVersionBump: bumpRenderVersion,
    })


    const hoveredIdRef = useRef<string | null>(null)
    const editingBlockIdRef = useRef<string | null>(null)
    useEffect(() => {
        editingBlockIdRef.current = editingBlockId
    }, [editingBlockId])

    const buildOptions = useCallback(
        (item: ParseBlock): BaseRenderOptions => {
            const opts: RangeRenderOptions = {
                selected: item.id === hoveredIdRef.current,
                editing: item.id === editingBlockIdRef.current,
            }

            if (diffMode && diffStateMap) {
                opts.diffState = diffStateMap.get(item.id) ?? 'unchanged'
                opts.diffSide = diffSide

                if (opts.diffState === 'updated' && contentDiffMap) {
                    const diff = contentDiffMap.get(item.id)
                    if (diff) {
                        opts.contentDiff = diff
                    }
                }
            }

            return opts
        },
        [diffMode, diffStateMap, contentDiffMap, diffSide],
    )

    // Build items with content and attrs overrides applied
    const displayItems = useMemo(() => {
        return canvasBlocks.map((block) => {
            const overriddenContent = contentOverridesRef.current.get(block.id)
            const attrsOverride = attrsOverridesRef.current.get(block.id)
            const effectiveType = resolveBlockType(block)
            const needsCopy = overriddenContent != null || attrsOverride != null || effectiveType !== block.type
            if (!needsCopy) return block
            return {
                ...block,
                ...(effectiveType !== block.type ? { type: effectiveType } : {}),
                ...(overriddenContent != null ? { content: overriddenContent } : {}),
                ...(attrsOverride != null ? { attrs: { ...block.attrs, ...attrsOverride } } : {}),
            }
        })
        // renderVersion triggers refresh after override changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasBlocks, renderVersion])


    const handlePageMouseMove = useCallback(
        (pixelX: number, pixelY: number, _pageIndex: number) => {
            const hit = engine.hitTestAt(canvasBlocks, pixelX, pixelY)
            const newId = hit.item?.id ?? null
            if (newId !== hoveredIdRef.current) {
                hoveredIdRef.current = newId
                setRenderVersion((v) => v + 1)
            }
        },
        [engine, canvasBlocks],
    )

    const handlePageClick = useCallback(
        (pixelX: number, pixelY: number, _pageIndex: number) => {
            const hit = engine.hitTestAt(canvasBlocks, pixelX, pixelY)
            const block = hit.item
            if (!block) return

            // Edit mode: single click to edit (image blocks are not editable)
            if (editModeRef.current && block.bbox) {
                if (resolveBlockType(block) === 'image') return

                // HTML table blocks (attrs.html) use the Excel-style cell editor
                if (isHtmlTableBlock(block)) {
                    setHtmlTableEditBlockId(block.id)
                    return
                }

                const displayContent = contentOverridesRef.current.get(block.id) ?? block.content
                const displayBlock =
                    displayContent !== block.content ? { ...block, content: displayContent } : block
                startEditBlock(displayBlock)
                return
            }

            // Non-edit mode: notify parent
            if (onBlockClick) {
                onBlockClick(block)
            }
        },
        [engine, canvasBlocks, startEditBlock, onBlockClick],
    )

    const handlePageDoubleClick = useCallback(
        (pixelX: number, pixelY: number, _pageIndex: number) => {
            if (editModeRef.current) return
            if (!onBlockDoubleClick) return
            const hit = engine.hitTestAt(canvasBlocks, pixelX, pixelY)
            const block = hit.item
            if (!block) return
            onBlockDoubleClick(block)
        },
        [engine, canvasBlocks, onBlockDoubleClick],
    )


    const handleHtmlTableSave = useCallback(
        (blockId: string, newHtml: string) => {
            const block = blocks.find((b) => b.id === blockId)
            if (!block) return

            // Store the updated attrs.html override
            attrsOverridesRef.current.set(blockId, { html: newHtml })

            // Clear canvas table cache (even though HTML table blocks skip canvas rendering,
            // keep consistent in case the block is later detected as a non-html table)
            if (tableManagerRef.current) {
                tableManagerRef.current.clearCache(blockId)
            }

            // Notify parent: attrs.html is the canonical field for HTML table content
            if (onSaveEdit) {
                onSaveEdit([
                    {
                        block_id: blockId,
                        operation: 'update',
                        new_attrs: { html: newHtml },
                    },
                ])
            }

            setRenderVersion((v) => v + 1)
        },
        [blocks, onSaveEdit],
    )

    const handleHtmlTableClose = useCallback(() => {
        setHtmlTableEditBlockId(null)
        setHtmlTableInitialCell(null)
    }, [])

    const handleRequestHtmlTableCellEdit = useCallback((blockId: string, cell: HtmlTableCellRef) => {
        setHtmlTableInitialCell(cell)
        setHtmlTableEditBlockId(blockId)
    }, [])


    const handleEditBlur = useCallback((valueOverride?: string) => {
        const textareaValue = textareaRef.current?.value
        const result = finishEdit()
        if (!result) return

        const displayBlock = editableFlowBlockMap.get(result.blockId)
        const sourceBlockId = displayBlock?.sourceBlockId ?? result.blockId
        const block = blocks.find((b) => b.id === sourceBlockId)
        if (!block) return

        const latestValue = valueOverride ?? textareaValue ?? result.newValue
        const currentSourceContent = contentOverridesRef.current.get(block.id) ?? block.content ?? ''
        const nextValue = displayBlock?.segmented
            ? currentSourceContent.slice(0, displayBlock.editableStart)
                + latestValue
                + currentSourceContent.slice(displayBlock.editableEnd)
            : latestValue

        if (nextValue === block.content) {
            contentOverridesRef.current.delete(block.id)
            return
        }

        contentOverridesRef.current.set(block.id, nextValue)

        // Clear table cache when a table block is edited so it re-renders with new content
        if (isEffectiveTable(block) && tableManagerRef.current) {
            tableManagerRef.current.clearCache(block.id)
            // Trigger table re-loading effect to regenerate ImageData with new content
            triggerTableReload()
        }

        if (onSaveEdit) {
            onSaveEdit([
                {
                    block_id: block.id,
                    operation: 'update',
                    new_content: nextValue,
                },
            ])
        }

        setRenderVersion((v) => v + 1)
    }, [finishEdit, editableFlowBlockMap, blocks, onSaveEdit, triggerTableReload])

    const handleRenderedMarkdownBlur = useCallback(
        (event: React.FocusEvent<HTMLDivElement>, block: EditableFlowBlock) => {
            event.stopPropagation()
            if (editingBlockIdRef.current !== block.id) return
            const isDirty = renderedMarkdownDirtyBlockIdRef.current === block.id
            renderedMarkdownDirtyBlockIdRef.current = null
            if (!isDirty) {
                finishEdit()
                return
            }
            handleEditBlur(event.currentTarget.innerText)
        },
        [finishEdit, handleEditBlur],
    )

    const handleRenderedMarkdownKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            event.stopPropagation()

            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault()
                event.currentTarget.blur()
            } else if (event.key === 'Escape') {
                event.preventDefault()
                event.currentTarget.blur()
            }
        },
        [],
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            // Stop all keyboard events from bubbling to parent containers
            // (prevents full-markdown-mode div's onKeyDown and biz-level ESC handler)
            e.stopPropagation()

            if (e.key === 'Enter') {
                if (e.ctrlKey || e.metaKey) {
                    // Ctrl/Cmd+Enter = save
                    e.preventDefault()
                    handleEditBlur()
                }
                // Plain Enter = newline (default textarea behavior)
                return
            } else if (e.key === 'Escape') {
                e.preventDefault()
                handleEditBlur()
            } else if (e.key === 'Tab') {
                // Insert indent (supports multi-line selection)
                e.preventDefault()
                const textarea = e.currentTarget
                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const value = textarea.value
                const indent = '  ' // 2 spaces

                if (start === end) {
                    // No selection: insert indent at cursor
                    const newValue = value.substring(0, start) + indent + value.substring(end)
                    pendingCursorRef.current = start + indent.length
                    setEditValue(newValue)
                } else {
                    // Multi-line selection: indent each line in range
                    const before = value.substring(0, start)
                    const selected = value.substring(start, end)
                    const after = value.substring(end)
                    const lineStart = before.lastIndexOf('\n') + 1
                    const prefix = value.substring(0, lineStart)
                    const firstLinePart = value.substring(lineStart, start)
                    const textToIndent = firstLinePart + selected
                    const indented = textToIndent.replace(/^/gm, indent)
                    const addedChars = indented.length - textToIndent.length
                    const newValue = prefix + indented + after
                    pendingCursorRef.current = end + addedChars
                    setEditValue(newValue)
                }
            }
        },
        [handleEditBlur, setEditValue],
    )

    // Focus textarea on edit start without moving the viewport.
    useEffect(() => {
        if (editingBlockId && textareaRef.current) {
            const textarea = textareaRef.current
            const scrollTop = scrollContainerRef.current?.scrollTop
            const scrollLeft = scrollContainerRef.current?.scrollLeft
            try {
                textarea.focus({ preventScroll: true })
            } catch {
                textarea.focus()
            }
            textarea.setSelectionRange(0, 0)
            if (scrollTop != null && scrollLeft != null && scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollTop
                scrollContainerRef.current.scrollLeft = scrollLeft
                requestAnimationFrame(() => {
                    if (!scrollContainerRef.current) return
                    scrollContainerRef.current.scrollTop = scrollTop
                    scrollContainerRef.current.scrollLeft = scrollLeft
                })
            }

        }
    }, [editingBlockId])

    // Restore cursor position after Tab indent (React controlled textarea resets cursor)
    useEffect(() => {
        if (pendingCursorRef.current != null && textareaRef.current) {
            const pos = pendingCursorRef.current
            textareaRef.current.setSelectionRange(pos, pos)
            pendingCursorRef.current = null
        }
    }, [editValue])

    // Clear overrides when leaving edit mode
    useEffect(() => {
        if (!editMode) {
            let needsRender = false
            if (contentOverridesRef.current.size > 0) {
                contentOverridesRef.current.clear()
                needsRender = true
            }
            if (attrsOverridesRef.current.size > 0) {
                attrsOverridesRef.current.clear()
                needsRender = true
            }
            if (needsRender) setRenderVersion((v) => v + 1)
            if (htmlTableEditBlockIdRef.current) {
                setHtmlTableEditBlockId(null)
            }
            if (htmlTableInitialCell) {
                setHtmlTableInitialCell(null)
            }
        }
    }, [editMode, htmlTableInitialCell])

    // Clear overrides when rangeData changes (after save + reparse)
    useEffect(() => {
        contentOverridesRef.current.clear()
        attrsOverridesRef.current.clear()
        setHtmlTableInitialCell(null)
    }, [rangeData])

    // ---------------------------------------------------------------------------
    // HTML table overlay positions (for canvas blocks with attrs.html <table>)
    // These are rendered as DOM overlays instead of via canvas ImageData.
    // ---------------------------------------------------------------------------

    const htmlTableOverlayPositions = useMemo(() => {
        if (containerWidth === 0) return []

        const scale = (containerWidth * zoom) / DEFAULT_BASE_SIZE
        const pageGap = DEFAULT_COORDINATE_CONFIG.pageGap

        // Build the "other side" block map for per-cell diff comparison
        // Original side compares against edited_parse_result; current side compares against parse_result
        const otherBlocks = diffMode && diffStateMap
            ? (() => {
                if (diffSide === 'original') return getBlocks(rangeData.edited_parse_result)
                if (diffSide === 'current') return getBlocks(rangeData.parse_result)
                // Unified shows the edited table; compare against original
                if (diffSide === 'unified') return getBlocks(rangeData.parse_result)
                return []
            })()
            : []
        const otherBlockMap = new Map(otherBlocks.map((b) => [b.id, b]))

        return canvasBlocks
            .filter((b) => isHtmlTableBlock(b))
            .map((block) => {
                if (!block.bbox || block.bbox.length !== 4) return null
                const page = block.page ?? 0
                const pageOffsetY = page * (DEFAULT_BASE_SIZE * scale + pageGap)
                // Use attrs override if available, else original attrs.html
                const html =
                    (attrsOverridesRef.current.get(block.id)?.html as string | undefined) ??
                    (block.attrs?.html as string)

                // Diff state and compare HTML for cell-level highlighting
                const blockDiffState = diffStateMap?.get(block.id) ?? 'unchanged'
                const otherBlock = otherBlockMap.get(block.id)
                const rawOtherHtml = otherBlock?.attrs?.html
                const compareHtml =
                    blockDiffState === 'updated' && otherBlock && typeof rawOtherHtml === 'string'
                        ? rawOtherHtml
                        : undefined

                return {
                    block,
                    html,
                    diffState: blockDiffState,
                    compareHtml,
                    left: block.bbox[0] * scale,
                    top: block.bbox[1] * scale + pageOffsetY,
                    width: (block.bbox[2] - block.bbox[0]) * scale,
                }
            })
            .filter(Boolean) as Array<{
                block: ParseBlock
                html: string
                diffState: 'added' | 'deleted' | 'updated' | 'moved' | 'unchanged'
                compareHtml: string | undefined
                left: number
                top: number
                width: number
            }>
        // renderVersion captures attrsOverridesRef changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasBlocks, containerWidth, zoom, renderVersion, diffStateMap, diffMode, diffSide, rangeData])


    const markdownOverlayPositions = useMemo(() => {
        if (containerWidth === 0 || markdownFallbackBlocks.length === 0) return []

        const scale = (containerWidth * zoom) / DEFAULT_BASE_SIZE
        const pageGap = DEFAULT_COORDINATE_CONFIG.pageGap

        return markdownFallbackBlocks
            .map((block) => {
                if (!block.bbox || block.bbox.length !== 4) return null
                const page = block.page ?? 0
                const pageOffsetY = page * (DEFAULT_BASE_SIZE * scale + pageGap)
                return {
                    block,
                    left: block.bbox[0] * scale,
                    top: block.bbox[1] * scale + pageOffsetY,
                    width: (block.bbox[2] - block.bbox[0]) * scale,
                }
            })
            .filter(Boolean) as Array<{ block: ParseBlock; left: number; top: number; width: number }>
    }, [markdownFallbackBlocks, containerWidth, zoom])


    const editBoxPosition = (() => {
        if (!editingBlockId || !containerRef.current || containerWidth === 0) return null
        const block = blocks.find((b) => b.id === editingBlockId)
        if (!block || !block.bbox || block.bbox.length !== 4) return null
        const bbox: [number, number, number, number] = [
            block.bbox[0],
            block.bbox[1],
            block.bbox[2],
            block.bbox[3],
        ]
        return calculateEditBoxPosition(bbox, containerWidth, zoom, scrollContainerRef.current, block.page, {
            pageWidth: engine.coords.pageWidth,
            pageHeight: engine.coords.pageHeight,
            pageGap: engine.coords.pageGap,
        })
    })()

    const editTextareaStyle = useMemo<React.CSSProperties | null>(() => {
        if (!editingBlockId || !editBoxPosition) return null

        const editingBlock = blocks.find((block) => block.id === editingBlockId)
        if (!editingBlock) return null

        const content = editValue || editingBlock.content || ''
        const { fontSize, lineHeight } = calculateAdaptiveFontSize(
            editBoxPosition.width,
            editBoxPosition.height,
            content,
        )

        const verticalPadding = Math.max(2, Math.min(6, Math.round(fontSize * 0.25)))
        const horizontalPadding = Math.max(4, Math.min(10, Math.round(fontSize * 0.5)))
        const minHeight = Math.max(
            editBoxPosition.height + verticalPadding * 2,
            Math.ceil(fontSize * lineHeight) + verticalPadding * 2 + 4,
        )
        const fontFamily = editingBlock.type === 'code' || editingBlock.type === 'formula'
            ? "ui-monospace, SFMono-Regular, monospace"
            : DEFAULT_RENDERER_CONTEXT.fontFamily

        return {
            left: editBoxPosition.left,
            top: Math.max(0, editBoxPosition.top - verticalPadding),
            width: editBoxPosition.width,
            minHeight,
            height: editTextareaHeight ?? minHeight,
            padding: `${verticalPadding}px ${horizontalPadding}px`,
            fontSize: `${fontSize}px`,
            lineHeight: String(lineHeight),
            fontFamily,
            boxSizing: 'border-box',
            overflow: 'hidden',
            zIndex: 10,
        }
    }, [blocks, editBoxPosition, editTextareaHeight, editValue, editingBlockId])

    useLayoutEffect(() => {
        if (!editingBlockId || !textareaRef.current) {
            setEditTextareaHeight(null)
            return
        }

        const textarea = textareaRef.current

        if (isEditingInlineFlowBlock) {
            setEditTextareaHeight(null)
            return
        }

        if (!editTextareaStyle) {
            return
        }

        const minimumHeight = typeof editTextareaStyle.minHeight === 'number'
            ? editTextareaStyle.minHeight
            : Number.parseFloat(String(editTextareaStyle.minHeight)) || 0

        textarea.style.height = `${minimumHeight}px`
        const nextHeight = Math.max(minimumHeight, textarea.scrollHeight)
        if (editTextareaHeight !== nextHeight) {
            setEditTextareaHeight(nextHeight)
        }
    }, [editTextareaHeight, editTextareaStyle, editingBlockId, editValue, isEditingInlineFlowBlock])


    // Loading state
    if (rangeData.processing_status < 4) {
        return (
            <LoadingPreview
                className={className}
                style={style}
                processingStatus={rangeData.processing_status}
                rangeId={rangeData.range_id}
            />
        )
    }

    // No parse result
    if (!parseResult) {
        return <EmptyParseResultPreview className={className} style={style} />
    }

    const metadata = parseResult.metadata
    const edited = isRangeEdited(rangeData)
    const isFullMarkdownMode = canvasBlocks.length === 0 && editableFlowBlocks.length > 0

    return (
        <div
            className={className}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', ...style }}
        >
            {/* Metadata Banner */}
            {!hideMetadata && (
                <RangePreviewMetadata
                    metadata={metadata}
                    diffMode={diffMode}
                    diffSide={diffSide}
                    edited={edited}
                    mode={mode}
                />
            )}

            {isFullMarkdownMode ? (
                <FullMarkdownPreview
                    containerRef={containerRef}
                    editableFlowBlocks={editableFlowBlocks}
                    attrsOverridesRef={attrsOverridesRef}
                    contentOverridesRef={contentOverridesRef}
                    diffStateMap={diffStateMap ?? undefined}
                    contentDiffMap={contentDiffMap ?? undefined}
                    diffMode={diffMode}
                    diffSide={diffSide}
                    rangeData={rangeData}
                    editMode={editMode}
                    htmlTableEditBlockId={htmlTableEditBlockId}
                    setHtmlTableEditBlockId={setHtmlTableEditBlockId}
                    setHtmlTableInitialCell={setHtmlTableInitialCell}
                    onBlockClick={onBlockClick}
                    onBlockDoubleClick={onBlockDoubleClick}
                    containerWidth={containerWidth}
                    handleHtmlTableSave={handleHtmlTableSave}
                    handleHtmlTableClose={handleHtmlTableClose}
                    handleRequestHtmlTableCellEdit={handleRequestHtmlTableCellEdit}
                    htmlTableInitialCell={htmlTableInitialCell}
                    editingBlockId={editingBlockId}
                    editingBlockIdRef={editingBlockIdRef}
                    renderedMarkdownDirtyBlockIdRef={renderedMarkdownDirtyBlockIdRef}
                    startEditBlock={startEditBlock}
                    handleRenderedMarkdownBlur={handleRenderedMarkdownBlur}
                    handleRenderedMarkdownKeyDown={handleRenderedMarkdownKeyDown}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    textareaRef={textareaRef}
                    handleEditBlur={handleEditBlur}
                    handleKeyDown={handleKeyDown}
                    footerContent={footerContent}
                />
            ) : (
                /* Canvas Mode with Per-Page Virtual Scrolling */
                <div
                    ref={containerRef}
                    className="relative border border-gray-200 rounded-md overflow-hidden flex-1 min-h-0"
                    style={DOCUMENT_SURFACE_STYLE}
                >
                    {containerWidth > 0 && (
                        <VirtualPageList<ParseBlock>
                            totalPages={totalPages}
                            items={displayItems}
                            engine={engine}
                            width={containerWidth}
                            dpr={dpr}
                            optionsFn={buildOptions}
                            renderVersion={renderVersion}
                            onPageMouseMove={handlePageMouseMove}
                            onPageClick={handlePageClick}
                            onPageDoubleClick={handlePageDoubleClick}
                            cursor={editMode ? 'text' : 'pointer'}
                            debug={debug}
                            overscan={2}
                            scrollRef={scrollContainerRef}
                            pageBackgroundColor={canvasBackgroundColor}
                            onVisiblePagesChange={handleVisiblePagesChange}
                            className="h-full"
                        >
                            {/* Markdown fallback block overlays - positioned over the virtual list */}
                            {markdownOverlayPositions.map(({ block, left, top, width }) => (
                                <div
                                    key={block.id}
                                    className="absolute"
                                    role={editMode ? 'button' : undefined}
                                    tabIndex={editMode ? 0 : undefined}
                                    onClick={(event) => {
                                        if (!editMode) return
                                        event.stopPropagation()
                                        if (resolveBlockType(block) === 'image') return
                                        const displayContent = contentOverridesRef.current.get(block.id) ?? block.content
                                        const displayBlock =
                                            displayContent !== block.content
                                                ? { ...block, content: displayContent }
                                                : block
                                        startEditBlock(displayBlock)
                                    }}
                                    onKeyDown={(event) => {
                                        if (!editMode) return
                                        if (event.key !== 'Enter' && event.key !== ' ') return
                                        event.preventDefault()
                                        event.stopPropagation()
                                        if (resolveBlockType(block) === 'image') return
                                        const displayContent = contentOverridesRef.current.get(block.id) ?? block.content
                                        const displayBlock =
                                            displayContent !== block.content
                                                ? { ...block, content: displayContent }
                                                : block
                                        startEditBlock(displayBlock)
                                    }}
                                    style={{
                                        left: `${left}px`,
                                        top: `${top}px`,
                                        width: `${width}px`,
                                        overflow: 'hidden',
                                        fontSize: '12px',
                                        lineHeight: '1.5',
                                        pointerEvents: editMode ? 'auto' : 'none',
                                        cursor: editMode ? 'text' : 'default',
                                    }}
                                >
                                    <Markdown content={normalizeNewlinesForMarkdown(block.content)} className="text-sm" />
                                </div>
                            ))}

                            {/* HTML table overlays (attrs.html blocks) – view-only or interactive editor */}
                            {htmlTableOverlayPositions.map(({ block, html, left, top, width, diffState: blockDiffState, compareHtml }) => {
                                const isBeingEdited = editMode && htmlTableEditBlockId === block.id
                                return (
                                    <HtmlTableCellEditor
                                        key={block.id}
                                        html={html}
                                        left={left}
                                        top={top}
                                        width={width}
                                        viewOnly={!isBeingEdited}
                                        onSave={(newHtml) => handleHtmlTableSave(block.id, newHtml)}
                                        onClose={handleHtmlTableClose}
                                        onRequestEditCell={editMode ? (cell) => handleRequestHtmlTableCellEdit(block.id, cell) : undefined}
                                        initialEditingCell={isBeingEdited ? htmlTableInitialCell : null}
                                        diffState={blockDiffState !== 'unchanged' ? blockDiffState : undefined}
                                        compareHtml={compareHtml}
                                        diffSide={diffSide}
                                    />
                                )
                            })}

                            {/* Edit Textarea Overlay – for non-HTML-table blocks */}
                            {editMode && editingBlockId && editTextareaStyle && (
                                <textarea
                                    ref={textareaRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onBlur={() => handleEditBlur()}
                                    onKeyDown={handleKeyDown}
                                    className="absolute rounded-md border-2 border-blue-500 bg-white/95 resize-none shadow-lg"
                                    style={{ ...editTextareaStyle, color: '#111827', background: 'rgba(255,255,255,0.98)' }}
                                />
                            )}
                        </VirtualPageList>
                    )}
                </div>
            )}

            {/* Debug Info */}
            {debug && (
                <DebugInfo
                    blocksCount={blocks.length}
                    canvasBlocksCount={canvasBlocks.length}
                    markdownFallbackBlocksCount={markdownFallbackBlocks.length}
                    isFullMarkdownMode={isFullMarkdownMode}
                    zoom={zoom}
                    dpr={dpr}
                    totalPages={totalPages}
                    containerWidth={containerWidth}
                    hoveredId={hoveredIdRef.current}
                    editMode={editMode}
                    editingBlockId={editingBlockId}
                    diffMode={diffMode}
                    diffDataToUse={diffDataToUse ?? undefined}
                />
            )}
        </div>
    )
}
