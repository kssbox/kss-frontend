/**
 * Character-level Diff Algorithm
 * Uses Google's diff-match-patch library for accurate character-level diff
 */

import { diff_match_patch } from 'diff-match-patch';
import type { ContentDiffSegment } from '../types';

const dmp = new diff_match_patch();

/**
 * Compute character-level diff between two strings
 * Returns segments of added/deleted/unchanged text
 */
export function computeCharDiff(oldText: string, newText: string): ContentDiffSegment[] {
    if (oldText === newText) {
        return [{ type: 'unchanged', text: oldText }];
    }

    if (!oldText) {
        return [{ type: 'added', text: newText }];
    }

    if (!newText) {
        return [{ type: 'deleted', text: oldText }];
    }

    // Use diff-match-patch for character-level diff
    const diffs = dmp.diff_main(oldText, newText);

    // Optimize the diff for better human readability
    dmp.diff_cleanupSemantic(diffs);

    // Convert to ContentDiffSegment format
    const segments: ContentDiffSegment[] = [];

    for (const diff of diffs) {
        const [operation, text] = diff;

        // diff-match-patch operation codes:
        // DIFF_DELETE = -1 (deleted)
        // DIFF_INSERT = 1 (added)
        // DIFF_EQUAL = 0 (unchanged)
        let type: 'added' | 'deleted' | 'unchanged';

        if (operation === 1) {
            type = 'added';
        } else if (operation === -1) {
            type = 'deleted';
        } else {
            type = 'unchanged';
        }

        segments.push({ type, text });
    }

    return mergeSegments(segments);
}

/**
 * Merge consecutive segments of the same type
 */
function mergeSegments(segments: ContentDiffSegment[]): ContentDiffSegment[] {
    if (segments.length === 0) return [];

    const merged: ContentDiffSegment[] = [];
    let current = segments[0];

    for (let i = 1; i < segments.length; i++) {
        if (segments[i].type === current.type) {
            current = {
                type: current.type,
                text: current.text + segments[i].text,
            };
        } else {
            merged.push(current);
            current = segments[i];
        }
    }

    merged.push(current);
    return merged;
}
