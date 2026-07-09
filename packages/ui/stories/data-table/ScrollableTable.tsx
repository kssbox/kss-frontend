import { useMemo } from 'react'
import { DataTable, Badge, DataTableHooks } from '../../src/components'
import { DataTableColumnHeader } from '../../src/components/data-table'
import type { ColumnDef } from '@tanstack/react-table'

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  lastActive: string
}

// 生成大量模拟数据
const generateUsers = (count: number): User[] => {
  const roles = [
    'Developer',
    'Designer',
    'Manager',
    'Product Manager',
    'QA Engineer',
    'DevOps',
  ]
  const departments = [
    'Engineering',
    'Design',
    'Product',
    'Marketing',
    'Sales',
    'HR',
  ]
  const statuses: User['status'][] = ['active', 'inactive', 'pending']
  const firstNames = [
    '张',
    '李',
    '王',
    '刘',
    '陈',
    '杨',
    '赵',
    '黄',
    '周',
    '吴',
    'John',
    'Jane',
    'Bob',
    'Alice',
    'Charlie',
  ]
  const lastNames = [
    '伟',
    '芳',
    '娜',
    '秀英',
    '敏',
    '静',
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
  ]

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName}${lastName}`

    return {
      id: `USER-${String(i + 1).padStart(4, '0')}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}${i + 1}@company.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      joinDate: new Date(
        2020 + Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split('T')[0],
      lastActive: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
    }
  })
}

const statusColorMap = {
  active: 'default',
  inactive: 'secondary',
  pending: 'outline',
} as const

export function ScrollableTable() {
  // 生成 100 条数据来展示滚动效果
  const users = useMemo(() => generateUsers(100), [])

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono">
            {row.getValue('id')}
          </Badge>
        ),
        size: 120,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="姓名" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
        size: 150,
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="邮箱" />
        ),
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.getValue('email')}</div>
        ),
        size: 250,
      },
      {
        accessorKey: 'role',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="职位" />
        ),
        size: 150,
      },
      {
        accessorKey: 'department',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="部门" />
        ),
        size: 120,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="状态" />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as User['status']
          return (
            <Badge variant={statusColorMap[status]}>
              {status === 'active'
                ? '在职'
                : status === 'inactive'
                  ? '离职'
                  : '待入职'}
            </Badge>
          )
        },
        size: 100,
      },
      {
        accessorKey: 'joinDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="入职日期" />
        ),
        size: 120,
      },
      {
        accessorKey: 'lastActive',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="最后活跃" />
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.getValue('lastActive')}
          </div>
        ),
        size: 120,
      },
    ],
    []
  )

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">员工列表</h2>
          <p className="text-muted-foreground">
            共 {users.length} 名员工 - 表格高度限制为 500px，滚动查看更多数据
          </p>
        </div>
        <DataTable
          columns={columns}
          data={users}
          scrollConfig={{
            maxHeight: 500,
            stickyHeader: true,
          }}
        />
      </div>
    </div>
  )
}

export function ScrollableTableWithViewportHeight() {
  const users = useMemo(() => generateUsers(150), [])

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono">
            {row.getValue('id')}
          </Badge>
        ),
      },
      {
        accessorKey: 'name',
        header: '姓名',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: '邮箱',
      },
      {
        accessorKey: 'role',
        header: '职位',
      },
      {
        accessorKey: 'department',
        header: '部门',
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => {
          const status = row.getValue('status') as User['status']
          return (
            <Badge variant={statusColorMap[status]}>
              {status === 'active'
                ? '在职'
                : status === 'inactive'
                  ? '离职'
                  : '待入职'}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'joinDate',
        header: '入职日期',
      },
      {
        accessorKey: 'lastActive',
        header: '最后活跃',
      },
    ],
    []
  )

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            员工列表（响应式高度）
          </h2>
          <p className="text-muted-foreground">
            共 {users.length} 名员工 - 表格高度为视口高度的 60%
          </p>
        </div>
        <DataTable
          columns={columns}
          data={users}
          scrollConfig={{
            maxHeight: '60vh',
            stickyHeader: true,
          }}
        />
      </div>
    </div>
  )
}

export function ScrollableTableWithPagination() {
  const users = useMemo(() => generateUsers(200), [])

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono">
            {row.getValue('id')}
          </Badge>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="姓名" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="邮箱" />
        ),
      },
      {
        accessorKey: 'role',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="职位" />
        ),
      },
      {
        accessorKey: 'department',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="部门" />
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="状态" />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as User['status']
          return (
            <Badge variant={statusColorMap[status]}>
              {status === 'active'
                ? '在职'
                : status === 'inactive'
                  ? '离职'
                  : '待入职'}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'joinDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="入职日期" />
        ),
      },
      {
        accessorKey: 'lastActive',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="最后活跃" />
        ),
      },
    ],
    []
  )

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            员工列表（分页 + 滚动）
          </h2>
          <p className="text-muted-foreground">
            共 {users.length} 名员工 - 每页 50 条数据，表格高度 400px
          </p>
        </div>
        <DataTableHooks
          columns={columns}
          data={users}
          enablePagination={true}
          enableSorting={true}
          enableFiltering={true}
          pageSize={50}
          searchPlaceholder="搜索员工..."
          scrollConfig={{
            maxHeight: 400,
            stickyHeader: true,
          }}
        />
      </div>
    </div>
  )
}
