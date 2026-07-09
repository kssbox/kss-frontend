import type { ColumnDef } from '@tanstack/react-table'
import {
  Badge,
  Button,
  Checkbox,
  DataTableColumnHeader,
} from '../../src/components'
import type { Task, Project } from './types'
import {
  statusOptions,
  priorityOptions,
  projectStatusOptions,
  projectOwnerOptions,
} from './mock-data'

export const defaultColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
  },
  {
    accessorKey: 'status',
  },
  {
    accessorKey: 'priority',
  },
]

export const basicColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline">{row.original.id}</Badge>
        <span className="font-medium">{row.getValue<string>('title')}</span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Task',
      placeholder: 'Search tasks',
      variant: 'text',
    },
    filterFn: 'includesString',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: false,
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: statusOptions,
    },
    filterFn: (row, id, value) => {
      const filterValues = Array.isArray(value) ? value : []
      return filterValues.length === 0
        ? true
        : filterValues.includes(row.getValue<string>(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    enableSorting: false,
    enableColumnFilter: true,
    meta: {
      label: 'Priority',
      variant: 'select',
      options: priorityOptions,
    },
    filterFn: (row, id, value) => {
      const selected = Array.isArray(value) ? value[0] : undefined
      return selected ? row.getValue<string>(id) === selected : true
    },
  },
]

export const actionColumns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex gap-2">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        全选
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  ...basicColumns,
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={event => {
            event.stopPropagation()
            // eslint-disable-next-line no-console
            console.log('View task', row.original.id)
          }}
        >
          View
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={event => {
            event.stopPropagation()
            // eslint-disable-next-line no-console
            console.log('Archive task', row.original.id)
          }}
        >
          Archive
        </Button>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
  },
]

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline">{row.original.id}</Badge>
        <span className="font-medium">{row.getValue<string>('name')}</span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Project',
      placeholder: 'Search projects',
      variant: 'text',
    },
    filterFn: 'includesString',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: false,
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: projectStatusOptions,
    },
    filterFn: (row, id, value) => {
      const filterValues = Array.isArray(value) ? value : []
      return filterValues.length === 0
        ? true
        : filterValues.includes(row.getValue<string>(id))
    },
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    enableSorting: false,
    enableColumnFilter: true,
    meta: {
      label: 'Owner',
      variant: 'select',
      options: projectOwnerOptions,
    },
    filterFn: (row, id, value) => {
      const selected = Array.isArray(value) ? value[0] : undefined
      return selected ? row.getValue<string>(id) === selected : true
    },
  },
  {
    accessorKey: 'budget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Budget" />
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>('budget')
      return (
        <span className="tabular-nums">
          {value.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          })}
        </span>
      )
    },
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Budget',
      variant: 'range',
      range: [50000, 150000],
      unit: 'USD',
    },
    filterFn: (row, id, value) => {
      if (!Array.isArray(value) || value.length !== 2) return true
      const [min, max] = value as (number | undefined)[]
      const amount = row.getValue<number>(id)
      if (typeof amount !== 'number') return true
      if (typeof min === 'number' && amount < min) return false
      if (typeof max === 'number' && amount > max) return false
      return true
    },
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start date" />
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue<number>('startDate')
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(timestamp))
    },
    enableSorting: true,
    enableColumnFilter: true,
    sortingFn: 'datetime',
    meta: {
      label: 'Start date',
      variant: 'dateRange',
    },
    filterFn: (row, id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      const [from, to] = value as (number | undefined)[]
      const timestamp = row.getValue<number>(id)
      if (typeof timestamp !== 'number') return true
      if (typeof from === 'number' && timestamp < from) return false
      if (typeof to === 'number' && timestamp > to) return false
      return true
    },
  },
]
