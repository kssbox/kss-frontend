/**
 * Diff 调试面板组件
 * 用于显示两个版本之间的差异详情，包括字符级 diff
 */

import React, { useState } from 'react'
import type { DiffResult } from '../core/DiffComputer';
import type { ParseBlock, ContentDiffSegment } from '../types';

export interface DebugPanelProps {
    diffData: DiffResult | null
    visible?: boolean
}

interface BlockWithDiff extends ParseBlock {
    contentDiff?: ContentDiffSegment[]
}

const DiffSegmentDisplay: React.FC<{ segments: ContentDiffSegment[] }> = ({ segments }) => {
    return (
        <div style={{
            marginTop: 4,
            padding: 4,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 4,
            fontSize: 10,
            lineHeight: 1.4
        }}>
            {segments.map((seg, idx) => (
                <span
                    key={idx}
                    style={{
                        background:
                            seg.type === 'added'
                                ? 'rgba(34, 197, 94, 0.3)'
                                : seg.type === 'deleted'
                                    ? 'rgba(239, 68, 68, 0.3)'
                                    : 'transparent',
                        color:
                            seg.type === 'added'
                                ? '#86efac'
                                : seg.type === 'deleted'
                                    ? '#fca5a5'
                                    : '#d1d5db',
                        textDecoration: seg.type === 'deleted' ? 'line-through' : 'none',
                        padding: '1px 2px',
                        borderRadius: 2,
                    }}
                >
                    {seg.text}
                </span>
            ))}
        </div>
    )
}

