import { useState, useCallback } from 'react'
import type { ParseBlock } from '../types'

/**
 * 编辑区域位置计算结果
 */
export interface EditBoxPosition {
    left: number
    top: number
    width: number
    height: number
}

export interface EditBoxCoordinateConfig {
    pageWidth: number
    pageHeight: number
    pageGap: number
}

/**
 * 根据块的bbox计算编辑区域在屏幕上的绝对位置
 * @param bbox 0-1000坐标
 * @param containerWidth 容器宽度（像素）
 * @param canvasScale 当前缩放比例
 * @param scrollContainer 滚动容器
 * @param page 页码（0-based，getBlocks 已经处理过归一化）
 */
export function calculateEditBoxPosition(
    bbox: [number, number, number, number],
    containerWidth: number,
    canvasScale: number,
    _scrollContainer: HTMLElement | null,
    page: number = 0,
    coordConfig?: Partial<EditBoxCoordinateConfig>
): EditBoxPosition {
    const [x1, y1, x2, y2] = bbox

    const PAGE_WIDTH = coordConfig?.pageWidth ?? 1000
    const PAGE_HEIGHT = coordConfig?.pageHeight ?? 1000
    const PAGE_GAP = coordConfig?.pageGap ?? 20

    const scaleFactor = (containerWidth / PAGE_WIDTH) * canvasScale;

    // Page offset calculation (same as CoordinateSystem.pageOffsetY)
    // pageStridePx = pageHeightPx + pageGap
    const pageHeightPx = PAGE_HEIGHT * scaleFactor;
    const pageOffset = page * (pageHeightPx + PAGE_GAP);

    const scaledLeft = x1 * scaleFactor
    const scaledTop = y1 * scaleFactor + pageOffset
    const scaledWidth = (x2 - x1) * scaleFactor
    const scaledHeight = (y2 - y1) * scaleFactor

    return {
        left: scaledLeft,
        top: scaledTop,
        width: scaledWidth,
        height: scaledHeight,
    }
}

/**
 * 表格单元格信息
 */
export interface TableCellInfo {
    row: number
    col: number
    text: string
}

/**
 * 编辑状态管理Hook
 */
export function useEditMode() {
    // 当前正在编辑的块ID
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null)

    // 当前正在编辑的表格单元格
    const [editingCell, setEditingCell] = useState<TableCellInfo | null>(null)

    // 编辑框的输入值
    const [editValue, setEditValue] = useState<string>('')

    /**
     * 进入块编辑模式
     */
    const startEditBlock = useCallback((block: ParseBlock) => {
        setEditingBlockId(block.id)
        setEditingCell(null)

        // Load content for all block types
        const initialText = block.content || ''

        setEditValue(initialText)
    }, [])

    /**
     * 进入表格单元格编辑模式
     */
    const startEditTableCell = useCallback(
        (block: ParseBlock, cellInfo: TableCellInfo) => {
            setEditingBlockId(block.id)
            setEditingCell(cellInfo)
            setEditValue(cellInfo.text)
        },
        []
    )

    /**
     * 完成编辑（失焦时自动调用）
     * 返回编辑结果，由外部处理保存逻辑
     */
    const finishEdit = useCallback(() => {
        if (!editingBlockId) return null;

        const result = {
            blockId: editingBlockId,
            cellInfo: editingCell,
            newValue: editValue,
        }

        // 清空编辑状态
        setEditingBlockId(null)
        setEditingCell(null)
        setEditValue('')

        return result
    }, [editingBlockId, editingCell, editValue])

    /**
     * 检查某个块是否正在编辑
     */
    const isEditingBlock = useCallback(
        (blockId: string): boolean => {
            return editingBlockId === blockId
        },
        [editingBlockId]
    )

    return {
        // 状态
        editingBlockId,
        editingCell,
        editValue,

        // 操作
        startEditBlock,
        startEditTableCell,
        finishEdit,
        setEditValue,

        // 查询
        isEditingBlock,
    }
}
