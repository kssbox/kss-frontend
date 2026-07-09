import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
  Button,
  DataTableInstance,
  DataTableToolbar,
} from '../../src/components'
import { Task } from './types'

interface MyBizTableProps {
  columns: ColumnDef<Task>[]
  data: Task[]
  // pagination?: boolean | object
}

export const MyBizTable = (params: MyBizTableProps) => {
  const { columns, data } = params
  const [tableData] = React.useState(data)
  const [tableColumns] = React.useState(columns)
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data: tableData,
    state: { rowSelection, pagination },
    columns: tableColumns,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

  console.log('rowSelection: ', rowSelection)
  console.log('pagination: ', pagination)
  console.log(
    'originalId: ',
    table.getFilteredSelectedRowModel().rows.map(row => row.original.id)
  )

  return (
    <DataTableInstance table={table}>
      <DataTableToolbar table={table}>
        <Button
          onClick={() => {
            console.log('Exporting tasks')
          }}
        >
          Export
        </Button>
      </DataTableToolbar>
    </DataTableInstance>
  )
}
