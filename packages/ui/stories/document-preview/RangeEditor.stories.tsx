/**
 * RangeEditor Story
 * Demonstrates editing capabilities
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RangePreviewRenderer } from '../../src/components/document-preview/RangePreviewRenderer';
import { useState, useMemo } from 'react';
import simpleRangeData from './mock-data/simple-range.json';
import editedRangeData from './mock-data/edited-range.json';
import realRangeData from './mock-data/real-range-edited.json';
import type { VirtualRangeResponse, BlockEdit, ParseBlock } from '../../src/components/document-preview/types';

// Type definition for edited block changes
interface EditedBlockChange {
    id: string;
    content?: string;
    type?: string;
    page?: number;
    attrs?: Record<string, any>;
    deleted?: boolean;
}

const meta: Meta<typeof RangePreviewRenderer> = {
    title: 'Range Preview/Editor',
    component: RangePreviewRenderer,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Interactive Editor
 * Double-click any block to edit
 */
export const InteractiveEditor: Story = {
    render: () => {
        const [rangeData, setRangeData] = useState<VirtualRangeResponse>(
            simpleRangeData as VirtualRangeResponse
        );

        const handleSaveEdit = (edits: BlockEdit[]) => {
            console.log('Saving edits:', edits);

            // Apply edits to rangeData
            const updatedRangeData = { ...rangeData };
            const currentBlocks = updatedRangeData.parse_result?.blocks || [];
            const updatedBlocks = currentBlocks.map(block => {
                const edit = edits.find(e => e.block_id === block.id);
                if (edit) {
                    if (edit.operation === 'update' && edit.new_content) {
                        return { ...block, content: edit.new_content };
                    } else if (edit.operation === 'delete') {
                        return null; // Will filter out
                    }
                }
                return block;
            }).filter(Boolean) as any[];

            if (updatedRangeData.parse_result) {
                updatedRangeData.parse_result = {
                    ...updatedRangeData.parse_result,
                    blocks: updatedBlocks
                };
            }

            setRangeData(updatedRangeData);
        };

        return (
            <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <div className="text-sm font-medium text-blue-900 mb-2">
                        📝 Excel-Style Editing
                    </div>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Double-click any text block to edit</li>
                        <li>For tables, double-click a cell to edit</li>
                        <li>Press <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300">Enter</kbd>, <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300">Esc</kbd>, or <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300">Tab</kbd> to save and exit</li>
                        <li>Press <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300">Ctrl+Enter</kbd> for new line</li>
                        <li>Click away to auto-save - just like Excel!</li>
                    </ul>
                </div>

                <RangePreviewRenderer
                    rangeData={rangeData}
                    mode="auto"
                    editMode={true}
                    zoom={1.0}
                    debug={true}
                    onSaveEdit={handleSaveEdit}
                    onBlockClick={(block) => console.log('Clicked block:', block)}
                />
            </div>
        );
    },
};

/**
 * Table Cell Editing
 */
export const TableCellEditing: Story = {
    render: () => {
        const [rangeData, setRangeData] = useState<VirtualRangeResponse>(
            simpleRangeData as VirtualRangeResponse
        );

        const handleSaveEdit = (edits: BlockEdit[]) => {
            console.log('Table cell edits:', edits);

            // Apply edits to rangeData
            const updatedRangeData = { ...rangeData };
            const currentBlocks = updatedRangeData.parse_result?.blocks || [];
            const updatedBlocks = currentBlocks.map(block => {
                const edit = edits.find(e => e.block_id === block.id);
                if (edit && edit.operation === 'update' && edit.new_content) {
                    return { ...block, content: edit.new_content };
                }
                return block;
            });

            if (updatedRangeData.parse_result) {
                updatedRangeData.parse_result = {
                    ...updatedRangeData.parse_result,
                    blocks: updatedBlocks
                };
            }

            setRangeData(updatedRangeData);
        };

        return (
            <div>
                <div className="mb-4 p-4 bg-green-50 rounded-md border border-green-200">
                    <div className="text-sm font-medium text-green-900 mb-2">
                        📊 Table Editing (Excel-Style)
                    </div>
                    <p className="text-sm text-green-800">
                        Double-click any table cell to edit. Press Enter/Esc/Tab to save or click away to auto-save. Ctrl+Enter for new lines.
                    </p>
                </div>

                <RangePreviewRenderer
                    rangeData={rangeData}
                    mode="auto"
                    editMode={true}
                    zoom={1.2}
                    debug={true}
                    onSaveEdit={handleSaveEdit}
                />
            </div>
        );
    },
};

