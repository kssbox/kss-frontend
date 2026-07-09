'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

export interface UseDataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  enableFiltering?: boolean
  enableSorting?: boolean
  enablePagination?: boolean
  pageSize?: number
  initialSorting?: SortingState
  onRowSelectionChange?: (selectedRows: TData[]) => void
}

/**
 * 自定义 useDataTable hook
 * 封装 @tanstack/react-table 的常用功能
 *
 * @example
 * ```tsx
 * const table = useDataTable({
 *   data: users,
 *   columns: userColumns,
 *   enableRowSelection: true,
 *   enablePagination: true,
 *   pageSize: 10,
 * })
 * ```
 */
export function useDataTable<TData, TValue>({
  data,
  columns,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  enableFiltering = false,
  enableSorting = false,
  enablePagination = false,
  pageSize = 10,
  initialSorting = [],
  onRowSelectionChange,
}: UseDataTableProps<TData, TValue>) {
  // 表格状态
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const [globalFilter, setGlobalFilter] = React.useState('')

  // 创建表格实例
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      columnFilters,
      sorting,
      pagination,
      globalFilter,
    },
    enableRowSelection,
    enableMultiRowSelection,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getFacetedRowModel: enableFiltering ? getFacetedRowModel() : undefined,
    getFacetedUniqueValues: enableFiltering ? getFacetedUniqueValues() : undefined,
  })

  // 获取选中的行
  const selectedRows = React.useMemo(
    () => table.getFilteredSelectedRowModel().rows.map(row => row.original),
    [table, rowSelection]
  )

  // 通知父组件行选择变化
  React.useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(selectedRows)
    }
  }, [selectedRows, onRowSelectionChange])

  // 重置所有状态
  const resetTable = React.useCallback(() => {
    setRowSelection({})
    setColumnFilters([])
    setSorting([])
    setGlobalFilter('')
    setPagination({ pageIndex: 0, pageSize })
  }, [pageSize])

  // 重置选择
  const resetSelection = React.useCallback(() => {
    setRowSelection({})
  }, [])

  // 重置过滤
  const resetFilters = React.useCallback(() => {
    setColumnFilters([])
    setGlobalFilter('')
  }, [])

  // 重置排序
  const resetSorting = React.useCallback(() => {
    setSorting([])
  }, [])

  // 重置分页
  const resetPagination = React.useCallback(() => {
    setPagination({ pageIndex: 0, pageSize })
  }, [pageSize])

  return {
    table,
    // 状态
    rowSelection,
    columnVisibility,
    columnFilters,
    sorting,
    pagination,
    globalFilter,
    // 状态设置器
    setRowSelection,
    setColumnVisibility,
    setColumnFilters,
    setSorting,
    setPagination,
    setGlobalFilter,
    // 选中的行
    selectedRows,
    selectedRowCount: selectedRows.length,
    // 辅助方法
    resetTable,
    resetSelection,
    resetFilters,
    resetSorting,
    resetPagination,
    // 统计信息
    totalRows: data.length,
    filteredRows: table.getFilteredRowModel().rows.length,
    pageCount: table.getPageCount(),
    canPreviousPage: table.getCanPreviousPage(),
    canNextPage: table.getCanNextPage(),
  }
}
