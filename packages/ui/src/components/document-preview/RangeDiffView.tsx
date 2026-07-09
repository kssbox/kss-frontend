/**
 * RangeDiffView Component
 * Supports two diff view modes:
 * - 'split'  : Side-by-side two-column view (original left, edited right)
 * - 'unified': Single-column inline view with deletions (red) and additions (green)
 */

import { useEffect, useMemo, useRef } from 'react';
import { RangePreviewRenderer } from './RangePreviewRenderer';
import type { JSX } from 'react';
import { DebugPanel } from './components/DebugPanel';
import { DiffComputer, type DiffResult } from './core/DiffComputer';
import { getBlocks } from './types';
import type { RangeDiffProps, ParseBlock, DiffOperation } from './types';
import { DiffOnlyCardList } from './components/DiffOnlyCardList';

/**
 * Build a block-click handler that resolves the clicked block's diff operation.
 */
function buildDiffBlockClickHandler(
    diffData: DiffResult,
    side: 'original' | 'current' | 'unified',
    onDiffBlockClick: RangeDiffProps['onDiffBlockClick'],
) {
    if (!onDiffBlockClick) return undefined

    // Which category lists to search depends on the side
    const searchLists =
        side === 'original'
            ? (['deleted', 'updated', 'moved', 'unchanged'] as const)
            : (['added', 'updated', 'moved', 'unchanged'] as const)

    return (block: ParseBlock) => {
        let found: ParseBlock | undefined
        let operation: DiffOperation = 'unchanged'

        for (const cat of searchLists) {
            const match = diffData[cat].find((b: ParseBlock) => b.id === block.id)
            if (match) {
                found = match
                operation = cat
                break
            }
        }

        if (found) {
            onDiffBlockClick({
                block_id: found.id,
                operation,
                ...(side === 'original' ? { originalBlock: block } : { editedBlock: block }),
            })
        }
    }
}

function syncScrollPosition(source: HTMLDivElement, target: HTMLDivElement) {
    const sourceMaxTop = Math.max(1, source.scrollHeight - source.clientHeight)
    const targetMaxTop = Math.max(0, target.scrollHeight - target.clientHeight)
    const sourceMaxLeft = Math.max(1, source.scrollWidth - source.clientWidth)
    const targetMaxLeft = Math.max(0, target.scrollWidth - target.clientWidth)

    const topRatio = source.scrollTop / sourceMaxTop
    const leftRatio = source.scrollLeft / sourceMaxLeft

    target.scrollTop = targetMaxTop * topRatio
    target.scrollLeft = targetMaxLeft * leftRatio
}

