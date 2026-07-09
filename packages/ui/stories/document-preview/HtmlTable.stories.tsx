/**
 * HTML Table Range Story
 * Demonstrates HTML table rendering and character-level diff
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RangePreviewRenderer } from '../../src/components/document-preview/RangePreviewRenderer';
import { RangeDiffView } from '../../src/components/document-preview/RangeDiffView';
import htmlTableData from './mock-data/html-table-range.json';
import type { VirtualRangeResponse } from '../../src/components/document-preview/types';

const meta: Meta<typeof RangePreviewRenderer> = {
    title: 'Range Preview/HTML Table',
    component: RangePreviewRenderer,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * HTML Table Rendering
 * Shows HTML table block rendered in canvas
 */
export const BasicHtmlTable: Story = {
    args: {
        rangeData: htmlTableData as VirtualRangeResponse,
        mode: 'original',
        zoom: 1.0,
        debug: true,
    },
};

/**
 * Edited HTML Table
 * Shows edited version with additional column
 */
export const EditedHtmlTable: Story = {
    args: {
        rangeData: htmlTableData as VirtualRangeResponse,
        mode: 'edited',
        zoom: 1.0,
        debug: true,
    },
};

/**
 * Character-Level Diff View
 * Shows side-by-side comparison with character-level differences highlighted
 */
export const CharacterDiffView: Story = {
    render: () => {
        return (
            <div>
                <div className="mb-4 p-4 bg-purple-50 rounded-md border border-purple-200">
                    <div className="text-sm font-medium text-purple-900 mb-2">
                        🔍 Character-Level Diff
                    </div>
                    <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                        <li>Heading: "Product Comparison Table" → "Updated Product Comparison"</li>
                        <li>HTML Table: Added "Stock" column with values</li>
                        <li>Price changes: Laptop A $999 → $899</li>
                        <li>Rating update: Laptop B 4.8/5 → 4.9/5</li>
                        <li>Text: Added "and stock availability"</li>
                    </ul>
                </div>

                <RangeDiffView
                    rangeData={htmlTableData as VirtualRangeResponse}
                    zoom={0.8}
                    debug={true}
                />
            </div>
        );
    },
};

/**
 * HTML Table with Debug
 * Shows debug information including character-level diff segments
 */
export const HtmlTableWithDebug: Story = {
    render: () => {
        return (
            <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <div className="text-sm font-medium text-blue-900 mb-2">
                        🐛 Debug Mode
                    </div>
                    <p className="text-sm text-blue-800">
                        Debug overlays show bounding boxes, block IDs, and character-level diff information.
                    </p>
                </div>

                <RangePreviewRenderer
                    rangeData={htmlTableData as VirtualRangeResponse}
                    mode="auto"
                    zoom={1.0}
                    debug={true}
                />
            </div>
        );
    },
};
