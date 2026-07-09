'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type Row,
  flexRender,
  Table as TTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  useDataTable,
  type UseDataTableProps,
  type IList,
} from './use-data-table'
import { DataTableToolbarSimple } from './data-table-toolbar-simple'
import { DataTableToolbar } from './data-table-toolbar'
import { DataTablePagination } from './data-table-pagination'
import { cn } from '../../lib/utils'
import { getMessage } from '../../lib/i18n'
import { createSelectColumn } from './data-table-selection'
import { isFunction } from 'lodash-es'
import { DataTableSelectionBar } from './data-table-selection-bar'
import { Loading } from '../ui/loading'
import type { DataTableColumnMeta } from './types'

export interface DataTableHooksProps<TData, TValue>
  extends Omit<UseDataTableProps<TData, TValue>, 'columns'> {
  /** 列定义 */
  columns: ColumnDef<TData, TValue>[]
  /** 搜索占位符 */
  searchPlaceholder?: string
  /** 工具栏自定义内容 */
  toolbarContent?: React.ReactNode
  /** 表格容器类名 */
  containerClassName?: string
  /** 表格类名 */
  tableClassName?: string
  /** 空状态渲染 */
  emptyState?: React.ReactNode
  /** 加载状态（不传则使用 hook 的 loading 状态） */
  isLoading?: boolean
  /** 加载状态渲染 */
  loadingState?: React.ReactNode
  /** 加载指示器（覆盖浮层） */
  loadingIndicator?: React.ReactNode
  /** 错误状态渲染 */
  errorState?: React.ReactNode
  /** 已选的操作栏 */
  selectionToolbar?: (
    selectedRows: TData[],
    table: TTable<TData>,
    helpers: {
      refresh: () => Promise<IList<TData> | undefined>
      resetSelection: () => void
    }
  ) => React.ReactNode
  /** 自定义展开行内容 */
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode
  /** 点击整行时切换展开 */
  expandOnRowClick?: boolean
  /** refresh 函数就绪回调，用于外部获取 refresh 函数 */
  onRefreshReady?: (refresh: () => Promise<IList<TData> | undefined>) => void
  /** 显示列显隐选项 */
  viewOptions?: boolean
  /** 显示filter显隐选项 */
  filterOptions?: boolean

  /** 默认展示的筛选项（列 id） */
  defaultVisibleFilterIds?: string[]

  /** 点击行时的回调 */
  onRowClick?: (row: Row<TData>, event: React.MouseEvent<HTMLTableRowElement>) => void
}

/**
 * 基于 hooks 的数据表组件
 *
 * 封装了 useDataTable hook，提供开箱即用的表格功能
 *
 * @example
 * ```tsx
 * <DataTableHooks
 *   data={users}
 *   columns={userColumns}
 *   enableRowSelection
 *   enableFiltering
 *   enableSorting
 *   enablePagination
 *   pageSize={10}
 *   searchPlaceholder="Search users..."
 *   onRowSelectionChange={(rows) => console.log(rows)}
 * />
 * ```
 */
