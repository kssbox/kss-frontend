'use client'

import type { Column, Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import * as React from 'react'

import { getMessage } from '../../lib/i18n'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '../../lib/utils'
import { DataTableDateFilter } from './data-table-date-filter'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableSliderFilter } from './data-table-slider-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFilterOptions } from './data-table-filter-options'
import type { DataTableColumnMeta } from './types'

export interface DataTableToolbarProps<TData>
  extends React.ComponentProps<'div'> {
  table: Table<TData>
  viewOptions?: boolean
  filterOptions?: boolean

  /** Column ids to show as visible filters by default. Defaults to all filterable columns. */
  defaultVisibleFilterIds?: string[]
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  viewOptions = false,
  filterOptions = false,
  defaultVisibleFilterIds,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const columns = React.useMemo(
    () => table.getAllColumns().filter(column => column.getCanFilter()),
    [table]
  )

  // Initialize visible filters (defaults to all filterable columns)
  const [visibleFilters, setVisibleFilters] = React.useState<Set<string>>(
    () => {
      const allowed = new Set(columns.map(col => col.id))
      if (!defaultVisibleFilterIds || defaultVisibleFilterIds.length === 0) {
        return allowed
      }
      const next = new Set<string>()
      for (const id of defaultVisibleFilterIds) {
        if (allowed.has(id)) next.add(id)
      }
      return next.size > 0 ? next : allowed
    }
  )

  // If columns change, drop any ids that are no longer filterable.
  React.useEffect(() => {
    const allowed = new Set(columns.map(col => col.id))
    setVisibleFilters(prev => {
      const next = new Set<string>()
      for (const id of prev) {
        if (allowed.has(id)) next.add(id)
      }
      return next
    })
  }, [columns])

  // Filter columns based on visibility
  const visibleColumns = React.useMemo(
    () => columns.filter(column => visibleFilters.has(column.id)),
    [columns, visibleFilters]
  )

  const onReset = React.useCallback(() => {
    table.resetColumnFilters()
  }, [table])

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        'flex w-full items-start justify-between gap-2 py-1',
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {visibleColumns.map(column => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            aria-label={getMessage('dataTable.toolbar.resetFilters')}
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={onReset}
          >
            <X />
            {getMessage('dataTable.toolbar.reset')}
          </Button>
        )}
      </div>
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

interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>
}

function DataTableToolbarTextFilter<TData>({
  column,
  columnMeta,
  debounceMs,
}: {
  column: Column<TData>
  columnMeta: DataTableColumnMeta
  debounceMs: number
}) {
  const rawFilterValue = column.getFilterValue()
  const filterValue = (rawFilterValue as string) ?? ''
  const [inputValue, setInputValue] = React.useState<string>(filterValue)

  React.useEffect(() => {
    setInputValue(filterValue)
  }, [filterValue])

  React.useEffect(() => {
    if (debounceMs <= 0) return
    const handle = window.setTimeout(() => {
      const next = inputValue
      // IMPORTANT: do not create a column filter for empty input.
      // Otherwise, first mount will setFilterValue('') and may trigger an extra server request.
      if (next === '') {
        if (rawFilterValue !== undefined) {
          column.setFilterValue(undefined)
        }
        return
      }

      if (next !== rawFilterValue) {
        column.setFilterValue(next)
      }
    }, debounceMs)
    return () => window.clearTimeout(handle)
  }, [debounceMs, column, inputValue, rawFilterValue])

  return (
    <Input
      placeholder={columnMeta.placeholder ?? columnMeta.label}
      value={inputValue}
      onChange={event => {
        const next = event.target.value
        setInputValue(next)
        if (debounceMs <= 0) {
          if (next === '') {
            column.setFilterValue(undefined)
          } else {
            column.setFilterValue(next)
          }
        }
      }}
      className="h-8 w-40 lg:w-56"
    />
  )
}

function DataTableToolbarNumberFilter<TData>({
  column,
  columnMeta,
  debounceMs,
}: {
  column: Column<TData>
  columnMeta: DataTableColumnMeta
  debounceMs: number
}) {
  const rawFilterValue = column.getFilterValue()
  const filterValue = (rawFilterValue as string) ?? ''
  const [inputValue, setInputValue] = React.useState<string>(filterValue)

  React.useEffect(() => {
    setInputValue(filterValue)
  }, [filterValue])

  React.useEffect(() => {
    if (debounceMs <= 0) return
    const handle = window.setTimeout(() => {
      const next = inputValue
      if (next === '') {
        if (rawFilterValue !== undefined) {
          column.setFilterValue(undefined)
        }
        return
      }

      if (next !== rawFilterValue) {
        column.setFilterValue(next)
      }
    }, debounceMs)
    return () => window.clearTimeout(handle)
  }, [debounceMs, column, inputValue, rawFilterValue])

  return (
    <div className="relative">
      <Input
        type="number"
        inputMode="numeric"
        placeholder={columnMeta.placeholder ?? columnMeta.label}
        value={inputValue}
        onChange={event => {
          const next = event.target.value
          setInputValue(next)
          if (debounceMs <= 0) {
            if (next === '') {
              column.setFilterValue(undefined)
            } else {
              column.setFilterValue(next)
            }
          }
        }}
        className={cn('h-8 w-[120px]', columnMeta.unit && 'pr-8')}
      />
      {columnMeta.unit && (
        <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
          {columnMeta.unit}
        </span>
      )}
    </div>
  )
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  const columnMeta = column.columnDef.meta as DataTableColumnMeta | undefined

  if (!columnMeta?.variant) return null

  const debounceMs = columnMeta.debounceMs ?? 0

  switch (columnMeta.variant) {
    case 'text':
      return (
        <DataTableToolbarTextFilter
          column={column}
          columnMeta={columnMeta}
          debounceMs={debounceMs}
        />
      )

    case 'number':
      return (
        <DataTableToolbarNumberFilter
          column={column}
          columnMeta={columnMeta}
          debounceMs={debounceMs}
        />
      )

    case 'range':
      return (
        <DataTableSliderFilter
          column={column}
          title={columnMeta.label ?? column.id}
        />
      )

    case 'date':
    case 'dateRange':
      return (
        <DataTableDateFilter
          column={column}
          title={columnMeta.label ?? column.id}
          multiple={columnMeta.variant === 'dateRange'}
        />
      )

    case 'select':
    case 'multiSelect':
      return (
        <DataTableFacetedFilter
          column={column}
          title={columnMeta.label ?? column.id}
          options={columnMeta.options ?? []}
          multiple={columnMeta.variant === 'multiSelect'}
        />
      )

    default:
      return null
  }
}
