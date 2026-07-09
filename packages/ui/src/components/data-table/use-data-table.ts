'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  type TableOptions,
  type Row,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useRequest } from 'ahooks'
import type { DataTableScrollConfig } from './types'

export type IParams = Record<string, unknown> & {
  pageIndex?: number
  pageSize?: number
}

const inflightRequestByKey = new Map<string, Promise<unknown>>()
const dataServiceIdByFn = new WeakMap<Function, number>()
let dataServiceIdSeq = 1

const getDataServiceId = (fn: Function) => {
  const existing = dataServiceIdByFn.get(fn)
  if (existing) return existing
  const next = dataServiceIdSeq++
  dataServiceIdByFn.set(fn, next)
  return next
}

const buildInflightKey = (dataService: Function, params: IParams) => {
  const serviceId = getDataServiceId(dataService)
  return `${serviceId}:${JSON.stringify(params)}`
}

export interface IList<T> {
  total: number
  list: T[]
}

export type IListService<R> = (args: IParams) => Promise<IList<R>>

type ForwardedTableOptions<TData> = Partial<
  Omit<
    TableOptions<TData>,
    | 'data'
    | 'columns'
    | 'state'
    | 'onRowSelectionChange'
    | 'onColumnVisibilityChange'
    | 'onColumnFiltersChange'
    | 'onSortingChange'
    | 'onPaginationChange'
    | 'onGlobalFilterChange'
    | 'onExpandedChange'
  >
>

export interface UseDataTableProps<TData, TValue>
  extends ForwardedTableOptions<TData> {
  /** 表格数据 */
  data?: TData[]
  /** 列定义 */
  columns: ColumnDef<TData, TValue>[]
  /** 数据服务 */
  dataService?: IListService<TData>
  /** 启用行选择 */
  enableRowSelection?: boolean
  /** 启用多行选择 */
  enableMultiRowSelection?: boolean
  /** 启用过滤 */
  enableFiltering?: boolean
  /** 启用排序 */
  enableSorting?: boolean
  /** 启用分页 */
  enablePagination?: boolean
  /** 启用展开 */
  enableExpanding?: boolean
  /** 行是否可以展开 */
  getRowCanExpand?: (row: Row<TData>) => boolean
  /** 每页显示数量 */
  pageSize?: number
  /** 初始分页状态（用于从 URL / storage 恢复页码） */
  initialPagination?: PaginationState
  /** 分页变化回调（用于将页码同步到 URL / storage） */
  onPaginationChange?: (pagination: PaginationState) => void
  /** 排序变化回调（用于将排序同步到 URL / storage） */
  onSortingChange?: (sorting: SortingState) => void
  /** 列过滤变化回调（用于将筛选同步到 URL / storage） */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  /** 全局搜索变化回调（用于将搜索同步到 URL / storage） */
  onGlobalFilterChange?: (value: string) => void
  /** 服务端总数 */
  rowCount?: number
  /** 初始排序状态 */
  initialSorting?: SortingState
  /** 初始列过滤状态 */
  initialColumnFilters?: ColumnFiltersState
  /** 初始全局过滤 */
  initialGlobalFilter?: string
  /** 初始展开状态 */
  initialExpanded?: ExpandedState
  /** 展开模式：单个或多个同时展开 */
  expandMode?: 'single' | 'multiple'
  /** 行选择变化回调 */
  // TODO rm it
  onRowSelectionChange?: (selectedRows: TData[]) => void
  /** 滚动配置 */
  scrollConfig?: DataTableScrollConfig
}

