import type { Meta, StoryObj } from '@storybook/react'
import type { ColumnDef } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { ArrowUpDown, Search } from 'lucide-react'
import {
  useDataTable,
  DataTablePagination,
} from '../../src/components/data-table'
import { Badge } from '../../src/components/ui/badge'
import { Button } from '../../src/components/ui/button'
import { Checkbox } from '../../src/components/ui/checkbox'
import { Input } from '../../src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../src/components/ui/table'

const meta = {
  title: 'Data Table/useDataTable Hook',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# useDataTable 精简示例

一个故事覆盖搜索、排序、选择、分页，展示如何用 hook 自定义表格 UI。复制后可按需增删控件。
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

const products: Product[] = [
  {
    id: 'P001',
    name: 'Laptop Pro 15',
    category: 'Electronics',
    price: 1299.99,
    stock: 45,
  },
  {
    id: 'P002',
    name: 'Wireless Mouse',
    category: 'Electronics',
    price: 29.99,
    stock: 150,
  },
  {
    id: 'P003',
    name: 'Cotton T-Shirt',
    category: 'Clothing',
    price: 19.99,
    stock: 200,
  },
  {
    id: 'P004',
    name: 'Running Shoes',
    category: 'Clothing',
    price: 89.99,
    stock: 60,
  },
  {
    id: 'P005',
    name: 'Coffee Beans',
    category: 'Food',
    price: 14.99,
    stock: 80,
  },
  { id: 'P006', name: 'Green Tea', category: 'Food', price: 8.99, stock: 120 },
  {
    id: 'P007',
    name: 'USB-C Cable',
    category: 'Electronics',
    price: 12.99,
    stock: 300,
  },
]

const columns: ColumnDef<Product>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Product
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price)
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number
      return (
        <div className="flex items-center gap-2">
          <span>{stock}</span>
          {stock < 50 && <Badge variant="destructive">Low</Badge>}
        </div>
      )
    },
  },
]

const CustomTable = () => {
  const {
    table,
    globalFilter,
    setGlobalFilter,
    selectedRowCount,
    resetSelection,
  } = useDataTable({
    data: products,
    columns,
    enableFiltering: true,
    enableSorting: true,
    enablePagination: true,
    enableRowSelection: true,
    pageSize: 4,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72 max-w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={globalFilter}
            placeholder="Search products..."
            onChange={event => setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>

        {selectedRowCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">已选 {selectedRowCount}</Badge>
            <Button variant="ghost" size="sm" onClick={resetSelection}>
              清空
            </Button>
          </div>
        )}
      </div>

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
            {table.getRowModel().rows.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}

export const CustomLayout: Story = {
  render: () => (
    <div className="w-full p-6">
      <CustomTable />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '单个故事覆盖常用功能：搜索、排序、分页、行选择，方便复制到业务。',
      },
    },
  },
}
