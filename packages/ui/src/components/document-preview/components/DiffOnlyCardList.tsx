import React from 'react'
import { Markdown } from '../../markdown'
import type { ParseBlock, ContentDiffSegment } from '../types'
import type { DiffResult } from '../core/DiffComputer'
import { DiffHighlightRenderer } from './DiffHighlightRenderer'
import { HtmlTableCellEditor } from './HtmlTableCellEditor'

type DiffState = 'added' | 'deleted' | 'updated' | 'moved'

interface DiffOnlyCardListProps {
    diffResult: DiffResult
    originalBlocks: ParseBlock[]
    editedBlocks: ParseBlock[]
    className?: string
}

interface ChangedBlockCard {
    id: string
    state: DiffState
    originalBlock?: ParseBlock
    editedBlock?: ParseBlock
    contentDiff?: ContentDiffSegment[]
}

const STATE_META: Record<DiffState, { badge: string; badgeClass: string; description: string }> = {
    added: {
        badge: '新增',
        badgeClass: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30',
        description: '当前版本新增了这一段内容。',
    },
    deleted: {
        badge: '删除',
        badgeClass: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-500/30',
        description: '这一段仅存在于原始解析结果中。',
    },
    updated: {
        badge: '修改',
        badgeClass: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30',
        description: '左右两侧直接对照修改前后内容。',
    },
    moved: {
        badge: '位置变化',
        badgeClass: 'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30',
        description: '内容本身未变，位置发生调整。',
    },
}

const BLOCK_TYPE_LABEL: Record<string, string> = {
    text: '文本',
    heading: '标题',
    table: '表格',
    image: '图片',
    formula: '公式',
    list: '列表',
    code: '代码',
    html: 'HTML',
}

function getBlockLabel(block?: ParseBlock): string {
    if (!block) return '内容'
    const sheetName = String(block.attrs?.sheet_name || block.attrs?.alt_text || '').trim()
    const blockType = BLOCK_TYPE_LABEL[block.type] ?? block.type
    return sheetName ? `${sheetName} / ${blockType}` : blockType
}

function isHtmlTableBlock(block?: ParseBlock): boolean {
    if (!block) return false
    const html = typeof block.attrs?.html === 'string' ? block.attrs.html : block.content
    return typeof html === 'string' && /<table/i.test(html)
}

function getBlockHtml(block?: ParseBlock): string {
    if (!block) return ''
    if (typeof block.attrs?.html === 'string' && block.attrs.html.trim()) return block.attrs.html
    return block.content
}

function buildChangedCards(
    originalBlocks: ParseBlock[],
    editedBlocks: ParseBlock[],
    diffResult: DiffResult,
): ChangedBlockCard[] {
    const deletedIds = new Set(diffResult.deleted.map((block) => block.id))
    const addedIds = new Set(diffResult.added.map((block) => block.id))
    const movedIds = new Set(diffResult.moved.map((block) => block.id))
    const updatedMap = new Map(diffResult.updated.map((block) => [block.id, block]))
    const originalMap = new Map(originalBlocks.map((block) => [block.id, block]))
    const originalIndexMap = new Map<string, number>()

    originalBlocks.forEach((block, index) => {
        originalIndexMap.set(block.id, index)
    })

    const cards: ChangedBlockCard[] = []
    let lastOriginalIndex = -1

    for (const editedBlock of editedBlocks) {
        const originalIndex = originalIndexMap.get(editedBlock.id) ?? -1

        if (originalIndex >= 0) {
            for (let index = lastOriginalIndex + 1; index < originalIndex; index += 1) {
                const originalBlock = originalBlocks[index]
                if (deletedIds.has(originalBlock.id)) {
                    cards.push({
                        id: originalBlock.id,
                        state: 'deleted',
                        originalBlock,
                    })
                }
            }
            lastOriginalIndex = originalIndex
        }

        if (addedIds.has(editedBlock.id)) {
            cards.push({
                id: editedBlock.id,
                state: 'added',
                editedBlock,
            })
            continue
        }

        const updatedBlock = updatedMap.get(editedBlock.id)
        if (updatedBlock) {
            cards.push({
                id: editedBlock.id,
                state: 'updated',
                originalBlock: originalMap.get(editedBlock.id),
                editedBlock: updatedBlock,
                contentDiff: updatedBlock.contentDiff,
            })
            continue
        }

        if (movedIds.has(editedBlock.id)) {
            cards.push({
                id: editedBlock.id,
                state: 'moved',
                originalBlock: originalMap.get(editedBlock.id),
                editedBlock,
            })
        }
    }

    for (let index = lastOriginalIndex + 1; index < originalBlocks.length; index += 1) {
        const originalBlock = originalBlocks[index]
        if (deletedIds.has(originalBlock.id)) {
            cards.push({
                id: originalBlock.id,
                state: 'deleted',
                originalBlock,
            })
        }
    }

    return cards
}