export interface UseDataTableReturn<TData> {
  /** 表格实例 */
  table: ReturnType<typeof useReactTable<TData>>
  /** 行选择状态 */
  rowSelection: RowSelectionState
  /** 列可见性状态 */
  columnVisibility: VisibilityState
  /** 列过滤状态 */
  columnFilters: ColumnFiltersState
  /** 排序状态 */
  sorting: SortingState
  /** 分页状态 */
  pagination: PaginationState
  /** 全局过滤 */
  globalFilter: string
  /** 展开状态 */
  expanded: ExpandedState
  /** 设置行选择 */
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
  /** 设置列可见性 */
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>
  /** 设置列过滤 */
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  /** 设置排序 */
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  /** 设置分页 */
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  /** 设置全局过滤 */
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>
  /** 设置展开 */
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>
  /** 选中的行 */
  selectedRows: TData[]
  /** 选中的行数量 */
  selectedRowCount: number
  /** 重置所有状态 */
  resetTable: () => void
  /** 重置选择 */
  resetSelection: () => void
  /** 重置过滤 */
  resetFilters: () => void
  /** 重置排序 */
  resetSorting: () => void
  /** 重置分页 */
  resetPagination: () => void
  /** 重置展开 */
  resetExpanded: () => void
  /** 当前数据 */
  data: TData[]
  /** 数据请求加载状态 */
  loading: boolean
  /** 数据请求错误 */
  error: Error | undefined
  /** 重新请求数据 */
  refresh: () => Promise<IList<TData> | undefined>
  /** 主动触发数据请求 */
  run: (params?: IParams) => Promise<IList<TData>>
  /** 总行数 */
  totalRows: number
  /** 过滤后的行数 */
  filteredRows: number
  /** 总页数 */
  pageCount: number
  /** 是否可以上一页 */
  canPreviousPage: boolean
  /** 是否可以下一页 */
  canNextPage: boolean
  /** 滚动配置 */
  scrollConfig?: DataTableScrollConfig
}

/**
 * 自定义 useDataTable hook
 *
 * 封装 @tanstack/react-table 的常用功能，提供简化的 API
 *
 * @example
 * ```tsx
 * const { table, selectedRows, resetFilters } = useDataTable({
 *   data: users,
 *   columns: userColumns,
 *   enableRowSelection: true,
 *   enableFiltering: true,
 *   enableSorting: true,
 *   enablePagination: true,
 *   pageSize: 10,
 *   onRowSelectionChange: (rows) => console.log('Selected:', rows),
 * })
 * ```
 */
