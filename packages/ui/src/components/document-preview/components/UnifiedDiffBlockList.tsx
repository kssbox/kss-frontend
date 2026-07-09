/**
 * UnifiedDiffBlockList Component
 *
 * Renders a single-column unified diff view showing deletions (red) and additions
 * (green) inline together. Each block is rendered as a row with a colored left border
 * and a state indicator (+/-/~/space). Updated blocks show character-level diffs.
 */

import React from 'react'
import type { ParseBlock, ContentDiffSegment } from '../types'
import type { DiffResult } from '../core/DiffComputer'
import { DiffHighlightRenderer } from './DiffHighlightRenderer'

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

type DiffState = 'added' | 'deleted' | 'updated' | 'moved' | 'unchanged'

interface MergedDiffBlock {
    id: string
    block: ParseBlock
    state: DiffState
    originalBlock?: ParseBlock
    currentBlock?: ParseBlock
    contentDiff?: ContentDiffSegment[]
}

interface UnifiedDiffBlockListProps {
    diffResult: DiffResult
    originalBlocks: ParseBlock[]
    editedBlocks: ParseBlock[]
    diffOnly?: boolean
    className?: string
}

// ─────────────────────────────────────────────────────
// Build merged ordered block list
// ─────────────────────────────────────────────────────

function buildMergedList(
    originalBlocks: ParseBlock[],
    editedBlocks: ParseBlock[],
    diffResult: DiffResult,
): MergedDiffBlock[] {
    const deletedIds = new Set(diffResult.deleted.map(b => b.id))
    const updatedMap = new Map(diffResult.updated.map(b => [b.id, b]))
    const addedIds = new Set(diffResult.added.map(b => b.id))
    const movedIds = new Set(diffResult.moved.map(b => b.id))
    const originalMap = new Map(originalBlocks.map(b => [b.id, b]))

    // Position of each ID in the original array (for ordering deleted blocks)
    const originalIndexMap = new Map<string, number>()
    originalBlocks.forEach((b, i) => originalIndexMap.set(b.id, i))

    const merged: MergedDiffBlock[] = []
    let lastOriginalIndex = -1

    // Walk edited blocks in document order; insert deleted blocks where they belonged
    for (const editedBlock of editedBlocks) {
        const origIndex = originalIndexMap.get(editedBlock.id) ?? -1

        // Insert deleted blocks that fall between lastOriginalIndex and this block's original position
        if (origIndex >= 0) {
            for (let i = lastOriginalIndex + 1; i < origIndex; i++) {
                const origBlock = originalBlocks[i]
                if (deletedIds.has(origBlock.id)) {
                    merged.push({ id: origBlock.id, block: origBlock, state: 'deleted' })
                }
            }
            lastOriginalIndex = origIndex
        }

        if (addedIds.has(editedBlock.id)) {
            merged.push({ id: editedBlock.id, block: editedBlock, state: 'added', currentBlock: editedBlock })
        } else if (updatedMap.has(editedBlock.id)) {
            const updatedBlock = updatedMap.get(editedBlock.id)!
            merged.push({
                id: editedBlock.id,
                block: updatedBlock,
                state: 'updated',
                originalBlock: originalMap.get(editedBlock.id),
                currentBlock: updatedBlock,
                contentDiff: (updatedBlock as ParseBlock & { contentDiff?: ContentDiffSegment[] }).contentDiff,
            })
        } else if (movedIds.has(editedBlock.id)) {
            merged.push({
                id: editedBlock.id,
                block: editedBlock,
                state: 'moved',
                originalBlock: originalMap.get(editedBlock.id),
                currentBlock: editedBlock,
            })
        } else {
            merged.push({ id: editedBlock.id, block: editedBlock, state: 'unchanged' })
        }
    }

    // Append any remaining deleted blocks from the tail of the original array
    for (let i = lastOriginalIndex + 1; i < originalBlocks.length; i++) {
        const origBlock = originalBlocks[i]
        if (deletedIds.has(origBlock.id)) {
            merged.push({ id: origBlock.id, block: origBlock, state: 'deleted' })
        }
    }

    return merged
}

// ─────────────────────────────────────────────────────
// Per-state styling / labels
// ─────────────────────────────────────────────────────

