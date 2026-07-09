import type { Meta, StoryObj } from '@storybook/react'
import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableColumnHeader,
  DataTableHooks,
} from '../../src/components/data-table'
import { Badge } from '../../src/components/ui/badge'
import type {
  IList,
  IListService,
  IParams,
} from '../../src/components/data-table/use-data-table'
import { CheckCircle2, Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components'
import { SlateEditor } from '@/components/rich-editor/rich-editor'
import { Descendant } from 'slate'

interface User {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Member'
  status: 'Active' | 'Invited' | 'Suspended'
  createdAt: string
}

const roles: User['role'][] = ['Owner', 'Admin', 'Member']
const statuses: User['status'][] = ['Active', 'Invited', 'Suspended']

const users: User[] = Array.from({ length: 72 }, (_, index) => {
  const baseDate = new Date('2024-01-01T09:00:00Z')
  baseDate.setDate(baseDate.getDate() + index)

  return {
    id: `user-${index + 1}`,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[index % roles.length],
    status: statuses[index % statuses.length],
    createdAt: baseDate.toISOString(),
  }
})

const normalizeFilterValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).filter(Boolean)
  }

  if (value === null || value === undefined || value === '') {
    return []
  }

  return [String(value)]
}

const toComparable = (
  value: unknown
): { type: 'number' | 'string'; value: number | string } => {
  if (value === null || value === undefined) {
    return { type: 'string', value: '' }
  }

  if (typeof value === 'number') {
    return { type: 'number', value }
  }

  if (typeof value === 'string') {
    const timestamp = Date.parse(value)
    if (!Number.isNaN(timestamp)) {
      return { type: 'number', value: timestamp }
    }
    return { type: 'string', value: value.toLowerCase() }
  }

  return { type: 'string', value: String(value).toLowerCase() }
}

const compareValues = (
  aValue: { type: 'number' | 'string'; value: number | string },
  bValue: { type: 'number' | 'string'; value: number | string }
) => {
  if (aValue.type === 'number' && bValue.type === 'number') {
    return (aValue.value as number) - (bValue.value as number)
  }

  return String(aValue.value).localeCompare(String(bValue.value))
}

const simulateNetwork = async <T,>(result: T): Promise<T> => {
  const delay = 400 + Math.random() * 300
  await new Promise(resolve => setTimeout(resolve, delay))
  return result
}

const remoteUserService: IListService<User> = async (params: IParams) => {
  const {
    pageIndex,
    page,
    pageSize = 10,
    sorting,
    filters,
    globalFilter,
  } = params

  const resolvedPageIndex =
    typeof pageIndex === 'number'
      ? pageIndex
      : typeof page === 'number'
        ? Math.max(0, page - 1)
        : 0

  let result = [...users]

  if (globalFilter) {
    const keyword = String(globalFilter).trim().toLowerCase()
    if (keyword) {
      result = result.filter(
        user =>
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword)
      )
    }
  }

  if (Array.isArray(filters)) {
    filters.forEach(filter => {
      if (!filter?.id) return

      if (filter.id === 'status') {
        const allowed = normalizeFilterValue(filter.value)
        if (allowed.length > 0) {
          result = result.filter(user => allowed.includes(user.status))
        }
      }

      if (filter.id === 'role') {
        const allowed = normalizeFilterValue(filter.value)
        if (allowed.length > 0) {
          result = result.filter(user => allowed.includes(user.role))
        }
      }
    })
  }

  if (Array.isArray(sorting) && sorting.length > 0) {
    const [{ id, desc }] = sorting as Array<{ id: keyof User; desc: boolean }>

    result = [...result].sort((a, b) => {
      const aComparable = toComparable(a[id])
      const bComparable = toComparable(b[id])
      const comparison = compareValues(aComparable, bComparable)
      return desc ? -comparison : comparison
    })
  }

  const total = result.length
  const start = resolvedPageIndex * pageSize
  const items = result.slice(start, start + pageSize)

  return simulateNetwork<IList<User>>({
    total,
    list: items,
  })
}

const statusVariantMap: Record<
  User['status'],
  'default' | 'secondary' | 'outline'
> = {
  Active: 'default',
  Invited: 'outline',
  Suspended: 'secondary',
}

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.original.name}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={statusVariantMap[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      )
    },
  },
]

const meta = {
  title: 'Data Table/Data Service',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Data Service 集成

通过为 \`useDataTable\` 传入 \`dataService\`，可以自动处理分页、排序和筛选请求，只需专注渲染 UI。

- 支持服务端分页、排序、筛选
- 自动管理 loading / error 状态
- 可与现有 DataTableHooks 组合使用
        `,
      },
    },
  },
  tags: ['autoMock'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const RemoteHooksComponent = () => {
  return (
    <div className="space-y-4">
      <DataTableHooks
        columns={userColumns}
        dataService={remoteUserService}
        enableFiltering
        enableSorting
        enableRowSelection
        pageSize={10}
        searchPlaceholder="Search users..."
        viewOptions
        filterOptions
        renderExpandedRow={row => {
          const user = row.original
          return (
            <div className="p-2">
              <div className="mb-2 text-sm text-gray-600">
                为 {user.name} 添加备注:
              </div>
              <SlateEditor
                className="w-full"
                placeholder="输入备注..."
                onSave={(content: Descendant[]) => {
                  console.log('save data for user:', user.id, content)
                }}
              />
            </div>
          )
        }}
        toolbarContent={
          <>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">Add Product</Button>
          </>
        }
        selectionToolbar={selectedRows => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log(selectedRows)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Done
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log(selectedRows)}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => console.log(selectedRows)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </>
        )}
      />
    </div>
  )
}

export const DataTableHooksWithService: Story = {
  render: () => <RemoteHooksComponent />,
  parameters: {
    docs: {
      description: {
        story:
          '远程数据服务示例：结合分页、排序、筛选、行选择与自定义工具栏，演示与服务端协作的完整流程。现在支持通过 Filters 按钮控制哪些筛选器显示，通过 View 按钮控制哪些列显示。',
      },
    },
  },
}
