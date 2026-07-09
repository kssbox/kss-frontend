import React from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { ContentDiffSegment, ParseBlock, RangePreviewProps } from './types'
import type { HtmlTableCellRef } from './components/HtmlTableCellEditor'
import { getBlocks } from './types'
import { DIFF_MARKDOWN_BLOCK_STYLES } from './core'
import { Markdown } from '../markdown'
import { DiffHighlightRenderer } from './components/DiffHighlightRenderer'
import { HtmlTableCellEditor } from './components/HtmlTableCellEditor'
import {
    DOCUMENT_PAPER_STYLE,
    DOCUMENT_SHEET_LABEL_STYLE,
    INLINE_EDIT_TEXTAREA_CLASS_NAME,
    INLINE_EDIT_TEXTAREA_STYLE,
    isGeneratedHtmlTableFlowBlock,
    normalizeNewlinesForMarkdown,
    resolveBlockType,
    shouldUseRenderedMarkdownEditor,
    type EditableFlowBlock,
} from './RangePreviewRenderer.helpers'

interface FullMarkdownPreviewProps {
    containerRef: RefObject<HTMLDivElement | null>
    editableFlowBlocks: EditableFlowBlock[]
    attrsOverridesRef: MutableRefObject<Map<string, Record<string, unknown>>>
    contentOverridesRef: MutableRefObject<Map<string, string>>
    diffStateMap: Map<string, 'added' | 'deleted' | 'updated' | 'moved' | 'unchanged'> | undefined
    contentDiffMap: Map<string, ContentDiffSegment[]> | undefined
    diffMode: boolean
    diffSide: RangePreviewProps['diffSide']
    rangeData: RangePreviewProps['rangeData']
    editMode: boolean
    htmlTableEditBlockId: string | null
    setHtmlTableEditBlockId: (blockId: string | null) => void
    setHtmlTableInitialCell: (cell: HtmlTableCellRef | null) => void
    onBlockClick: RangePreviewProps['onBlockClick']
    onBlockDoubleClick: RangePreviewProps['onBlockDoubleClick']
    containerWidth: number
    handleHtmlTableSave: (blockId: string, newHtml: string) => void
    handleHtmlTableClose: () => void
    handleRequestHtmlTableCellEdit: (blockId: string, cell: HtmlTableCellRef) => void
    htmlTableInitialCell: HtmlTableCellRef | null
    editingBlockId: string | null
    editingBlockIdRef: MutableRefObject<string | null>
    renderedMarkdownDirtyBlockIdRef: MutableRefObject<string | null>
    startEditBlock: (block: ParseBlock) => void
    handleRenderedMarkdownBlur: (event: React.FocusEvent<HTMLDivElement>, block: EditableFlowBlock) => void
    handleRenderedMarkdownKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
    editValue: string
    setEditValue: (value: string) => void
    textareaRef: RefObject<HTMLTextAreaElement | null>
    handleEditBlur: (valueOverride?: string) => void
    handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
    footerContent: React.ReactNode
}

