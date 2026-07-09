/**
 * Storybook stories for RangePreviewRenderer
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RangePreviewRenderer } from '../../src/components/document-preview/RangePreviewRenderer';
import type { VirtualRangeResponse } from '../../src/components/document-preview/types';

// Import mock data
import simpleRangeData from './mock-data/simple-range.json';
import editedRangeData from './mock-data/edited-range.json';
import realRangeData from './mock-data/real-range.json';
import bankTableRangeData from './mock-data/bank-table-range.json';

const meta: Meta<typeof RangePreviewRenderer> = {
    title: 'Range Preview/Renderer',
    component: RangePreviewRenderer,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RangePreviewRenderer>;

/**
 * Default view - showing original parse result
 */
export const Default: Story = {
    args: {
        rangeData: simpleRangeData as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * With debug mode enabled - shows bounding boxes and debug info
 */
export const DebugMode: Story = {
    args: {
        rangeData: simpleRangeData as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: true,
    },
};

/**
 * Zoomed in view (150%)
 */
export const ZoomedIn: Story = {
    args: {
        rangeData: simpleRangeData as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.5,
        debug: false,
    },
};

/**
 * Zoomed out view (75%)
 */
export const ZoomedOut: Story = {
    args: {
        rangeData: simpleRangeData as VirtualRangeResponse,
        mode: 'auto',
        zoom: 0.75,
        debug: false,
    },
};

/**
 * Range with edits - showing edited version (auto mode)
 */
export const WithEdits: Story = {
    args: {
        rangeData: editedRangeData as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * Range with edits - showing original version
 */
export const ShowingOriginal: Story = {
    args: {
        rangeData: editedRangeData as VirtualRangeResponse,
        mode: 'original',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * Range with edits - showing edited version explicitly
 */
export const ShowingEdited: Story = {
    args: {
        rangeData: editedRangeData as VirtualRangeResponse,
        mode: 'edited',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * With block click handler
 */
export const WithClickHandler: Story = {
    args: {
        rangeData: simpleRangeData as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: false,
        onBlockClick: (block) => {
            alert(`Clicked block: ${block.type} (ID: ${block.id})\nContent: ${block.content?.substring(0, 50)}...`);
        },
    },
};

/**
 * Processing status - Pending
 */
export const ProcessingPending: Story = {
    args: {
        rangeData: {
            ...simpleRangeData,
            processing_status: 0,
        } as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * Processing status - Parsing
 */
export const ProcessingParsing: Story = {
    args: {
        rangeData: {
            ...simpleRangeData,
            processing_status: 1,
        } as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * No parse result available
 */
export const NoParseResult: Story = {
    args: {
        rangeData: {
            ...simpleRangeData,
            parse_result: null,
            edited_parse_result: null,
        } as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * Real API Data - Chinese medical document
 * 
 * This story uses actual data fetched from the API endpoint:
 * http://127.0.0.1:8800/v1/knowledge_bases/131302951741378560/documents/803835113614954496/ranges
 * 
 * Data characteristics:
 * - Parser: MineruParser
 * - Content: Chinese medical remedies document
 * - Contains multiple block types: heading, text, list, image
 * - Has 20 pages with 19 images
 * - Demonstrates real-world data structure
 */
export const RealAPIData: Story = {
    args: {
        rangeData: realRangeData as unknown as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * Real API Data - Debug Mode
 * Shows the actual API data with bounding boxes and debug information
 */
export const RealAPIDataDebug: Story = {
    args: {
        rangeData: realRangeData as unknown as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: true,
    },
};

/**
 * Real API Data - Zoomed In
 * Shows the actual API data at 150% zoom for better readability
 */
export const RealAPIDataZoomed: Story = {
    args: {
        rangeData: realRangeData as unknown as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.5,
        debug: false,
    },
};

/**
 * Bank Transaction Tables - Real API Data
 *
 * Data from: /api/v1/file_data/ranges (bank statement PDF)
 *
 * Tests critical rendering scenarios:
 * - Table blocks with attrs.html (preferred) vs markdown content
 * - Text blocks with \n newlines in content
 * - Multi-page layout with tables spanning most of each page
 * - 20 pages, 220+ blocks
 */
export const BankTableData: Story = {
    args: {
        rangeData: bankTableRangeData as unknown as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: false,
    },
};

/**
 * Bank Transaction Tables - Debug Mode
 */
export const BankTableDataDebug: Story = {
    args: {
        rangeData: bankTableRangeData as unknown as VirtualRangeResponse,
        mode: 'auto',
        zoom: 1.0,
        debug: true,
    },
};