/**
 * Read-only with Edited Badge
 */
export const EditedVersion: Story = {
    render: () => {
        return (
            <div>
                <div className="mb-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-900 mb-2">
                        ✏️ Edited Document
                    </div>
                    <p className="text-sm text-yellow-800">
                        This document has been edited. The "Edited" badge is shown in the metadata banner.
                    </p>
                </div>

                <RangePreviewRenderer
                    rangeData={editedRangeData as VirtualRangeResponse}
                    mode="auto"
                    editMode={false}
                    zoom={1.0}
                    debug={false}
                />
            </div>
        );
    },
};

/**
 * Original vs Edited Comparison (No Diff Visual)
 */
export const VersionComparison: Story = {
    render: () => {
        const [mode, setMode] = useState<'original' | 'edited' | 'auto'>('auto');

        return (
            <div>
                <div className="mb-4 p-4 bg-purple-50 rounded-md border border-purple-200 space-y-3">
                    <div className="text-sm font-medium text-purple-900">
                        🔍 Version Selector
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('original')}
                            className={`px-3 py-1.5 text-sm rounded ${mode === 'original'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-purple-600 border border-purple-300'
                                }`}
                        >
                            Original
                        </button>
                        <button
                            onClick={() => setMode('edited')}
                            className={`px-3 py-1.5 text-sm rounded ${mode === 'edited'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-purple-600 border border-purple-300'
                                }`}
                        >
                            Edited
                        </button>
                        <button
                            onClick={() => setMode('auto')}
                            className={`px-3 py-1.5 text-sm rounded ${mode === 'auto'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-purple-600 border border-purple-300'
                                }`}
                        >
                            Auto (Edited if available)
                        </button>
                    </div>
                </div>

                <RangePreviewRenderer
                    rangeData={editedRangeData as VirtualRangeResponse}
                    mode={mode}
                    editMode={false}
                    zoom={1.0}
                    debug={true}
                />
            </div>
        );
    },
};

/**
 * Real API Data - Interactive Editor with Edit Export
 */
