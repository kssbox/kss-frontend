# Data Table Hooks Examples

这个目录包含了使用 `@tanstack/react-table` hooks 方式实现的各种表格示例。所有示例都是开箱即用的，可以直接复制到你的项目中使用。

## 📁 文件结构

```
hooks-examples/
├── README.md                          # 本文档
├── index.ts                           # 导出所有示例
├── useDataTable.ts                    # 自定义表格 hook
├── SimpleUserTable.tsx                # 示例 1: 简单用户列表
├── ProductTableWithFilters.tsx        # 示例 2: 带过滤和排序的产品表格
├── TaskTableWithSelection.tsx         # 示例 3: 带行选择和批量操作
└── AdvancedTableWithCustomHook.tsx    # 示例 4: 使用自定义 hook 的高级表格
```

## 📚 示例列表

### 1. SimpleUserTable - 简单用户列表

**文件**: `SimpleUserTable.tsx`

最基础的表格实现，展示如何使用 `useReactTable` hook 创建一个简单的表格。

**特性**:

- ✅ 基础表格渲染
- ✅ 自定义单元格渲染 (头像、徽章)
- ✅ 空状态处理

**适用场景**: 适合快速创建简单的数据展示表格

```tsx
import { SimpleUserTable } from './hooks-examples'

function App() {
  return <SimpleUserTable />
}
```

---

### 2. ProductTableWithFilters - 产品表格 (过滤 + 排序)

**文件**: `ProductTableWithFilters.tsx`

展示如何实现过滤和排序功能的表格。

**特性**:

- ✅ 全局搜索
- ✅ 列过滤 (下拉选择)
- ✅ 列排序 (点击表头排序)
- ✅ 自定义列格式化 (货币、徽章)
- ✅ 实时统计

**适用场景**: 需要对数据进行筛选和排序的场景

**核心代码**:

```tsx
const [sorting, setSorting] = useState<SortingState>([])
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
const [globalFilter, setGlobalFilter] = useState('')

const table = useReactTable({
  data,
  columns,
  state: { sorting, columnFilters, globalFilter },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
```

---

### 3. TaskTableWithSelection - 任务管理 (行选择 + 批量操作)

**文件**: `TaskTableWithSelection.tsx`

展示如何实现行选择和批量操作功能。

**特性**:

- ✅ 单行选择
- ✅ 全选/取消全选
- ✅ 批量操作 (删除、更新状态)
- ✅ 行操作菜单
- ✅ 批量操作工具栏
- ✅ 动态数据更新

**适用场景**: 需要对多行数据进行批量操作的场景

**核心代码**:

```tsx
const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

const table = useReactTable({
  data,
  columns,
  state: { rowSelection },
  enableRowSelection: true,
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),
})

// 获取选中的行
const selectedRows = table
  .getFilteredSelectedRowModel()
  .rows.map(row => row.original)
```

---

### 4. AdvancedTableWithCustomHook - 高级表格 (自定义 Hook)

**文件**: `AdvancedTableWithCustomHook.tsx`

使用自定义 `useDataTable` hook 实现的完整功能表格。

**特性**:

- ✅ 所有功能集成 (过滤、排序、分页、行选择)
- ✅ 简化的 API
- ✅ 内置辅助方法
- ✅ 自动统计信息
- ✅ 更少的样板代码

**适用场景**: 复杂的表格需求，需要完整功能且代码简洁

**核心代码**:

```tsx
const {
  table,
  selectedRows,
  selectedRowCount,
  globalFilter,
  setGlobalFilter,
  resetFilters,
  totalRows,
  filteredRows,
} = useDataTable({
  data: employees,
  columns,
  enableRowSelection: true,
  enableFiltering: true,
  enableSorting: true,
  enablePagination: true,
  pageSize: 5,
  onRowSelectionChange: (selectedEmployees) => {
    console.log('Selected:', selectedEmployees)
  },
})
```

---

## 🔧 自定义 Hook: useDataTable

**文件**: `useDataTable.ts`

封装了 `@tanstack/react-table` 的常用功能，提供简化的 API。

### 参数