const STATE_STYLES: Record<DiffState, { row: string; marker: string; label: string }> = {
    added: { row: 'bg-green-50 border-l-4 border-green-500', marker: '+', label: 'text-green-700' },
    deleted: { row: 'bg-red-50 border-l-4 border-red-500', marker: '−', label: 'text-red-700' },
    updated: { row: 'bg-yellow-50 border-l-4 border-yellow-400', marker: '~', label: 'text-yellow-700' },
    moved: { row: 'bg-blue-50 border-l-4 border-blue-400', marker: '↕', label: 'text-blue-700' },
    unchanged: { row: '', marker: ' ', label: 'text-gray-400' },
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

// ─────────────────────────────────────────────────────
// Single block row
// ─────────────────────────────────────────────────────

function BlockRow({ item }: { item: MergedDiffBlock }) {
    const { block, state, originalBlock, currentBlock, contentDiff } = item
    const s = STATE_STYLES[state]

    // For unchanged blocks, only render if they have content (skip visual noise)
    const typeLabel = BLOCK_TYPE_LABEL[block.type] ?? block.type

    const renderPlainText = (text: string) => {
        if (!text) {
            return <span className="text-gray-400 italic text-xs">(空)</span>
        }

        return (
            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {text}
            </div>
        )
    }

    const renderComparison = () => {
        if (state !== 'updated') return null

        return (
            <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-red-200 bg-red-50/70 px-3 py-2">
                    <div className="mb-1 text-[11px] font-medium text-red-700">AI解析的原始版本</div>
                    {contentDiff && contentDiff.length > 0
                        ? <DiffHighlightRenderer segments={contentDiff} side="original" />
                        : renderPlainText(originalBlock?.content ?? '')}
                </div>
                <div className="rounded-md border border-green-200 bg-green-50/70 px-3 py-2">
                    <div className="mb-1 text-[11px] font-medium text-green-700">当前版本</div>
                    {contentDiff && contentDiff.length > 0
                        ? <DiffHighlightRenderer segments={contentDiff} side="current" />
                        : renderPlainText(currentBlock?.content ?? block.content ?? '')}
                </div>
            </div>
        )
    }

    const renderContent = () => {
        if (state === 'updated') {
            return renderComparison()
        }

        if (state === 'moved') {
            return (
                <div className="space-y-2">
                    <div className="text-xs text-blue-700">内容位置发生变化</div>
                    {renderPlainText(currentBlock?.content ?? block.content ?? '')}
                </div>
            )
        }

        const text = (currentBlock ?? originalBlock ?? block).content ?? ''

        return renderPlainText(text)
    }

    return (
        <div className={`flex gap-0 ${s.row} ${state === 'unchanged' ? 'opacity-70' : ''}`}>
            {/* State marker column */}
            <div className={`w-6 shrink-0 flex items-start justify-center pt-2 font-mono text-sm font-bold select-none ${s.label}`}>
                {s.marker}
            </div>

            {/* Content column */}
            <div className="flex-1 px-2 py-1.5 min-w-0">
                <div className={`text-[10px] font-medium uppercase tracking-wide mb-0.5 ${s.label}`}>
                    {typeLabel}
                </div>
                {renderContent()}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────

export const UnifiedDiffBlockList: React.FC<UnifiedDiffBlockListProps> = ({
    diffResult,
    originalBlocks,
    editedBlocks,
    diffOnly,
    className,
}) => {
    let mergedList = React.useMemo(
        () => buildMergedList(originalBlocks, editedBlocks, diffResult),
        [originalBlocks, editedBlocks, diffResult],
    )

    if (diffOnly) {
        mergedList = mergedList.filter(item => item.state !== 'unchanged')
    }

    if (mergedList.length === 0) {
        return (
            <div className={`flex items-center justify-center h-32 text-sm text-gray-400 ${className ?? ''}`}>
                无内容
            </div>
        )
    }

    return (
        <div className={`divide-y divide-gray-100 border border-gray-200 rounded-md overflow-hidden ${className ?? ''}`}>
            {mergedList.map(item => (
                <BlockRow key={`${item.state}-${item.id}`} item={item} />
            ))}
        </div>
    )
}
