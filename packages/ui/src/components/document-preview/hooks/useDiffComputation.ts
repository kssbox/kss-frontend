import { useState, useMemo, useEffect } from 'react'
import type { ParseBlock, VirtualRangeResponse, ContentDiffSegment } from '../types'
import { getBlocks } from '../types'
import { DiffComputer, type DiffResult } from '../core'

type DiffState = 'added' | 'deleted' | 'updated' | 'moved' | 'unchanged'

/**
 * Pre-computed diff state map for O(1) lookups.
 */
function buildDiffStateMap(
    diffData: DiffResult,
    diffSide?: 'original' | 'current' | 'unified',
): Map<string, DiffState> {
    const map = new Map<string, DiffState>()

    if (diffSide === 'original') {
        for (const b of diffData.deleted) map.set(b.id, 'deleted')
        for (const b of diffData.updated) map.set(b.id, 'updated')
        for (const b of diffData.moved) map.set(b.id, 'moved')
    } else if (diffSide === 'current') {
        for (const b of diffData.added) map.set(b.id, 'added')
        for (const b of diffData.updated) map.set(b.id, 'updated')
        for (const b of diffData.moved) map.set(b.id, 'moved')
    } else {
        for (const b of diffData.added) map.set(b.id, 'added')
        for (const b of diffData.deleted) map.set(b.id, 'deleted')
        for (const b of diffData.updated) map.set(b.id, 'updated')
        for (const b of diffData.moved) map.set(b.id, 'moved')
    }

    return map
}

interface UseDiffComputationOptions {
    rangeData: VirtualRangeResponse
    diffMode: boolean
    externalDiffData: DiffResult | undefined
    diffSide?: 'original' | 'current' | 'unified'
}

/**
 * Computes and caches diff data, diff state map, and content diff map.
 */
export function useDiffComputation({
    rangeData,
    diffMode,
    externalDiffData,
    diffSide,
}: UseDiffComputationOptions) {
    const [internalDiffData, setInternalDiffData] = useState<DiffResult | null>(null)

    const diffDataToUse = useMemo(() => {
        return diffMode ? externalDiffData || internalDiffData : null
    }, [diffMode, externalDiffData, internalDiffData])

    // Compute diff on mount if in diff mode
    useEffect(() => {
        if (!diffMode || externalDiffData) return
        const original = rangeData.parse_result
        const edited = rangeData.edited_parse_result
        if (original && edited) {
            const computer = new DiffComputer()
            const result = computer.compute(getBlocks(original), getBlocks(edited))
            setInternalDiffData(result)
        }
    }, [diffMode, externalDiffData, rangeData])

    // Pre-computed diff state map (O(1) lookups)
    const diffStateMap = useMemo(() => {
        if (!diffDataToUse) return null
        return buildDiffStateMap(diffDataToUse, diffSide)
    }, [diffDataToUse, diffSide])

    // Pre-computed contentDiff map for updated blocks
    const contentDiffMap = useMemo(() => {
        if (!diffDataToUse) return null
        const map = new Map<string, ContentDiffSegment[]>()
        for (const b of diffDataToUse.updated) {
            const bWithDiff = b as ParseBlock & { contentDiff?: ContentDiffSegment[] }
            if (bWithDiff.contentDiff) {
                map.set(b.id, bWithDiff.contentDiff)
            }
        }
        return map
    }, [diffDataToUse])

    return {
        diffDataToUse,
        diffStateMap,
        contentDiffMap,
    }
}
