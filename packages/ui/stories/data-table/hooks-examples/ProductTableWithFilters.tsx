'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../src/components/ui/table'
import { Button } from '../../../src/components/ui/button'
import { Input } from '../../../src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../src/components/ui/select'
import { Badge } from '../../../src/components/ui/badge'

// 产品数据类型
interface Product {
  id: string
  name: string
  category: 'electronics' | 'clothing' | 'food' | 'books'
  price: number
  stock: number
  rating: number
}

// 模拟产品数据
const products: Product[] = [
  {
    id: 'P001',
    name: 'Laptop Pro 15',
    category: 'electronics',
    price: 1299.99,
    stock: 45,
    rating: 4.5,
  },
  {
    id: 'P002',
    name: 'Wireless Mouse',
    category: 'electronics',
    price: 29.99,
    stock: 150,
    rating: 4.2,
  },
  {
    id: 'P003',
    name: 'Cotton T-Shirt',
    category: 'clothing',
    price: 19.99,
    stock: 200,
    rating: 4.0,
  },
  {
    id: 'P004',
    name: 'Organic Coffee Beans',
    category: 'food',
    price: 14.99,
    stock: 80,
    rating: 4.8,
  },
  {
    id: 'P005',
    name: 'Programming Guide',
    category: 'books',
    price: 39.99,
    stock: 30,
    rating: 4.7,
  },
  {
    id: 'P006',
    name: 'Running Shoes',
    category: 'clothing',
    price: 89.99,
    stock: 60,
    rating: 4.4,
  },
  {
    id: 'P007',
    name: 'USB-C Cable',
    category: 'electronics',
    price: 12.99,
    stock: 300,
    rating: 4.1,
  },
  {
    id: 'P008',
    name: 'Green Tea',
    category: 'food',
    price: 8.99,
    stock: 120,
    rating: 4.3,
  },
]

/**
 * 产品表格示例 - 带过滤和排序功能
 * 演示如何使用 useReactTable hook 实现过滤和排序
 */
export function ProductTableWithFilters() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  // 定义列
  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Product Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const category = row.getValue('category') as string
          const colors = {
            electronics: 'bg-blue-100 text-blue-800',
            clothing: 'bg-purple-100 text-purple-800',
            food: 'bg-green-100 text-green-800',
            books: 'bg-yellow-100 text-yellow-800',
          }
          return (
            <Badge
              variant="secondary"
              className={colors[category as keyof typeof colors]}
            >
              {category}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value === 'all' || row.getValue(id) === value
        },
      },
      {
        accessorKey: 'price',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Price
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const price = parseFloat(row.getValue('price'))
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(price)
          return <div className="font-medium">{formatted}</div>
        },
      },
      {
        accessorKey: 'stock',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Stock
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const stock = row.getValue('stock') as number
          return (
            <div className="flex items-center gap-2">
              <span>{stock}</span>
              {stock < 50 && (
                <Badge variant="destructive" className="text-xs">
                  Low
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'rating',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Rating
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const rating = row.getValue('rating') as number
          return (
            <div className="flex items-center gap-1">
              <span className="font-medium">{rating}</span>
              <span className="text-yellow-500">★</span>
            </div>
          )
        },
      },
    ],
    []
  )

  // 使用 useReactTable hook
  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Product Inventory</h3>
        <p className="text-muted-foreground text-sm">
          Product table with sorting and filtering using useReactTable hook
        </p>
      </div>

      {/* 过滤器 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={globalFilter ?? ''}
            onChange={event => setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={
            (table.getColumn('category')?.getFilterValue() as string) ?? 'all'
          }
          onValueChange={value =>
            table.getColumn('category')?.setFilterValue(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="books">Books</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                <TableRow key={row.id}>
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
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <div>
          Showing {table.getRowModel().rows.length} of {products.length}{' '}
          products
        </div>
        {sorting.length > 0 && (
          <div>
            Sorted by: {sorting[0].id} ({sorting[0].desc ? 'desc' : 'asc'})
          </div>
        )}
      </div>
    </div>
  )
}