export function DataTableHooks<TData, TValue>({
  columns,
  searchPlaceholder = getMessage('dataTable.search'),
  toolbarContent,
  containerClassName,
  tableClassName,
  emptyState,
  isLoading,
  selectionToolbar,
  loadingState,
  loadingIndicator,
  errorState,
  enablePagination = true,
  renderExpandedRow,
  expandOnRowClick,
  onRefreshReady,
  viewOptions = false,
  filterOptions = false,
  defaultVisibleFilterIds,
  onRowClick,
  ...hookProps
}: DataTableHooksProps<TData, TValue>) {
  const getColumnWidthStyle = React.useCallback(
    (meta?: DataTableColumnMeta) => {
      const width = meta?.width
      const minWidth = meta?.minWidth
      if (!width && !minWidth) return undefined

      const cssWidth =
        typeof width === 'number' ? `${width}px` : (width as string | undefined)
      const cssMinWidth =
        typeof minWidth === 'number'
          ? `${minWidth}px`
          : (minWidth as string | undefined)

      return {
        ...(cssWidth ? { width: cssWidth, maxWidth: cssWidth } : null),
        ...(cssMinWidth ? { minWidth: cssMinWidth } : null),
      } as React.CSSProperties
    },
    []
  )
  const enableRowSelection = Boolean(hookProps.enableRowSelection)
  const hasExpandedContent = typeof renderExpandedRow === 'function'
  const defaultGetRowCanExpand = React.useCallback(() => true, [])
  const resolvedEnableExpanding =
    hookProps.enableExpanding ?? hasExpandedContent
  const resolvedGetRowCanExpand =
    hookProps.getRowCanExpand ??
    (hasExpandedContent ? defaultGetRowCanExpand : undefined)
  const resolvedExpandOnRowClick = expandOnRowClick ?? hasExpandedContent
  const expandMode = hookProps.expandMode ?? 'single'

  const tableColumns = React.useMemo(
    () =>
      enableRowSelection ? [createSelectColumn<TData>(), ...columns] : columns,
    [enableRowSelection, columns]
  )

  const {
    table,
    globalFilter,
    resetTable,
    selectedRows,
    loading: hookLoading,
    error: hookError,
    refresh,
    resetSelection,
    setExpanded,
    scrollConfig,
  } = useDataTable({
    ...hookProps,
    columns: tableColumns,
    enablePagination,
    enableExpanding: resolvedEnableExpanding,
    getRowCanExpand: resolvedGetRowCanExpand,
  })

  const computedLoading = isLoading ?? hookLoading
  const computedError = hookError ?? undefined
  const rowModel = table.getRowModel()
  const rows = rowModel.rows ?? []
  const previousRowsRef = React.useRef<Row<TData>[]>([])

  // Keep the last successfully loaded rows so we can show them while the next request is loading.
  // IMPORTANT: if the latest request completes with 0 rows, we must clear the cache;
  // otherwise pages that legitimately have empty results will keep flashing stale rows
  // during subsequent loading states.
  if (!computedLoading) {
    previousRowsRef.current = rows
  } else if (rows.length > 0) {
    previousRowsRef.current = rows
  }

  const hasStableRows = previousRowsRef.current.length > 0
  const hasRows = rows.length > 0
  const displayedRows = hasRows
    ? rows
    : computedLoading && hasStableRows
      ? previousRowsRef.current
      : []

  const shouldShowInitialLoading = computedLoading && !hasStableRows
  const shouldShowOverlayLoading =
    computedLoading && hasStableRows && displayedRows.length > 0
  const columnCount =
    table.getVisibleLeafColumns().length || tableColumns.length
  const shouldShowToolbar = Boolean(hookProps.enableFiltering || toolbarContent)
  const shouldShowPagination = Boolean(enablePagination)
  const shouldShowSelectionBar =
    enableRowSelection &&
    selectedRows.length > 0 &&
    isFunction(selectionToolbar)

  // 通过 onRefreshReady 回调暴露 refresh 函数，确保外部始终可以获取
  React.useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(refresh)
    }
  }, [onRefreshReady, refresh])

  const toggleRowExpansion = React.useCallback(
    (row: Row<TData>) => {
      setExpanded(prevState => {
        const base =
          prevState === true
            ? table
                .getRowModel()
                .rows.reduce<Record<string, boolean>>((acc, current) => {
                  acc[current.id] = true
                  return acc
                }, {})
            : ((prevState ?? {}) as Record<string, boolean>)
        const map = { ...base }

        const isExpanded = row.getIsExpanded()

        if (isExpanded) {
          delete map[row.id]
          return map
        }

        if (expandMode === 'single') {
          return { [row.id]: true }
        }

        map[row.id] = true
        return map
      })
    },
    [setExpanded, table, expandMode]
  )

  // 默认加载状态
  const defaultLoadingIndicator = <Loading size="md" />

  const defaultLoadingState = (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-40 text-center">
        {defaultLoadingIndicator}
      </TableCell>
    </TableRow>
  )

  // 默认空状态
  const defaultEmptyState = (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-24 text-center">
        {getMessage('dataTable.empty')}
      </TableCell>
    </TableRow>
  )

  const defaultErrorState = (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-24 text-center">
        {computedError?.message ?? getMessage('dataTable.error')}
      </TableCell>
    </TableRow>
  )

  const { maxHeight, stickyHeader = true } = scrollConfig || {}
  const allowHorizontalScroll = Boolean(scrollConfig?.allowHorizontalScroll)

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const tableScrollAreaRef = React.useRef<HTMLDivElement | null>(null)
  const paginationRef = React.useRef<HTMLDivElement | null>(null)
  const [autoMaxHeight, setAutoMaxHeight] = React.useState<number | null>(null)

  const resolvedViewportBottomOffset = scrollConfig?.viewportBottomOffset ?? 24
  const resolvedMinAutoMaxHeight = scrollConfig?.minAutoMaxHeight ?? 240

  const computeAutoMaxHeight = React.useCallback(() => {
    const scrollAreaEl = tableScrollAreaRef.current
    if (!scrollAreaEl) return

    const rect = scrollAreaEl.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const paginationHeight =
      paginationRef.current?.getBoundingClientRect().height ?? 0
    // `space-y-4` between blocks
    const gapBetweenTableAndPagination = 16

    const available =
      viewportHeight -
      rect.top -
      paginationHeight -
      gapBetweenTableAndPagination -
      resolvedViewportBottomOffset
    const next = Math.max(resolvedMinAutoMaxHeight, Math.floor(available))
    setAutoMaxHeight(next)
  }, [resolvedMinAutoMaxHeight, resolvedViewportBottomOffset])

  React.useEffect(() => {
    if (maxHeight !== 'auto') {
      setAutoMaxHeight(null)
      return
    }

    computeAutoMaxHeight()
    window.addEventListener('resize', computeAutoMaxHeight)
    // Some layouts change size without resize (e.g. sidebar collapse), try a delayed re-measure.
    const t = window.setTimeout(computeAutoMaxHeight, 0)
    return () => {
      window.removeEventListener('resize', computeAutoMaxHeight)
      window.clearTimeout(t)
    }
  }, [maxHeight, computeAutoMaxHeight])

  const resolvedMaxHeight =
    maxHeight === 'auto' ? (autoMaxHeight ?? undefined) : maxHeight

  const tableWrapperStyle: React.CSSProperties = resolvedMaxHeight
    ? {
        maxHeight:
          typeof resolvedMaxHeight === 'number'
            ? `${resolvedMaxHeight}px`
            : resolvedMaxHeight,
        overflowY: 'auto',
        // Default: only allow vertical scrolling; avoid horizontal scrollbar.
        // Allow pages to explicitly opt-in to horizontal scroll.
        overflowX: allowHorizontalScroll ? 'auto' : 'hidden',
      }
    : {}

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full space-y-4 pb-24', containerClassName)}
      data-selection-anchor
    >
      {/* 批量操作工具栏 */}
      {shouldShowSelectionBar && (
        <DataTableSelectionBar
          selectedRows={selectedRows}
          table={table}
          selectionToolbar={selectionToolbar}
          refresh={refresh}
          resetSelection={resetSelection}
        />
      )}

      {/* 工具栏 */}
      {shouldShowToolbar &&
        (hookProps.enableFiltering ? (
          <DataTableToolbar
            table={table}
            viewOptions={viewOptions}
            filterOptions={filterOptions}
            defaultVisibleFilterIds={defaultVisibleFilterIds}
          >
            {toolbarContent}
          </DataTableToolbar>
        ) : (
          <DataTableToolbarSimple
            table={table}
            globalFilter={globalFilter}
            onGlobalFilterChange={undefined}
            searchPlaceholder={searchPlaceholder}
            onReset={resetTable}
            viewOptions={viewOptions}
            filterOptions={filterOptions}
          >
            {toolbarContent}
          </DataTableToolbarSimple>
        ))}

      {/* 表格 */}
      <div
        className={cn(
          'relative rounded-md border overflow-hidden',
          tableClassName
        )}
      >
        <div ref={tableScrollAreaRef} style={tableWrapperStyle}>
          <Table
            disableScrollWrapper={Boolean(maxHeight)}
            className={cn(
              'table-fixed',
              allowHorizontalScroll ? 'w-max min-w-full' : 'w-full'
            )}
          >
            <TableHeader
              className={cn(
                resolvedMaxHeight && stickyHeader && 'sticky top-0 z-10'
              )}
            >
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header =>
                    (() => {
                      const meta = header.column.columnDef.meta as
                        | DataTableColumnMeta
                        | undefined
                      return (
                        <TableHead
                          key={header.id}
                          style={getColumnWidthStyle(meta)}
                          className={cn(
                            resolvedMaxHeight &&
                              stickyHeader &&
                              'bg-background',
                            meta?.headerClassName
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })()
                  )}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {computedError
                ? errorState || defaultErrorState
                : shouldShowInitialLoading
                  ? loadingState || defaultLoadingState
                  : displayedRows.length
                    ? displayedRows.map(row => {
                        const canExpand =
                          resolvedEnableExpanding && row.getCanExpand()
                        const isExpanded = canExpand && row.getIsExpanded()
                        const showExpandedContent =
                          Boolean(renderExpandedRow) && Boolean(isExpanded)

                        const handleRowClick =
                          resolvedExpandOnRowClick && canExpand
                            ? (
                                event: React.MouseEvent<HTMLTableRowElement>
                              ) => {
                                const target = event.target as HTMLElement
                                if (
                                  target.closest(
                                    'button, a, input, textarea, select, label, [role="button"], [role="link"], [data-disable-row-click]'
                                  )
                                ) {
                                  return
                                }
                                toggleRowExpansion(row)
                              }
                            : onRowClick
                              ? (
                                  event: React.MouseEvent<HTMLTableRowElement>
                                ) => {
                                  const target = event.target as HTMLElement
                                  if (
                                    target.closest(
                                      'button, a, input, textarea, select, label, [role="button"], [role="link"], [data-disable-row-click]'
                                    )
                                  ) {
                                    return
                                  }
                                  onRowClick(row, event)
                                }
                              : undefined

                        return (
                          <React.Fragment key={row.id}>
                            <TableRow
                              data-state={row.getIsSelected() && 'selected'}
                              data-expanded={
                                isExpanded ? 'expanded' : undefined
                              }
                              aria-expanded={
                                canExpand ? Boolean(isExpanded) : undefined
                              }
                              onClick={handleRowClick}
                              className={cn(
                                (resolvedExpandOnRowClick && canExpand || onRowClick) &&
                                  'cursor-pointer select-none'
                              )}
                            >
                              {row.getVisibleCells().map(cell =>
                                (() => {
                                  const meta = cell.column.columnDef.meta as
                                    | DataTableColumnMeta
                                    | undefined
                                  return (
                                    <TableCell
                                      key={cell.id}
                                      style={getColumnWidthStyle(meta)}
                                      className={cn(meta?.cellClassName)}
                                    >
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </TableCell>
                                  )
                                })()
                              )}
                            </TableRow>
                            {showExpandedContent && (
                              <TableRow data-expanded="content">
                                <TableCell
                                  colSpan={columnCount}
                                  className="max-w-0 p-0"
                                >
                                  <div className="w-full max-w-full overflow-hidden p-2">
                                    {renderExpandedRow?.(row)}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        )
                      })
                    : emptyState || defaultEmptyState}
            </TableBody>
          </Table>
          {shouldShowOverlayLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/10 backdrop-blur-[2px]">
              {loadingIndicator || defaultLoadingIndicator}
            </div>
          )}
        </div>
      </div>

      {/* 分页 */}
      {shouldShowPagination && (
        <div ref={paginationRef}>
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  )
}