export function RangeDiffView(props: RangeDiffProps): JSX.Element {
    const {
        rangeData,
        diffViewMode = 'split',
        zoom = 1.0,
        debug = false,
        onDiffBlockClick,
        resolveImageUrl,
        diffOnly,
        hideMetadata,
        className,
    } = props;
    const rootRef = useRef<HTMLDivElement | null>(null)

    /**
     * Compute diff data
     */
    const diffData = useMemo(() => {
        const original = rangeData.parse_result;
        const edited = rangeData.edited_parse_result;

        if (!original || !edited) {
            return null;
        }

        const computer = new DiffComputer();
        return computer.compute(getBlocks(original), getBlocks(edited));
    }, [rangeData]);

    useEffect(() => {
        if (diffViewMode !== 'split' || !rangeData.parse_result || !rangeData.edited_parse_result) {
            return
        }

        let frameId = 0
        let cleanup: (() => void) | undefined

        const attachSync = () => {
            const containers = rootRef.current?.querySelectorAll<HTMLDivElement>('[data-range-preview-scroll="true"]')
            const left = containers?.[0]
            const right = containers?.[1]

            if (!left || !right) {
                frameId = requestAnimationFrame(attachSync)
                return
            }

            let activeSource: 'left' | 'right' = 'left'
            let isProgrammaticSync = false
            let syncFrame = 0

            const runSync = () => {
                syncFrame = 0
                isProgrammaticSync = true
                if (activeSource === 'left') {
                    syncScrollPosition(left, right)
                } else {
                    syncScrollPosition(right, left)
                }
                requestAnimationFrame(() => {
                    isProgrammaticSync = false
                })
            }

            const scheduleSync = (source: 'left' | 'right') => {
                if (isProgrammaticSync) return
                activeSource = source
                if (syncFrame) cancelAnimationFrame(syncFrame)
                syncFrame = requestAnimationFrame(runSync)
            }

            const handleLeftScroll = () => scheduleSync('left')
            const handleRightScroll = () => scheduleSync('right')

            left.addEventListener('scroll', handleLeftScroll, { passive: true })
            right.addEventListener('scroll', handleRightScroll, { passive: true })

            const resizeObserver = new ResizeObserver(() => {
                scheduleSync(activeSource)
            })
            resizeObserver.observe(left)
            resizeObserver.observe(right)

            syncFrame = requestAnimationFrame(runSync)

            cleanup = () => {
                if (syncFrame) cancelAnimationFrame(syncFrame)
                left.removeEventListener('scroll', handleLeftScroll)
                right.removeEventListener('scroll', handleRightScroll)
                resizeObserver.disconnect()
            }
        }

        attachSync()

        return () => {
            cancelAnimationFrame(frameId)
            cleanup?.()
        }
    }, [diffViewMode, diffOnly, rangeData.parse_result, rangeData.edited_parse_result, rangeData.range_id, rangeData.updated_at])

    // Verify we have both versions
    if (!rangeData.parse_result || !rangeData.edited_parse_result) {
        return (
            <div ref={rootRef} className={className}>
                <div className="flex h-64 items-center justify-center rounded-md bg-slate-50 text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                    <div className="text-sm">
                        {!rangeData.parse_result && !rangeData.edited_parse_result
                            ? 'No parse results available'
                            : 'Diff requires both original and edited versions'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef} className={`flex flex-col h-full min-h-0 ${className || ''}`}>
            {diffOnly && diffData ? (
                /* ── Diff Only view: clearer per-change cards with side-by-side comparison ── */
                <div className="flex-1 min-h-0 overflow-auto bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:p-5">
                    <DiffOnlyCardList
                        diffResult={diffData}
                        originalBlocks={getBlocks(rangeData.parse_result)}
                        editedBlocks={getBlocks(rangeData.edited_parse_result || rangeData.parse_result)}
                    />
                </div>
            ) : diffViewMode === 'unified' ? (
                /* ── Unified view: single-column with inline deleted+added chars ── */
                <div className="flex-1 min-h-0">
                    <RangePreviewRenderer
                        rangeData={rangeData}
                        mode="edited"
                        zoom={zoom}
                        debug={debug}
                        diffMode={true}
                        diffData={diffData || undefined}
                        diffSide="unified"
                        resolveImageUrl={resolveImageUrl}
                        hideMetadata={hideMetadata}
                        onBlockClick={diffData ? buildDiffBlockClickHandler(diffData, 'unified', onDiffBlockClick) : undefined}
                    />
                </div>
            ) : (
                /* ── Split view: side-by-side two-column layout ── */
                <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                    {/* Original (Left) */}
                    <div className="flex flex-col min-h-0">
                        <div className="mb-2 shrink-0 rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 dark:border-sky-500/30 dark:bg-sky-500/12">
                            <span className="text-sm font-medium text-sky-900 dark:text-sky-200">AI解析的原始版本</span>
                        </div>
                        <RangePreviewRenderer
                            rangeData={rangeData}
                            mode="original"
                            zoom={zoom}
                            debug={debug}
                            diffMode={true}
                            diffData={diffData || undefined}
                            diffSide="original"
                            resolveImageUrl={resolveImageUrl}
                            hideMetadata={hideMetadata}
                            onBlockClick={diffData ? buildDiffBlockClickHandler(diffData, 'original', onDiffBlockClick) : undefined}
                        />
                    </div>

                    {/* Current/Edited (Right) */}
                    <div className="flex flex-col min-h-0">
                        <div className="mb-2 shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-500/30 dark:bg-emerald-500/12">
                            <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">当前版本</span>
                        </div>
                        <RangePreviewRenderer
                            rangeData={rangeData}
                            mode="edited"
                            zoom={zoom}
                            debug={debug}
                            diffMode={true}
                            diffData={diffData || undefined}
                            diffSide="current"
                            resolveImageUrl={resolveImageUrl}
                            hideMetadata={hideMetadata}
                            onBlockClick={diffData ? buildDiffBlockClickHandler(diffData, 'current', onDiffBlockClick) : undefined}
                        />
                    </div>
                </div>
            )}

            {/* Debug Panel */}
            {debug && <DebugPanel diffData={diffData} visible={debug} />}
        </div>
    );
}
