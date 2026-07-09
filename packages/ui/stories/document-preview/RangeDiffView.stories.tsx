/**
 * RangeDiffView Story
 * Demonstrates side-by-side comparison
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RangeDiffView } from '../../src/components/document-preview/RangeDiffView';
import editedRangeData from './mock-data/edited-range.json';
import realRangeEditedData from './mock-data/real-range-edited.json';
import type { VirtualRangeResponse } from '../../src/components/document-preview/types';

const meta: Meta<typeof RangeDiffView> = {
    title: 'Range Preview/Diff View',
    component: RangeDiffView,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Side-by-Side Diff
 * Shows original on left, edited on right with color coding
 */
export const SideBySideDiff: Story = {
    args: {
        rangeData: editedRangeData as VirtualRangeResponse,
        zoom: 0.8,
        debug: false,
    },
};

/**
 * Diff with Debug Panel
 */
export const WithDebugPanel: Story = {
    args: {
        rangeData: editedRangeData as VirtualRangeResponse,
        zoom: 0.8,
        debug: true,
    },
};

/**
 * Zoomed Diff View
 */
export const ZoomedIn: Story = {
    args: {
        rangeData: editedRangeData as VirtualRangeResponse,
        zoom: 1.2,
        debug: false,
    },
};

/**
 * Interactive Diff
 */
export const InteractiveDiff: Story = {
    render: () => {
        return (
            <div className="p-4">
                <div className="mb-4 p-4 bg-indigo-50 rounded-md border border-indigo-200">
                    <div className="text-sm font-medium text-indigo-900 mb-2">
                        🔀 Diff View Features
                    </div>
                    <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
                        <li><span className="inline-block w-3 h-3 bg-green-500 rounded-sm" /> Green = Added blocks</li>
                        <li><span className="inline-block w-3 h-3 bg-red-500 rounded-sm" /> Red = Deleted blocks</li>
                        <li><span className="inline-block w-3 h-3 bg-yellow-500 rounded-sm" /> Yellow = Updated blocks</li>
                        <li><span className="inline-block w-3 h-3 bg-purple-500 rounded-sm" /> Purple = Moved blocks</li>
                        <li>Click any block to see diff details</li>
                    </ul>
                </div>

                <RangeDiffView
                    rangeData={editedRangeData as VirtualRangeResponse}
                    zoom={0.9}
                    debug={true}
                    onDiffBlockClick={(diff) => {
                        console.log('Diff block clicked:', diff);
                        const block = diff.editedBlock || diff.originalBlock;
                        alert(`Clicked ${diff.operation} block:\n${JSON.stringify(block, null, 2)}`);
                    }}
                />
            </div>
        );
    },
};

/**
 * Real API Data Diff View
 * Shows real production data with added/deleted/updated/moved blocks
 */
export const RealDataDiff: Story = {
    render: () => {
        return (
            <div className="p-4">
                <div className="mb-4 p-4 bg-cyan-50 rounded-md border border-cyan-200">
                    <div className="text-sm font-medium text-cyan-900 mb-2">
                        📚 Real API Data - Diff View
                    </div>
                    <div className="text-sm text-cyan-800 space-y-1">
                        <p>220 blocks, 20 pages from production API</p>
                        <ul className="list-disc list-inside ml-2">
                            <li><span className="font-medium text-green-700">Added:</span> "本教材已更新至2024年最新版本" block</li>
                            <li><span className="font-medium text-red-700">Deleted:</span> "（五·四学制）" heading</li>
                            <li><span className="font-medium text-yellow-700">Updated:</span> "语文" → "中文", "一年级下册" → "一年级下册（修订版）"</li>
                            <li><span className="font-medium text-purple-700">Moved:</span> "人民教育出版社" heading position changed</li>
                        </ul>
                    </div>
                </div>

                <RangeDiffView
                    rangeData={realRangeEditedData as unknown as VirtualRangeResponse}
                    zoom={0.7}
                    debug={true}
                    onDiffBlockClick={(diff) => {
                        console.log('Real data diff block clicked:', diff);
                        const block = diff.editedBlock || diff.originalBlock;
                        const operation = diff.operation;
                        const content = block?.content || 'N/A';
                        alert(
                            `Operation: ${operation}\n` +
                            `Block ID: ${block?.id}\n` +
                            `Content: ${content}\n\n` +
                            `Full details in console.`
                        );
                    }}
                />
            </div>
        );
    },
};