function EmptyPane({ label }: { label: string }) {
    return (
        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-500">
            {label}
        </div>
    )
}

function PlainBlockContent({ block }: { block?: ParseBlock }) {
    if (!block) return <EmptyPane label="无内容" />

    const content = block.content?.trim()
    if (!content) {
        return <EmptyPane label="空内容" />
    }

    const looksLikeTableText = /\|/.test(content) || /\n-[-| ]+/.test(content)
    const wrapperClassName = looksLikeTableText
        ? 'rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-[13px] leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
        : 'rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

    return (
        <div className={wrapperClassName}>
            <Markdown content={content} />
        </div>
    )
}

function BlockPane({
    title,
    accentClass,
    emptyLabel,
    block,
    side,
    compareBlock,
    contentDiff,
    state,
}: {
    title: string
    accentClass: string
    emptyLabel: string
    block?: ParseBlock
    side: 'original' | 'current'
    compareBlock?: ParseBlock
    contentDiff?: ContentDiffSegment[]
    state: DiffState
}) {
    const tableLike = isHtmlTableBlock(block)

    return (
        <div className="space-y-3">
            <div className={`flex items-center rounded-xl px-4 py-2 ${accentClass}`}>
                <span className="text-sm font-semibold">{title}</span>
            </div>

            {!block ? (
                <EmptyPane label={emptyLabel} />
            ) : tableLike ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <HtmlTableCellEditor
                        html={getBlockHtml(block)}
                        left={0}
                        top={0}
                        width={800}
                        inline
                        diffOnly
                        viewOnly
                        onSave={() => undefined}
                        onClose={() => undefined}
                        diffState={state}
                        diffSide={side}
                        compareHtml={compareBlock ? getBlockHtml(compareBlock) : undefined}
                    />
                </div>
            ) : state === 'updated' && contentDiff && contentDiff.length > 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                    <DiffHighlightRenderer segments={contentDiff} side={side} className="text-sm leading-7 text-slate-700 dark:text-slate-200" />
                </div>
            ) : (
                <PlainBlockContent block={block} />
            )}
        </div>
    )
}

export const DiffOnlyCardList: React.FC<DiffOnlyCardListProps> = ({
    diffResult,
    originalBlocks,
    editedBlocks,
    className,
}) => {
    const cards = React.useMemo(
        () => buildChangedCards(originalBlocks, editedBlocks, diffResult),
        [diffResult, originalBlocks, editedBlocks],
    )

    if (cards.length === 0) {
        return (
            <div className={`flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 ${className ?? ''}`}>
                当前没有可展示的差异
            </div>
        )
    }

    return (
        <div className={`space-y-5 ${className ?? ''}`}>
            {cards.map((card, index) => {
                const meta = STATE_META[card.state]
                const displayBlock = card.editedBlock ?? card.originalBlock

                return (
                    <section
                        key={`${card.state}-${card.id}`}
                        className="overflow-hidden rounded-2xl border border-[#e5dcc6] bg-[#fffdf8] shadow-sm dark:border-slate-700 dark:bg-slate-900/95"
                    >
                        <div className="flex flex-wrap items-center gap-3 border-b border-[#efe5d0] bg-[#faf4e6] px-5 py-4 dark:border-slate-700 dark:bg-slate-900/80">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">差异 {index + 1}</span>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${meta.badgeClass}`}>
                                {meta.badge}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-300">{getBlockLabel(displayBlock)}</span>
                            <span className="text-sm text-slate-400 dark:text-slate-400">{meta.description}</span>
                        </div>

                        <div className="grid gap-4 p-5 lg:grid-cols-2">
                            <BlockPane
                                title="AI解析的原始版本"
                                accentClass="bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-200"
                                emptyLabel="当前版本中没有这部分原始内容"
                                block={card.originalBlock}
                                side="original"
                                compareBlock={card.editedBlock}
                                contentDiff={card.contentDiff}
                                state={card.state}
                            />
                            <BlockPane
                                title="当前版本"
                                accentClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-200"
                                emptyLabel="当前版本未保留这部分内容"
                                block={card.editedBlock}
                                side="current"
                                compareBlock={card.originalBlock}
                                contentDiff={card.contentDiff}
                                state={card.state}
                            />
                        </div>
                    </section>
                )
            })}
        </div>
    )
}