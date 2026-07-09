'use client'

import type { Table } from '@tanstack/react-table'
import { Search, X } from 'lucide-react'
import * as React from 'react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { getMessage } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFilterOptions } from './data-table-filter-options'

export interface DataTableToolbarSimpleProps<TData>
  extends React.ComponentProps<'div'> {
  /** 表格实例 */
  table: Table<TData>
  /** 全局搜索的值 */
  globalFilter?: string
  /** 全局搜索的改变回调 */
  onGlobalFilterChange?: (value: string) => void
  /** 搜索占位符 */
  searchPlaceholder?: string
  /** 显示重置按钮 */
  showReset?: boolean
  /** 重置按钮回调 */
  onReset?: () => void
  /** 显示列显隐选项 */
  viewOptions?: boolean
  /** 显示filter显隐选项 */
  filterOptions?: boolean
}

/**
 * 简化的数据表工具栏组件
 *
 * 提供全局搜索和重置功能的简化工具栏
 *
 * @example
 * ```tsx
 * <DataTableToolbarSimple
 *   table={table}
 *   globalFilter={globalFilter}
 *   onGlobalFilterChange={setGlobalFilter}
 *   searchPlaceholder="Search..."
 * >
 *   <Button>Export</Button>
 * </DataTableToolbarSimple>
 * ```
 */
export function DataTableToolbarSimple<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = getMessage('dataTable.search'),
  showReset = true,
  onReset,
  viewOptions = false,
  filterOptions = false,
  children,
  className,
  ...props
}: DataTableToolbarSimpleProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter

  // Initialize visible filters with all filterable columns
  const [visibleFilters, setVisibleFilters] = React.useState<Set<string>>(
    () => {
      const filterableColumns = table
        .getAllColumns()
        .filter(column => column.getCanFilter() && column.columnDef.meta)
      return new Set(filterableColumns.map(col => col.id))
    }
  )

  const handleReset = React.useCallback(() => {
    if (onReset) {
      onReset()
    } else {
      table.resetColumnFilters()
      if (onGlobalFilterChange) {
        onGlobalFilterChange('')
      }
    }
  }, [table, onReset, onGlobalFilterChange])

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        'flex w-full items-center justify-between gap-2 p-1',
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2">
        {/* 全局搜索 */}
        {onGlobalFilterChange !== undefined && (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={e => onGlobalFilterChange(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        )}

        {/* 重置按钮 */}
        {showReset && isFiltered && (
          <Button
            variant="ghost"
            onClick={handleReset}
            size="sm"
            className="h-8 px-2 lg:px-3"
          >
            <X className="mr-2 h-4 w-4" />
            {getMessage('dataTable.toolbar.reset')}
          </Button>
        )}
      </div>

      {/* 自定义内容和选项 */}
      <div className="flex items-center gap-2">
        {children}
        {filterOptions && (
          <DataTableFilterOptions
            table={table}
            visibleFilters={visibleFilters}
            onVisibleFiltersChange={setVisibleFilters}
          />
        )}
        {viewOptions && <DataTableViewOptions table={table} />}
      </div>
    </div>
  )
}
