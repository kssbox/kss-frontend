# Data Table Hooks 使用指南

本指南介绍如何在业务项目中使用基于 hooks 的 data-table 组件。

## 📦 组件概览

### 1. `useDataTable` - 自定义 Hook

封装了 `@tanstack/react-table` 的常用功能，提供简化的 API。

### 2. `DataTableHooks` - 完整表格组件

开箱即用的表格组件，内部使用 `useDataTable` hook。

### 3. `DataTableToolbarSimple` - 简化工具栏

提供搜索和重置功能的轻量级工具栏。

---

## 🚀 快速开始

### 方式一：使用 `DataTableHooks` 组件（推荐）

最简单的使用方式，适合大多数场景。

```tsx
import { DataTableHooks } from '@/components/data-table'
import type { ColumnDef } from '@tanstack/react-table'

interface User {
  id: string
  name: string
  email: string
  role: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
]

function UserTable() {
  const users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'User' },
  ]

  return (
    <DataTableHooks
      data={users}
      columns={columns}
      enableFiltering
      enableSorting
      enablePagination
      pageSize={10}
      searchPlaceholder="Search users..."
    />
  )
}
```

---

## 📖 详细使用

### `DataTableHooks` 组件 Props

```typescript
interface DataTableHooksProps<TData, TValue> {
  // 必需
  data: TData[]                           // 表格数据
  columns: ColumnDef<TData, TValue>[]     // 列定义

  // 功能开关
  enableRowSelection?: boolean            // 启用行选择
  enableMultiRowSelection?: boolean       // 启用多行选择
  enableFiltering?: boolean               // 启用过滤
  enableSorting?: boolean                 // 启用排序
  enablePagination?: boolean              // 启用分页
  enableExpanding?: boolean               // 启用展开（当提供 renderExpandedRow 时会自动开启）
  expandMode?: 'single' | 'multiple'      // 展开模式，默认 single 支持同时展开多个

  // 配置
  pageSize?: number                       // 每页数量（默认 10）
  initialSorting?: SortingState          // 初始排序
  getRowCanExpand?: (row: Row<TData>) => boolean // 控制行是否可以展开
  searchPlaceholder?: string             // 搜索框占位符

  // UI 控制
  showToolbar?: boolean                   // 显示工具栏（默认 true）
  showPagination?: boolean                // 显示分页（默认 true）
  toolbarContent?: React.ReactNode        // 工具栏自定义内容
  emptyState?: React.ReactNode           // 空状态
  isLoading?: boolean                    // 加载状态
  loadingState?: React.ReactNode         // 加载状态UI
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode // 自定义展开行，提供后默认开启展开并支持点击整行切换
  expandOnRowClick?: boolean             // 是否点击整行切换展开（默认在提供 renderExpandedRow 时为 true）

  // 回调
  onRowSelectionChange?: (rows: TData[]) => void  // 行选择变化
}
```

> 使用行展开相关配置时，请从 `@tanstack/react-table` 导入 `Row` 类型。

---

## 💡 使用示例

### 示例 1: 带搜索和排序的表格

```tsx
import { DataTableHooks } from '@/components/data-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Product Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price)
    },
  },
]

function ProductTable() {
  return (
    <DataTableHooks
      data={products}
      columns={columns}
      enableFiltering
      enableSorting
      searchPlaceholder="Search products..."
    />
  )
}
```

### 示例 2: 带行选择和批量操作

```tsx
import { DataTableHooks } from '@/components/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Task',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
]

function TaskTable() {
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])

  const handleDelete = () => {
    console.log('Deleting tasks:', selectedTasks)
  }

  return (
    <DataTableHooks
      data={tasks}
      columns={columns}
      enableRowSelection
      enablePagination
      pageSize={10}
      onRowSelectionChange={setSelectedTasks}
      toolbarContent={
        selectedTasks.length > 0 && (
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete {selectedTasks.length}
          </Button>
        )
      }
    />
  )
}
```

### 示例 3: 带分页的完整表格

```tsx
function EmployeeTable() {
  return (
    <DataTableHooks
      data={employees}
      columns={employeeColumns}
      enableRowSelection
      enableFiltering
      enableSorting
      enablePagination
      searchPlaceholder="Search employees..."
      showToolbar
      showPagination
      toolbarContent={
        <Button>
          Export
        </Button>
      }
      onRowSelectionChange={(rows) => {
        console.log('Selected employees:', rows)
      }}
    />
  )
}
```

### 示例 4: 行展开展示详情

```tsx
import { DataTableHooks } from '@/components/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  customer: string
  total: number
  status: 'draft' | 'paid'
}

const orderColumns: ColumnDef<Order>[] = [
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'total', header: 'Total' },
]

const orders: Order[] = [
  { id: '1', customer: 'Alice', total: 299, status: 'paid' },
  { id: '2', customer: 'Bob', total: 149, status: 'draft' },
]

function OrdersTable() {
  return (
    <DataTableHooks
      data={orders}
      columns={orderColumns}
      renderExpandedRow={row => (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Latest status: <span className="font-medium">{row.original.status}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Edit
            </Button>
            <Button size="sm">Send invoice</Button>
          </div>
        </div>
      )}
    />
  )
}
```

