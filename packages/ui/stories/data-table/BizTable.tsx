import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button, Checkbox } from '../../src/components'
import { tasks } from './mock-data'
import { Task } from './types'
import { MyBizTable } from './BizTable-component'

export const bizColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
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
  },
  {
    accessorKey: 'status',
  },
  {
    accessorKey: 'priority',
  },
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

export const BizTable = () => {
  const [tableData] = React.useState(tasks)
  return <MyBizTable columns={bizColumns} data={tableData} />
}
