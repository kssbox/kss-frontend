import * as React from 'react'
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Button,
  DataTableInstance,
  DataTableToolbar,
} from '../../src/components'
import { tasks } from './mock-data'
import { actionColumns } from './columns'

export const DataTableWithActions = () => {
  const [tableData, setTableData] = React.useState(tasks)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: tableData,
    columns: actionColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length

  const onBulkArchive = React.useCallback(() => {
    const selectedIds = new Set(
      table.getFilteredSelectedRowModel().rows.map(row => row.original.id)
    )
    console.log('Archiving tasks', Array.from(selectedIds))

    setTableData(previous => previous.filter(task => !selectedIds.has(task.id)))
    table.resetRowSelection()
  }, [table])

  return (
    <DataTableInstance
      table={table}
      selectionToolbar={
        selectedRowCount > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedRowCount} selected
            </span>
            <Button size="sm" variant="destructive" onClick={onBulkArchive}>
              Archive selected
            </Button>
          </div>
        ) : null
      }
    >
      <DataTableToolbar table={table}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('Exporting tasks')
          }}
        >
          Export
        </Button>
      </DataTableToolbar>
    </DataTableInstance>
  )
}