```typescript
interface UseDataTableProps<TData, TValue> {
  data: TData[]                              // 表格数据
  columns: ColumnDef<TData, TValue>[]        // 列定义
  enableRowSelection?: boolean               // 启用行选择
  enableMultiRowSelection?: boolean          // 启用多行选择
  enableFiltering?: boolean                  // 启用过滤
  enableSorting?: boolean                    // 启用排序
  enablePagination?: boolean                 // 启用分页
  pageSize?: number                          // 每页显示数量
  initialSorting?: SortingState              // 初始排序状态
  onRowSelectionChange?: (rows: TData[]) => void  // 行选择变化回调
}
```

### 返回值

```typescript
{
  // 表格实例
  table: Table<TData>

  // 状态
  rowSelection: RowSelectionState
  columnVisibility: VisibilityState
  columnFilters: ColumnFiltersState
  sorting: SortingState
  pagination: PaginationState
  globalFilter: string

  // 状态设置器
  setRowSelection: (value: RowSelectionState) => void
  setColumnVisibility: (value: VisibilityState) => void
  setColumnFilters: (value: ColumnFiltersState) => void
  setSorting: (value: SortingState) => void
  setPagination: (value: PaginationState) => void
  setGlobalFilter: (value: string) => void

  // 选中的行
  selectedRows: TData[]
  selectedRowCount: number

  // 辅助方法
  resetTable: () => void
  resetSelection: () => void
  resetFilters: () => void
  resetSorting: () => void
  resetPagination: () => void

  // 统计信息
  totalRows: number
  filteredRows: number
  pageCount: number
  canPreviousPage: boolean
  canNextPage: boolean
}
```

### 使用示例

```tsx
import { useDataTable } from './hooks-examples'

function MyTable() {
  const {
    table,
    selectedRows,
    resetFilters,
  } = useDataTable({
    data: myData,
    columns: myColumns,
    enableRowSelection: true,
    enableFiltering: true,
    enableSorting: true,
    pageSize: 10,
  })

  return (
    <div>
      <button onClick={resetFilters}>Reset Filters</button>
      <div>Selected: {selectedRows.length}</div>
      {/* 渲染表格... */}
    </div>
  )
}
```

---

## 🚀 快速开始

### 1. 直接使用示例

```tsx
import { SimpleUserTable } from './stories/data-table/hooks-examples'

function App() {
  return <SimpleUserTable />
}
```

### 2. 使用自定义 Hook

```tsx
import { useDataTable } from './stories/data-table/hooks-examples'
import type { ColumnDef } from '@tanstack/react-table'

interface User {
  id: string
  name: string
  email: string
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
]

function MyUserTable() {
  const users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
  ]

  const { table } = useDataTable({
    data: users,
    columns,
    enableSorting: true,
  })

  // 渲染表格...
}
```

---

## 📖 学习路径

建议按照以下顺序学习这些示例：

1. **SimpleUserTable** - 了解基础概念
2. **ProductTableWithFilters** - 学习过滤和排序
3. **TaskTableWithSelection** - 掌握行选择和批量操作
4. **AdvancedTableWithCustomHook** - 使用自定义 hook 简化开发

---

## 🔗 相关资源

- [@tanstack/react-table 官方文档](https://tanstack.com/table/latest)
- [TanStack Table Examples](https://tanstack.com/table/latest/docs/examples/react/basic)

---

## 💡 提示

- 所有示例都使用 TypeScript，提供完整的类型安全
- 示例中的数据都是模拟数据，实际使用时替换为你的 API 数据
- 可以根据需要自定义样式和功能
- 自定义 hook 可以根据项目需求进行扩展

---

## 📝 常见问题

### Q: 如何自定义列的样式？

在 `columnDef` 中使用 `cell` 函数自定义渲染：

```tsx
{
  accessorKey: 'status',
  cell: ({ row }) => {
    const status = row.getValue('status')
    return <Badge>{status}</Badge>
  }
}
```

### Q: 如何实现服务端分页？

不使用 `getPaginationRowModel()`，手动处理分页逻辑：

```tsx
const table = useReactTable({
  data,
  columns,
  manualPagination: true,
  pageCount: Math.ceil(totalCount / pageSize),
  // ...
})
```

### Q: 如何持久化表格状态？

使用 `localStorage` 或其他状态管理方案：

```tsx
const [sorting, setSorting] = useState<SortingState>(() => {
  const saved = localStorage.getItem('table-sorting')
  return saved ? JSON.parse(saved) : []
})

useEffect(() => {
  localStorage.setItem('table-sorting', JSON.stringify(sorting))
}, [sorting])
```

---

Happy coding! 🎉
