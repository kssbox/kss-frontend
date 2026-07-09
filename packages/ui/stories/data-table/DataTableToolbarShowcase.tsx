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
  Badge,
  Button,
  DataTableDateFilter,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableSliderFilter,
  DataTableToolbar,
  DataTableViewOptions,
} from '../../src/components'
import { projects, projectStatusOptions } from './mock-data'
import { projectColumns } from './columns'

export const DataTableToolbarShowcase = () => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: projects,
    columns: projectColumns,
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

  const statusColumn = table.getColumn('status')
  const budgetColumn = table.getColumn('budget')
  const startDateColumn = table.getColumn('startDate')

  const currentRows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <DataTableToolbar table={table}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => table.resetSorting()}
        >
          Reset sorting
        </Button>
      </DataTableToolbar>

      <div className="flex flex-wrap items-center gap-2 rounded-md border p-3">
        {startDateColumn ? (
          <DataTableDateFilter
            column={startDateColumn}
            title="Start date"
            multiple
          />
        ) : null}
        {statusColumn ? (
          <DataTableFacetedFilter
            column={statusColumn}
            title="Status"
            options={projectStatusOptions}
            multiple
          />
        ) : null}
        {budgetColumn ? (
          <DataTableSliderFilter column={budgetColumn} title="Budget" />
        ) : null}
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-md border p-3">
        <div className="mb-3 text-sm font-medium">Visible projects</div>
        <div className="grid gap-2">
          {currentRows.map(row => (
            <div
              key={row.id}
              className="flex flex-col justify-between gap-1 rounded-md border border-dashed p-2 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{row.original.id}</Badge>
                <span className="font-medium">{row.original.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                <span>Status: {row.original.status}</span>
                <span>Owner: {row.original.owner}</span>
                <span>Budget: {row.original.budget.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        {currentRows.length === 0 ? (
          <div className="text-muted-foreground text-sm">No results.</div>
        ) : null}
      </div>

      <DataTablePagination table={table} pageSizeOptions={[3, 6, 9]} />
      <div className="text-muted-foreground text-sm">
        Combine the dedicated filter components above with the view options to
        tailor the dataset, then page through the results.
      </div>
    </div>
  )
}