export function FullMarkdownPreview({
    containerRef,
    editableFlowBlocks,
    attrsOverridesRef,
    contentOverridesRef,
    diffStateMap,
    contentDiffMap,
    diffMode,
    diffSide,
    rangeData,
    editMode,
    htmlTableEditBlockId,
    setHtmlTableEditBlockId,
    setHtmlTableInitialCell,
    onBlockClick,
    onBlockDoubleClick,
    containerWidth,
    handleHtmlTableSave,
    handleHtmlTableClose,
    handleRequestHtmlTableCellEdit,
    htmlTableInitialCell,
    editingBlockId,
    editingBlockIdRef,
    renderedMarkdownDirtyBlockIdRef,
    startEditBlock,
    handleRenderedMarkdownBlur,
    handleRenderedMarkdownKeyDown,
    editValue,
    setEditValue,
    textareaRef,
    handleEditBlur,
    handleKeyDown,
    footerContent,
}: FullMarkdownPreviewProps): React.JSX.Element {
    return (
                <div
                    ref={containerRef}
                    data-range-preview-scroll="true"
                    className="border border-gray-200 rounded-md overflow-y-auto flex-1 min-h-0 p-6"
                    style={DOCUMENT_PAPER_STYLE}
                >
                    {editableFlowBlocks.map((block) => {
                        if (isGeneratedHtmlTableFlowBlock(block)) {
                            const html =
                                (attrsOverridesRef.current.get(block.id)?.html as string | undefined) ??
                                (block.attrs?.html as string)
                            const blockDiffState = diffStateMap?.get(block.id) ?? 'unchanged'
                            const compareBlock = diffMode && diffSide
                                ? (() => {
                                    if (diffSide === 'original') {
                                        return getBlocks(rangeData.edited_parse_result).find((candidate) => candidate.id === block.id)
                                    }
                                    return getBlocks(rangeData.parse_result).find((candidate) => candidate.id === block.id)
                                })()
                                : undefined
                            const compareHtml = typeof compareBlock?.attrs?.html === 'string'
                                ? compareBlock.attrs.html
                                : undefined
                            const sheetLabel = String(block.attrs?.alt_text || block.attrs?.sheet_name || '').trim()
                            const isBeingEdited = editMode && htmlTableEditBlockId === block.id

                            return (
                                <div
                                    key={block.id}
                                    data-page-wrapper={(Number.isFinite(block.page) ? block.page : 0) + 1}
                                    className="mb-6 space-y-3"
                                >
                                    {sheetLabel && (
                                        <div className="text-sm font-medium" style={DOCUMENT_SHEET_LABEL_STYLE}>{sheetLabel}</div>
                                    )}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            if (editMode && !isBeingEdited) {
                                                setHtmlTableEditBlockId(block.id)
                                                setHtmlTableInitialCell(null)
                                                return
                                            }
                                            onBlockClick?.(block)
                                        }}
                                        onDoubleClick={() => {
                                            if (editMode) return
                                            onBlockDoubleClick?.(block)
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key !== 'Enter' && event.key !== ' ') return
                                            event.preventDefault()
                                            if (editMode && !isBeingEdited) {
                                                setHtmlTableEditBlockId(block.id)
                                                setHtmlTableInitialCell(null)
                                                return
                                            }
                                            onBlockClick?.(block)
                                        }}
                                        style={{ cursor: editMode ? 'text' : onBlockClick ? 'pointer' : 'default' }}
                                    >
                                        <HtmlTableCellEditor
                                            html={html}
                                            left={0}
                                            top={0}
                                            width={Math.max(320, containerWidth - 48)}
                                            inline
                                            viewOnly={!isBeingEdited}
                                            onSave={(newHtml) => handleHtmlTableSave(block.id, newHtml)}
                                            onClose={handleHtmlTableClose}
                                            onRequestEditCell={editMode ? (cell) => handleRequestHtmlTableCellEdit(block.id, cell) : undefined}
                                            initialEditingCell={isBeingEdited ? htmlTableInitialCell : null}
                                            diffState={blockDiffState !== 'unchanged' ? blockDiffState : undefined}
                                            compareHtml={compareHtml}
                                            diffSide={diffSide}
                                        />
                                    </div>
                                </div>
                            )
                        }

                        const blockContent = contentOverridesRef.current.get(block.id) ?? block.content
                        const useRenderedMarkdownEditor = editMode
                            && editingBlockId === block.id
                            && shouldUseRenderedMarkdownEditor(block)

                        // Diff state for this block
                        const blockDiffState = diffStateMap?.get(block.id) ?? 'unchanged'
                        const blockContentDiff = contentDiffMap?.get(block.id)
                        const isDiffActive = diffMode && diffStateMap

                        // Block-level diff background styles
                        const diffBgStyle: React.CSSProperties = isDiffActive
                            ? (DIFF_MARKDOWN_BLOCK_STYLES[blockDiffState] ?? {})
                            : {}

                        // Normal-size block: use Markdown renderer or DiffHighlightRenderer
                        return (
                            <div
                                key={block.id}
                                data-page-wrapper={(Number.isFinite(block.page) ? block.page : 0) + 1}
                                className="relative mb-4"
                                role={useRenderedMarkdownEditor ? undefined : 'button'}
                                tabIndex={0}
                                onClick={() => {
                                    if (useRenderedMarkdownEditor) return
                                    if (editMode) {
                                        if (resolveBlockType(block) === 'image') return
                                        const displayContent =
                                            contentOverridesRef.current.get(block.id) ?? block.content
                                        const displayBlock =
                                            displayContent !== block.content
                                                ? { ...block, content: displayContent }
                                                : block
                                        startEditBlock(displayBlock)
                                        return
                                    }
                                    onBlockClick?.(block)
                                }}
                                onDoubleClick={() => {
                                    if (editMode) return
                                    onBlockDoubleClick?.(block)
                                }}
                                onKeyDown={(e) => {
                                    if (useRenderedMarkdownEditor) return
                                    if (e.key !== 'Enter' && e.key !== ' ') return
                                    e.preventDefault()
                                    if (editMode) {
                                        if (resolveBlockType(block) === 'image') return
                                        const displayContent =
                                            contentOverridesRef.current.get(block.id) ?? block.content
                                        const displayBlock =
                                            displayContent !== block.content
                                                ? { ...block, content: displayContent }
                                                : block
                                        startEditBlock(displayBlock)
                                        return
                                    }
                                    onBlockClick?.(block)
                                }}
                                style={{
                                    cursor: editMode ? 'text' : onBlockClick ? 'pointer' : 'default',
                                    ...diffBgStyle,
                                }}
                            >
                                {useRenderedMarkdownEditor ? (
                                    <div
                                        contentEditable
                                        role="textbox"
                                        aria-multiline="true"
                                        tabIndex={0}
                                        suppressContentEditableWarning
                                        onFocus={() => {
                                            if (editingBlockIdRef.current === block.id) return
                                            const displayContent =
                                                contentOverridesRef.current.get(block.id) ?? block.content
                                            const displayBlock =
                                                displayContent !== block.content
                                                    ? { ...block, content: displayContent }
                                                    : block
                                            startEditBlock(displayBlock)
                                        }}
                                        onClick={(event) => event.stopPropagation()}
                                        onInput={() => {
                                            renderedMarkdownDirtyBlockIdRef.current = block.id
                                        }}
                                        onBlur={(event) => handleRenderedMarkdownBlur(event, block)}
                                        onKeyDown={handleRenderedMarkdownKeyDown}
                                        className="outline-none focus:outline-none"
                                    >
                                        <Markdown
                                            content={normalizeNewlinesForMarkdown(blockContent)}
                                        />
                                    </div>
                                ) : editMode && editingBlockId === block.id ? (
                                    <>
                                        <div aria-hidden style={{ visibility: 'hidden' }}>
                                            <Markdown content={normalizeNewlinesForMarkdown(blockContent)} />
                                        </div>
                                        <textarea
                                            ref={textareaRef}
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            onBlur={() => handleEditBlur()}
                                            onKeyDown={handleKeyDown}
                                            className={INLINE_EDIT_TEXTAREA_CLASS_NAME}
                                            style={INLINE_EDIT_TEXTAREA_STYLE}
                                        />
                                    </>
                                ) : isDiffActive && blockDiffState === 'updated' && blockContentDiff && diffSide ? (
                                    <DiffHighlightRenderer
                                        segments={blockContentDiff}
                                        side={diffSide}
                                    />
                                ) : (
                                    <Markdown
                                        content={normalizeNewlinesForMarkdown(blockContent)}
                                    />
                                )}
                            </div>
                        )
                    })}
                    {footerContent && (
                        <div className="pt-2 text-center text-sm text-gray-500">{footerContent}</div>
                    )}
                </div>

    )
}