> 需要自定义展开行为时，可通过 `expandOnRowClick={false}` 禁用整行点击，并使用自定义触发器调用 `row.toggleExpanded()`。
>
> 默认展开模式为 `multiple`，允许同时展开多行；如果需要手风琴效果，可设置 `expandMode="single"`。想在初始时展开全部行，可传入 `initialExpanded={true}`。

---

## 🎨 自定义样式

### 自定义表格容器

```tsx
<DataTableHooks
  data={data}
  columns={columns}
  containerClassName="rounded-lg shadow-lg p-4"
  tableClassName="border-2"
/>
```

### 自定义空状态

```tsx
<DataTableHooks
  data={data}
  columns={columns}
  emptyState={
    <div className="flex flex-col items-center justify-center h-32">
      <p className="text-muted-foreground">No data available</p>
      <Button className="mt-4">Add New</Button>
    </div>
  }
/>
```

### 自定义加载状态

```tsx
<DataTableHooks
  data={data}
  columns={columns}
  isLoading={isLoading}
  loadingState={
    <TableRow>
      <TableCell colSpan={columns.length}>
        <div className="flex items-center justify-center h-32">
          <Spinner />
        </div>
      </TableCell>
    </TableRow>
  }
/>
```

---

## 🔧 高级使用

### 方式二：直接使用 `useDataTable` Hook

如果需要更灵活的控制，可以直接使用 hook。

```tsx
import { useDataTable } from '@/components/data-table'
import { flexRender } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function CustomTable() {
  const {
    table,
    selectedRows,
    globalFilter,
    setGlobalFilter,
    resetFilters,
  } = useDataTable({
    data: myData,
    columns: myColumns,
    enableRowSelection: true,
    enableFiltering: true,
    enableSorting: true,
    enablePagination: true,
    pageSize: 10,
    onRowSelectionChange: (rows) => {
      console.log('Selected:', rows)
    },
  })

  return (
    <div>
      {/* 自定义工具栏 */}
      <div className="mb-4 flex gap-2">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
        <button onClick={resetFilters}>Reset</button>
        {selectedRows.length > 0 && (
          <span>Selected: {selectedRows.length}</span>
        )}
      </div>

      {/* 自定义表格渲染 */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 使用内置分页组件 */}
      <DataTablePagination table={table} />
    </div>
  )
}
```

---

## 📝 常见问题

### Q: 如何实现服务端分页？

A: 使用 `useDataTable` hook，不要启用 `enablePagination`，手动管理分页逻辑：

```tsx
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(10)

// 从 API 获取数据
const { data, totalCount } = useFetchData({ page, pageSize })

const { table } = useDataTable({
  data,
  columns,
  enablePagination: false, // 不使用客户端分页
})

// 自定义分页控件
```

### Q: 如何持久化表格状态？

A: 使用 `localStorage` 或状态管理库：

```tsx
const [sorting, setSorting] = useState(() => {
  const saved = localStorage.getItem('table-sorting')
  return saved ? JSON.parse(saved) : []
})

useEffect(() => {
  localStorage.setItem('table-sorting', JSON.stringify(sorting))
}, [sorting])

const { table } = useDataTable({
  data,
  columns,
  initialSorting: sorting,
  enableSorting: true,
})
```

### Q: 如何在列中添加操作按钮？

A: 在列定义中使用 `cell` 函数：

```tsx
{
  id: 'actions',
  cell: ({ row }) => (
    <div className="flex gap-2">
      <Button onClick={() => handleEdit(row.original)}>Edit</Button>
      <Button onClick={() => handleDelete(row.original)}>Delete</Button>
    </div>
  ),
}
```

---

## 🎯 最佳实践

1. **使用 TypeScript** - 定义清晰的数据类型
2. **记忆化列定义** - 使用 `useMemo` 包裹 columns
3. **合理启用功能** - 只启用需要的功能，避免不必要的性能开销
4. **自定义单元格** - 使用 `cell` 函数渲染复杂内容
5. **错误处理** - 提供友好的空状态和加载状态

---

## 📚 更多示例

查看 `stories/data-table/hooks-examples/` 目录下的完整示例：

- `SimpleUserTable.tsx` - 简单表格
- `ProductTableWithFilters.tsx` - 过滤和排序
- `TaskTableWithSelection.tsx` - 行选择和批量操作
- `AdvancedTableWithCustomHook.tsx` - 完整功能示例

在 Storybook 中查看：运行 `npm run storybook`，导航到 "Data Table / Hooks Examples"