export function useDataTable<TData, TValue>({
  data = [],
  dataService,
  columns,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  enableFiltering = false,
  enableSorting = false,
  enablePagination = false,
  enableExpanding = false,
  getRowCanExpand,
  pageSize = 10,
  initialPagination,
  initialSorting = [],
  initialColumnFilters = [],
  initialGlobalFilter = '',
  expandMode = 'single',
  initialExpanded = {},
  rowCount: rowCountProp = 0,
  scrollConfig = {
    maxHeight: 'auto',
    stickyHeader: true,
    allowHorizontalScroll: true,
  },
  // TODO rm it, 代码中已经实现了这个函数
  onRowSelectionChange: _deprecatedOnRowSelectionChange,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  ...tableOptions
}: UseDataTableProps<TData, TValue>): UseDataTableReturn<TData> {
  void _deprecatedOnRowSelectionChange

  // 表格状态
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters)
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [pagination, setPagination] = React.useState<PaginationState>(() => ({
    pageIndex: initialPagination?.pageIndex ?? 0,
    pageSize: initialPagination?.pageSize ?? pageSize,
  }))
  const [globalFilter, setGlobalFilter] = React.useState(initialGlobalFilter)
  const [expanded, setExpanded] =
    React.useState<ExpandedState>(initialExpanded)

  const handlePaginationChange = React.useCallback(
    (
      updater:
        | PaginationState
        | ((old: PaginationState) => PaginationState)
    ) => {
      setPagination(prev =>
        typeof updater === 'function'
          ? (updater as (old: PaginationState) => PaginationState)(prev)
          : updater
      )
    },
    []
  )

  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting(prev =>
        typeof updater === 'function'
          ? (updater as (old: SortingState) => SortingState)(prev)
          : updater
      )
    },
    []
  )

  const handleColumnFiltersChange = React.useCallback(
    (
      updater:
        | ColumnFiltersState
        | ((old: ColumnFiltersState) => ColumnFiltersState)
    ) => {
      setColumnFilters(prev =>
        typeof updater === 'function'
          ? (updater as (old: ColumnFiltersState) => ColumnFiltersState)(prev)
          : updater
      )
    },
    []
  )

  const handleGlobalFilterChange = React.useCallback(
    (updater: string | ((old: string) => string)) => {
      setGlobalFilter(prev =>
        typeof updater === 'function'
          ? (updater as (old: string) => string)(prev)
          : updater
      )
    },
    []
  )

  const didMountRef = React.useRef(false)
  React.useEffect(() => {
    didMountRef.current = true
  }, [])

  React.useEffect(() => {
    if (!didMountRef.current) return
    onPaginationChange?.(pagination)
  }, [pagination, onPaginationChange])

  React.useEffect(() => {
    if (!didMountRef.current) return
    onSortingChange?.(sorting)
  }, [sorting, onSortingChange])

  React.useEffect(() => {
    if (!didMountRef.current) return
    onColumnFiltersChange?.(columnFilters)
  }, [columnFilters, onColumnFiltersChange])

  React.useEffect(() => {
    if (!didMountRef.current) return
    onGlobalFilterChange?.(globalFilter)
  }, [globalFilter, onGlobalFilterChange])

  const serviceEnabled = React.useMemo(
    () => typeof dataService === 'function',
    [dataService]
  )

  const {
    manualPagination: forwardedManualPagination,
    manualSorting: forwardedManualSorting,
    manualFiltering: forwardedManualFiltering,
    pageCount: forwardedPageCount,
    ...restTableOptions
  } = tableOptions

  const manualPagination =
    typeof forwardedManualPagination === 'boolean'
      ? forwardedManualPagination
      : serviceEnabled
  const manualSorting =
    typeof forwardedManualSorting === 'boolean'
      ? forwardedManualSorting
      : serviceEnabled
  const manualFiltering =
    typeof forwardedManualFiltering === 'boolean'
      ? forwardedManualFiltering
      : serviceEnabled

  const resolvedInitialRowCount =
    rowCountProp > 0 ? rowCountProp : data.length

  const [tableData, setTableData] = React.useState<TData[]>(data)
  const [totalCount, setTotalCount] =
    React.useState<number>(resolvedInitialRowCount)

  React.useEffect(() => {
    if (serviceEnabled) return
    setTableData(data)
    setTotalCount(rowCountProp > 0 ? rowCountProp : data.length)
  }, [serviceEnabled, data, rowCountProp])

  React.useEffect(() => {
    if (!serviceEnabled) return
    if (rowCountProp > 0) {
      setTotalCount(rowCountProp)
    }
  }, [serviceEnabled, rowCountProp])

  const lastRequestParamsRef = React.useRef<IParams>({})
  const dataServiceRef = React.useRef(dataService)

  React.useEffect(() => {
    dataServiceRef.current = dataService
  }, [dataService])

  const serviceFetcher = React.useCallback(
    (params: IParams) => {
      if (!dataServiceRef.current) {
        return Promise.reject(
          new Error('dataService is not provided')
        )
      }
      // Deduplicate concurrent requests with the same params.
      // This prevents duplicate initial list calls even if the hook is invoked twice
      // (e.g. due to framework/runtime behaviors).
      const key = buildInflightKey(dataServiceRef.current, params)
      const existing = inflightRequestByKey.get(key)
      if (existing) {
        return existing as Promise<IList<TData>>
      }

      const promise = Promise.resolve(dataServiceRef.current(params))
      inflightRequestByKey.set(key, promise)
      promise.finally(() => {
        inflightRequestByKey.delete(key)
      })
      return promise
    },
    []
  )

  const onServiceSuccess = React.useCallback(
    (result: IList<TData>) => {
      const nextItems = result.list ?? []
      const nextTotal =
        typeof result.total === 'number' ? result.total : nextItems.length

      setTableData(nextItems)
      setTotalCount(nextTotal)
      setRowSelection(prev => {
        if (Object.keys(prev).length === 0) {
          return prev
        }
        return {}
      })

      if (manualPagination) {
        setPagination(prev => {
          const maxPageIndex = Math.max(
            0,
            Math.ceil(nextTotal / prev.pageSize) - 1
          )
          if (prev.pageIndex > maxPageIndex) {
            return { ...prev, pageIndex: maxPageIndex }
          }
          return prev
        })
      }
    },
    [manualPagination]
  )

  const {
    loading: serviceLoading,
    error: serviceError,
    run: runServiceRequest,
    runAsync: runServiceRequestAsync,
    refresh: refreshService,
  } = useRequest<IList<TData>, [IParams]>(serviceFetcher, {
    manual: true,
    onSuccess: onServiceSuccess,
  })

  const requestParams = React.useMemo<IParams>(() => {
    const params: IParams = {
      pageIndex: pagination.pageIndex,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }

    if (enableSorting && sorting.length > 0) {
      params.sorting = sorting.map(sort => ({
        id: sort.id,
        desc: sort.desc,
      }))
    }

    if (enableFiltering) {
      if (columnFilters.length > 0) {
        params.filters = columnFilters.map(filter => ({
          id: filter.id,
          value: filter.value,
        }))
      }
      if (globalFilter) {
        params.globalFilter = globalFilter
      }
    }

    return params
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    enableSorting,
    sorting,
    enableFiltering,
    columnFilters,
    globalFilter,
  ])

  const hasFiredFirstRequest = React.useRef(false)

  React.useEffect(() => {
    if (!serviceEnabled || !dataServiceRef.current) return
    hasFiredFirstRequest.current = true
    lastRequestParamsRef.current = requestParams
    runServiceRequest(requestParams)
  }, [serviceEnabled, requestParams, runServiceRequest])

  const refreshData = React.useCallback(() => {
    if (!serviceEnabled || !dataServiceRef.current) {
      return Promise.resolve<IList<TData> | undefined>({
        list: tableData,
        total: totalCount,
      })
    }
    const result = refreshService()
    if (result !== undefined) {
      return result
    }
    return Promise.resolve(undefined)
  }, [serviceEnabled, refreshService, tableData, totalCount])

  const runDataService = React.useCallback(
    (params?: IParams) => {
      if (!serviceEnabled || !dataServiceRef.current) {
        return Promise.resolve<IList<TData>>({
          list: tableData,
          total: totalCount,
        })
      }
      const finalParams =
        params ?? lastRequestParamsRef.current ?? requestParams
      lastRequestParamsRef.current = finalParams
      return runServiceRequestAsync(finalParams)
    },
    [
      serviceEnabled,
      tableData,
      totalCount,
      runServiceRequestAsync,
      requestParams,
    ]
  )

  const computedRowCount = totalCount
  const computedPageCount =
    forwardedPageCount ??
    (manualPagination
      ? Math.max(
          0,
          Math.ceil(
            (computedRowCount || 0) / Math.max(1, pagination.pageSize)
          )
        )
      : undefined)

  // 创建表格实例
  const handleExpandedChange = React.useCallback(
    (
      updater:
        | ExpandedState
        | ((old: ExpandedState) => ExpandedState)
    ) => {
      setExpanded(prev => {
        const previous = prev
        const next =
          typeof updater === 'function'
            ? (updater as (old: ExpandedState) => ExpandedState)(previous)
            : updater

        if (typeof next === 'boolean') {
          return next
        }

        if (expandMode === 'single') {
          const prevMap =
            typeof previous === 'boolean' ? {} : previous ?? {}
          const activeEntries = Object.entries(next).filter(([, value]) =>
            Boolean(value)
          )

          if (activeEntries.length === 0) {
            return {}
          }

          if (activeEntries.length === 1) {
            const [onlyId] = activeEntries[0]
            return { [onlyId]: true }
          }

          const newlyAdded = activeEntries.find(
            ([rowId]) => !prevMap[rowId]
          )
          const targetId =
            newlyAdded?.[0] ??
            activeEntries[activeEntries.length - 1][0]

          return { [targetId]: true }
        }

        return next
      })
    },
    [expandMode]
  )

  const table = useReactTable({
    ...restTableOptions,
    data: tableData,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      columnFilters,
      sorting,
      pagination,
      globalFilter,
      expanded,
    },
    rowCount: computedRowCount,
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: computedPageCount,
    enableSorting,
    enableColumnFilters: enableFiltering,
    enableGlobalFilter: enableFiltering,
    enableExpanding,
    getRowCanExpand,
    enableRowSelection,
    enableMultiRowSelection,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: handleColumnFiltersChange,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onExpandedChange: handleExpandedChange,
    getCoreRowModel:
      restTableOptions.getCoreRowModel ?? getCoreRowModel(),
    getFilteredRowModel:
      restTableOptions.getFilteredRowModel ??
      (!manualFiltering && enableFiltering
        ? getFilteredRowModel()
        : undefined),
    getSortedRowModel:
      restTableOptions.getSortedRowModel ??
      (!manualSorting && enableSorting ? getSortedRowModel() : undefined),
    getPaginationRowModel:
      restTableOptions.getPaginationRowModel ??
      (!manualPagination && enablePagination
        ? getPaginationRowModel()
        : undefined),
    getExpandedRowModel:
      restTableOptions.getExpandedRowModel ??
      (enableExpanding ? getExpandedRowModel() : undefined),
    getFacetedRowModel:
      restTableOptions.getFacetedRowModel ??
      (!manualFiltering && enableFiltering
        ? getFacetedRowModel()
        : undefined),
    getFacetedUniqueValues:
      restTableOptions.getFacetedUniqueValues ??
      (!manualFiltering && enableFiltering
        ? getFacetedUniqueValues()
        : undefined),
  })

  const loading = serviceEnabled ? (serviceLoading || !hasFiredFirstRequest.current) : false
  const error = serviceEnabled ? (serviceError as Error | undefined) : undefined

  // 获取选中的行
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map(row => row.original)

  // 重置所有状态
  const resetTable = React.useCallback(() => {
    setRowSelection({})
    setColumnFilters(initialColumnFilters)
    setSorting(initialSorting)
    setGlobalFilter(initialGlobalFilter)
    setPagination({ pageIndex: 0, pageSize })
    setExpanded(initialExpanded)
  }, [
    pageSize,
    initialSorting,
    initialColumnFilters,
    initialGlobalFilter,
    initialExpanded,
  ])

  // 重置选择
  const resetSelection = React.useCallback(() => {
    setRowSelection({})
  }, [])

  // 重置过滤
  const resetFilters = React.useCallback(() => {
    setColumnFilters(initialColumnFilters)
    setGlobalFilter(initialGlobalFilter)
  }, [initialColumnFilters, initialGlobalFilter])

  // 重置排序
  const resetSorting = React.useCallback(() => {
    setSorting(initialSorting)
  }, [initialSorting])

  // 重置分页
  const resetPagination = React.useCallback(() => {
    setPagination({ pageIndex: 0, pageSize })
  }, [pageSize])

  const resetExpanded = React.useCallback(() => {
    setExpanded(initialExpanded)
  }, [initialExpanded])

  const filteredRowCount =
    !enableFiltering || manualFiltering
      ? table.getRowModel().rows.length
      : table.getFilteredRowModel().rows.length

  return {
    table,
    // 状态
    rowSelection,
    columnVisibility,
    columnFilters,
    sorting,
    pagination,
    globalFilter,
    expanded,
    // 状态设置器
    setRowSelection,
    setColumnVisibility,
    setColumnFilters,
    setSorting,
    setPagination,
    setGlobalFilter,
    setExpanded,
    // 选中的行
    selectedRows,
    selectedRowCount: selectedRows.length,
    // 辅助方法
    resetTable,
    resetSelection,
    resetFilters,
    resetSorting,
    resetPagination,
    resetExpanded,
    // 统计信息
    totalRows: computedRowCount,
    filteredRows: filteredRowCount,
    pageCount: table.getPageCount(),
    canPreviousPage: table.getCanPreviousPage(),
    canNextPage: table.getCanNextPage(),
    // 数据服务
    data: tableData,
    loading,
    error,
    refresh: refreshData,
    run: runDataService,
    // 滚动配置
    scrollConfig,
  }
}