export const RealDataEditor: Story = {
    args: {
        debug: false,
    },
    argTypes: {
        debug: {
            control: 'boolean',
            description: 'Show debug overlays (bounding boxes, page numbers, etc.)',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
    },
    render: (args) => {
        const [rangeData, setRangeData] = useState<VirtualRangeResponse>(
            realRangeData as unknown as VirtualRangeResponse
        );
        // Use edited_parse_result if available, otherwise parse_result
        const originalBlocksMap = useMemo(() => {
            const data = realRangeData as unknown as VirtualRangeResponse;
            const blocks = data.edited_parse_result?.blocks || data.parse_result?.blocks || [];
            return new Map(blocks.map(b => [b.id, { ...b }] as [string, ParseBlock]));
        }, []);

        const handleSaveEdit = (edits: BlockEdit[]) => {
            console.log('Saving edits:', edits);

            // Apply edits to rangeData (prefer edited_parse_result if exists)
            const updatedRangeData = { ...rangeData };
            const hasEditedVersion = !!updatedRangeData.edited_parse_result;
            const targetResult = hasEditedVersion ? updatedRangeData.edited_parse_result : updatedRangeData.parse_result;

            if (!targetResult) return;

            const currentBlocks = targetResult.blocks || [];
            const updatedBlocks = currentBlocks.map((block: ParseBlock) => {
                const edit = edits.find(e => e.block_id === block.id);
                if (edit) {
                    if (edit.operation === 'update' && edit.new_content) {
                        // For table blocks, update attrs.html if available
                        if (block.type === 'table' && block.attrs?.html) {
                            return {
                                ...block,
                                attrs: {
                                    ...block.attrs,
                                    html: edit.new_content
                                }
                            };
                        }
                        return { ...block, content: edit.new_content };
                    } else if (edit.operation === 'delete') {
                        return null;
                    }
                }
                return block;
            }).filter(Boolean) as ParseBlock[];

            if (hasEditedVersion && updatedRangeData.edited_parse_result) {
                updatedRangeData.edited_parse_result = {
                    ...updatedRangeData.edited_parse_result,
                    blocks: updatedBlocks
                };
            } else if (updatedRangeData.parse_result) {
                updatedRangeData.parse_result = {
                    ...updatedRangeData.parse_result,
                    blocks: updatedBlocks
                };
            }

            setRangeData(updatedRangeData);
        };

        const getEditedContent = () => {
            // Get blocks from edited_parse_result if available, otherwise parse_result
            const currentBlocks = rangeData.edited_parse_result?.blocks || rangeData.parse_result?.blocks || [];
            const editedBlocks: EditedBlockChange[] = [];

            currentBlocks.forEach((block: ParseBlock) => {
                const original = originalBlocksMap.get(block.id);

                if (!original) {
                    // New block (added)
                    editedBlocks.push({
                        id: block.id,
                        type: block.type,
                        content: block.content,
                        page: block.page,
                        ...(block.attrs && { attrs: block.attrs })
                    });
                } else {
                    // Check for changes
                    const changes: EditedBlockChange = { id: block.id };
                    let hasChanges = false;

                    // For table blocks, check attrs.html first
                    if (block.type === 'table') {
                        if (block.attrs?.html !== original.attrs?.html) {
                            changes.attrs = { html: block.attrs?.html || '' };
                            hasChanges = true;
                        }
                    } else if (block.content !== original.content) {
                        changes.content = block.content;
                        hasChanges = true;
                    }

                    if (block.type !== original.type) {
                        changes.type = block.type;
                        hasChanges = true;
                    }

                    if (block.page !== original.page) {
                        changes.page = block.page;
                        hasChanges = true;
                    }

                    // Check other attrs changes (excluding html for tables)
                    if (block.attrs && original.attrs) {
                        const attrsChanged = JSON.stringify(block.attrs) !== JSON.stringify(original.attrs);
                        if (attrsChanged && block.type !== 'table') {
                            changes.attrs = block.attrs;
                            hasChanges = true;
                        }
                    }

                    if (hasChanges) {
                        editedBlocks.push(changes);
                    }
                }
            });

            // Check for deleted blocks
            originalBlocksMap.forEach((_originalBlock, id) => {
                const exists = currentBlocks.some((b: ParseBlock) => b.id === id);
                if (!exists) {
                    editedBlocks.push({
                        id: id,
                        deleted: true
                    });
                }
            });

            return { blocks: editedBlocks };
        };

        const handleExportEdits = () => {
            const editedContent = getEditedContent();
            console.log('Edited content:', editedContent);
            alert(`Edited Content (check console for full output):\n\n${JSON.stringify(editedContent, null, 2).slice(0, 300)}...`);
        };

        return (
            <div>
                <div className="mb-4 p-4 bg-teal-50 rounded-md border border-teal-200">
                    <div className="text-sm font-medium text-teal-900 mb-2">
                        📚 Real API Data - Interactive Editor
                    </div>
                    <div className="flex gap-2 items-center">
                        <p className="text-sm text-teal-800 flex-1">
                            220 blocks, 20 pages. Double-click to edit any block.
                        </p>
                        <button
                            onClick={handleExportEdits}
                            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm font-medium"
                        >
                            📤 获取编辑内容
                        </button>
                    </div>
                </div>

                <RangePreviewRenderer
                    rangeData={rangeData}
                    mode="auto"
                    editMode={true}
                    zoom={0.8}
                    debug={args.debug}
                    onSaveEdit={handleSaveEdit}
                    onBlockClick={(block) => console.log('Clicked block:', block)}
                />
            </div>
        );
    },
};
