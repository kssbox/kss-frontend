/**
 * Diff Computer for Range Preview
 * Computes differences between original and edited parse results
 */

import type {
    ParseBlock,
    ContentDiffSegment,
} from '../types';
import { computeCharDiff } from './CharDiff';

/**
 * Simplified DiffResult for component usage
 * Includes contentDiff for updated blocks
 */
export interface DiffResult {
    added: ParseBlock[];
    deleted: ParseBlock[];
    updated: Array<ParseBlock & { contentDiff?: ContentDiffSegment[] }>;
    moved: ParseBlock[];
    unchanged: ParseBlock[];
}

export class DiffComputer {
    /**
     * Simple compute method for component usage
     * Includes character-level contentDiff for updated blocks
     */
    compute(
        originalBlocks: ParseBlock[],
        editedBlocks: ParseBlock[]
    ): DiffResult {
        const result: DiffResult = {
            added: [],
            deleted: [],
            updated: [],
            moved: [],
            unchanged: [],
        };

        const originalMap = new Map(originalBlocks.map(b => [b.id, b]));
        const editedMap = new Map(editedBlocks.map(b => [b.id, b]));

        // Check for deleted and modified
        originalBlocks.forEach(orig => {
            const edited = editedMap.get(orig.id);
            if (!edited) {
                result.deleted.push(orig);
            } else if (this.hasContentChanged(orig, edited)) {
                // Include contentDiff for updated blocks
                result.updated.push({
                    ...edited,
                    contentDiff: this.computeContentDiff(orig.content, edited.content),
                });
            } else {
                result.unchanged.push(edited);
            }
        });

        // Check for added
        editedBlocks.forEach(edited => {
            if (!originalMap.has(edited.id)) {
                result.added.push(edited);
            }
        });

        return result;
    }

    /**
     * Check if a block's meaningful content has changed between original and edited.
     * Covers both the `content` text field and `attrs.html` (used by HTML table blocks).
     */
    private hasContentChanged(orig: ParseBlock, edited: ParseBlock): boolean {
        if (orig.content !== edited.content) return true;
        // HTML table blocks store their data in attrs.html; content may be empty/unchanged
        const origHtml = orig.attrs?.html as string | undefined;
        const editedHtml = edited.attrs?.html as string | undefined;
        if (origHtml !== editedHtml) return true;
        return false;
    }

    /**
     * Compute character-level diff between two strings
     * Uses Myers' diff algorithm via CharDiff module
     */
    private computeContentDiff(original: string, edited: string): ContentDiffSegment[] {
        return computeCharDiff(original, edited);
    }
}