const BlockDetailView: React.FC<{
    block: BlockWithDiff;
    label: string;
    color: string;
    forceExpanded?: boolean;
}> = ({ block, label, color, forceExpanded }) => {
    const [expanded, setExpanded] = useState(false)
    const isExpanded = forceExpanded !== undefined ? forceExpanded : expanded

    const hasContentDiff = block.contentDiff && block.contentDiff.length > 0
    const truncateContent = (text: string, maxLen: number = 50) => {
        return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
    }

    return (
        <div
            style={{
                paddingLeft: 16,
                marginBottom: 8,
                color: color,
                fontSize: 11,
                borderLeft: `2px solid ${color}`,
                paddingTop: 4,
                paddingBottom: 4,
            }}
        >
            <div
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => setExpanded(!expanded)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setExpanded(!expanded)
                    }
                }}
            >
                <span style={{ fontSize: 9 }}>{isExpanded ? '▼' : '▶'}</span>
                <span style={{ fontWeight: 'bold' }}>{label}</span>
                <span style={{ opacity: 0.7 }}>({block.type})</span>
            </div>

            {isExpanded && (
                <div style={{ marginTop: 4, paddingLeft: 12, fontSize: 10, opacity: 0.9 }}>
                    <div><strong>ID:</strong> {block.id}</div>
                    {block.page !== undefined && <div><strong>Page:</strong> {block.page}</div>}
                    {block.bbox && (
                        <div>
                            <strong>BBox:</strong> [{block.bbox.map(v => Math.round(v)).join(', ')}]
                        </div>
                    )}
                    {block.confidence && (
                        <div><strong>Confidence:</strong> {(block.confidence * 100).toFixed(1)}%</div>
                    )}

                    <div style={{ marginTop: 6 }}>
                        <strong>Content:</strong>
                        <div style={{
                            padding: 4,
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: 4,
                            marginTop: 2,
                            maxHeight: 120,
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {truncateContent(block.content, 200)}
                        </div>
                    </div>

                    {hasContentDiff && (
                        <div style={{ marginTop: 6 }}>
                            <strong>Character Diff ({block.contentDiff!.length} segments):</strong>
                            <DiffSegmentDisplay segments={block.contentDiff!} />

                            {/* Segment Statistics */}
                            <div style={{ marginTop: 4, fontSize: 9, opacity: 0.7 }}>
                                {block.contentDiff!.map((seg, idx) => (
                                    <div key={idx}>
                                        <span style={{
                                            color: seg.type === 'added' ? '#86efac'
                                                : seg.type === 'deleted' ? '#fca5a5'
                                                    : '#9ca3af'
                                        }}>
                                            [{seg.type}]
                                        </span> {seg.text.length} chars: "{truncateContent(seg.text, 30)}"
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
    diffData,
    visible = true,
}) => {
    const [expandAll, setExpandAll] = useState(false)

    if (!visible || !diffData) {
        return null
    }

    const { added, deleted, updated, moved, unchanged } = diffData

    // Count total segments in all updated blocks
    const totalSegments = updated.reduce((sum: number, block: BlockWithDiff) => {
        return sum + (block.contentDiff?.length || 0)
    }, 0)

    const totalAddedChars = updated.reduce((sum: number, block: BlockWithDiff) => {
        return sum + (block.contentDiff?.filter(s => s.type === 'added').reduce((s, seg) => s + seg.text.length, 0) || 0)
    }, 0)

    const totalDeletedChars = updated.reduce((sum: number, block: BlockWithDiff) => {
        return sum + (block.contentDiff?.filter(s => s.type === 'deleted').reduce((s, seg) => s + seg.text.length, 0) || 0)
    }, 0)

    return (
        <div
            style={{
                position: 'fixed',
                top: 10,
                right: 10,
                width: 400,
                maxHeight: '80vh',
                overflow: 'auto',
                background: 'rgba(0, 0, 0, 0.95)',
                color: '#fff',
                padding: 16,
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'monospace',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3
                    style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#4CAF50',
                    }}
                >
                    Diff Debug Panel
                </h3>
                <button
                    onClick={() => setExpandAll(!expandAll)}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        cursor: 'pointer'
                    }}
                >
                    {expandAll ? 'Collapse All' : 'Expand All'}
                </button>
            </div>

            {/* Character-level statistics for updated blocks */}
            {updated.length > 0 && (
                <div style={{
                    marginBottom: 12,
                    padding: 8,
                    background: 'rgba(255, 193, 7, 0.15)',
                    borderRadius: 4,
                    fontSize: 10
                }}>
                    <div style={{ color: '#fbbf24', marginBottom: 4, fontWeight: 'bold' }}>
                        Character-level Changes:
                    </div>
                    <div style={{ color: '#fde68a' }}>
                        • Total segments: {totalSegments}
                    </div>
                    <div style={{ color: '#86efac' }}>
                        • Added chars: {totalAddedChars}
                    </div>
                    <div style={{ color: '#fca5a5' }}>
                        • Deleted chars: {totalDeletedChars}
                    </div>
                </div>
            )}

            {/* Added Blocks */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#4CAF50', marginBottom: 4, fontSize: 12, fontWeight: 'bold' }}>
                    ✅ Added Blocks: {added.length}
                </div>
                {added.map((block: ParseBlock) => (
                    <BlockDetailView
                        key={block.id}
                        block={block}
                        label={`#${block.id.slice(-4)}`}
                        color="#81C784"
                        forceExpanded={expandAll}
                    />
                ))}
            </div>

            {/* Deleted Blocks */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#F44336', marginBottom: 4, fontSize: 12, fontWeight: 'bold' }}>
                    ❌ Deleted Blocks: {deleted.length}
                </div>
                {deleted.map((block: ParseBlock) => (
                    <BlockDetailView
                        key={block.id}
                        block={block}
                        label={`#${block.id.slice(-4)}`}
                        forceExpanded={expandAll}
                        color="#E57373"
                    />
                ))}
            </div>

            {/* Updated Blocks */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#FF9800', marginBottom: 4, fontSize: 12, fontWeight: 'bold' }}>
                    📝 Updated Blocks: {updated.length}
                </div>
                {updated.map((block: BlockWithDiff) => (
                    <BlockDetailView
                        key={block.id}
                        block={block}
                        label={`#${block.id.slice(-4)}`}
                        forceExpanded={expandAll}
                        color="#FFB74D"
                    />
                ))}
            </div>

            {/* Moved Blocks */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#9C27B0', marginBottom: 4, fontSize: 12, fontWeight: 'bold' }}>
                    🔄 Moved Blocks: {moved.length}
                </div>
                {moved.map((block: ParseBlock) => (
                    <BlockDetailView
                        key={block.id}
                        block={block}
                        label={`#${block.id.slice(-4)}`}
                        forceExpanded={expandAll}
                        color="#BA68C8"
                    />
                ))}
            </div>

            {/* Unchanged Summary */}
            <div>
                <div style={{ color: '#9E9E9E', marginBottom: 4 }}>
                    ⚪ Unchanged: {unchanged.length}
                </div>
            </div>

            {/* Summary */}
            <div
                style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid #444',
                    color: '#9E9E9E',
                    fontSize: 10,
                }}
            >
                <div>Total Blocks: {added.length + deleted.length + updated.length + moved.length + unchanged.length}</div>
                <div style={{ marginTop: 4 }}>
                    Changes: {added.length + deleted.length + updated.length + moved.length}
                    ({((added.length + deleted.length + updated.length + moved.length) /
                        (added.length + deleted.length + updated.length + moved.length + unchanged.length) * 100).toFixed(1)}%)
                </div>
            </div>
        </div>
    )
}
