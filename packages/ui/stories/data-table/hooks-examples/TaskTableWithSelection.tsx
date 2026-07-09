'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2, Archive, CheckCircle2, MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../src/components/ui/table'
import { Button } from '../../../src/components/ui/button'
import { Checkbox } from '../../../src/components/ui/checkbox'
import { Badge } from '../../../src/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../src/components/ui/dropdown-menu'

// 任务数据类型
interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  dueDate: string
}

// 模拟任务数据
const initialTasks: Task[] = [
  {
    id: 'T001',
    title: 'Design new landing page',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Alice',
    dueDate: '2024-02-15',
  },
  {
    id: 'T002',
    title: 'Fix login bug',
    status: 'todo',
    priority: 'urgent',
    assignee: 'Bob',
    dueDate: '2024-02-10',
  },
  {
    id: 'T003',
    title: 'Write documentation',
    status: 'todo',
    priority: 'medium',
    assignee: 'Charlie',
    dueDate: '2024-02-20',
  },
  {
    id: 'T004',
    title: 'Update dependencies',
    status: 'done',
    priority: 'low',
    assignee: 'Diana',
    dueDate: '2024-02-08',
  },
  {
    id: 'T005',
    title: 'Implement dark mode',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Alice',
    dueDate: '2024-02-18',
  },
  {
    id: 'T006',
    title: 'Code review',
    status: 'todo',
    priority: 'high',
    assignee: 'Bob',
    dueDate: '2024-02-12',
  },
]

/**
 * 任务管理表格示例 - 带行选择和批量操作
 * 演示如何使用 useReactTable hook 实现行选择和批量操作功能
 */
export function TaskTableWithSelection() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  // 定义列
  const columns = React.useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
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
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.getValue('id')}</div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="max-w-[300px]">
            <div className="font-medium">{row.getValue('title')}</div>
            <div className="text-muted-foreground text-xs">
              Assigned to {row.original.assignee}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          const variants = {
            todo: 'bg-gray-100 text-gray-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            done: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
          }
          return (
            <Badge
              variant="secondary"
              className={variants[status as keyof typeof variants]}
            >
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const priority = row.getValue('priority') as string
          const colors = {
            low: 'text-gray-600',
            medium: 'text-blue-600',
            high: 'text-orange-600',
            urgent: 'text-red-600',
          }
          return (
            <span
              className={`font-medium capitalize ${colors[priority as keyof typeof colors]}`}
            >
              {priority}
            </span>
          )
        },
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('dueDate'))
          return (
            <div className="text-sm">
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const task = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(task.id, 'done')}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as done
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(task.id, 'cancelled')}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  // 使用 useReactTable hook
  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  // 获取选中的任务
  const selectedTasks = table
    .getFilteredSelectedRowModel()
    .rows.map(row => row.original)

  // 更新任务状态
  const handleUpdateStatus = React.useCallback(
    (taskId: string, status: Task['status']) => {
      setTasks(prev =>
        prev.map(task => (task.id === taskId ? { ...task, status } : task))
      )
    },
    []
  )

  // 删除任务
  const handleDeleteTask = React.useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }, [])

  // 批量删除选中的任务
  const handleBulkDelete = React.useCallback(() => {
    const selectedIds = new Set(selectedTasks.map(task => task.id))
    setTasks(prev => prev.filter(task => !selectedIds.has(task.id)))
    setRowSelection({})
  }, [selectedTasks])

  // 批量更新状态
  const handleBulkUpdateStatus = React.useCallback(
    (status: Task['status']) => {
      const selectedIds = new Set(selectedTasks.map(task => task.id))
      setTasks(prev =>
        prev.map(task =>
          selectedIds.has(task.id) ? { ...task, status } : task
        )
      )
      setRowSelection({})
    },
    [selectedTasks]
  )

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Task Management</h3>
        <p className="text-muted-foreground text-sm">
          Task table with row selection and bulk actions using useReactTable hook
        </p>
      </div>

      {/* 批量操作工具栏 */}
      {selectedTasks.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted p-4">
          <div className="flex-1">
            <span className="font-medium">
              {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''}{' '}
              selected
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkUpdateStatus('done')}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Done
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkUpdateStatus('cancelled')}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}

      {/* 表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <div>Total tasks: {tasks.length}</div>
        <div className="flex gap-4">
          <span>
            Todo: {tasks.filter(t => t.status === 'todo').length}
          </span>
          <span>
            In Progress: {tasks.filter(t => t.status === 'in-progress').length}
          </span>
          <span>
            Done: {tasks.filter(t => t.status === 'done').length}
          </span>
        </div>
      </div>
    </div>
  )
}
