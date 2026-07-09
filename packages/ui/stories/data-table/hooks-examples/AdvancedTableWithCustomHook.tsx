'use client'

import * as React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '../../../src/components/ui/button'
import { Checkbox } from '../../../src/components/ui/checkbox'
import { Badge } from '../../../src/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../src/components/ui/select'
import { DataTableHooks } from '../../../src/components/data-table'

// 员工数据类型
interface Employee {
  id: string
  name: string
  email: string
  department: 'Engineering' | 'Design' | 'Marketing' | 'Sales' | 'HR'
  position: string
  salary: number
  joinDate: string
  status: 'active' | 'on-leave' | 'resigned'
}

// 模拟员工数据
const employees: Employee[] = [
  {
    id: 'E001',
    name: 'John Doe',
    email: 'john@company.com',
    department: 'Engineering',
    position: 'Senior Engineer',
    salary: 120000,
    joinDate: '2022-01-15',
    status: 'active',
  },
  {
    id: 'E002',
    name: 'Jane Smith',
    email: 'jane@company.com',
    department: 'Design',
    position: 'Lead Designer',
    salary: 110000,
    joinDate: '2021-06-20',
    status: 'active',
  },
  {
    id: 'E003',
    name: 'Bob Johnson',
    email: 'bob@company.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 95000,
    joinDate: '2023-03-10',
    status: 'active',
  },
  {
    id: 'E004',
    name: 'Alice Williams',
    email: 'alice@company.com',
    department: 'Engineering',
    position: 'Junior Engineer',
    salary: 75000,
    joinDate: '2023-09-01',
    status: 'active',
  },
  {
    id: 'E005',
    name: 'Charlie Brown',
    email: 'charlie@company.com',
    department: 'Sales',
    position: 'Sales Representative',
    salary: 65000,
    joinDate: '2022-11-15',
    status: 'on-leave',
  },
  {
    id: 'E006',
    name: 'Diana Prince',
    email: 'diana@company.com',
    department: 'HR',
    position: 'HR Manager',
    salary: 90000,
    joinDate: '2021-02-28',
    status: 'active',
  },
  {
    id: 'E007',
    name: 'Eve Wilson',
    email: 'eve@company.com',
    department: 'Engineering',
    position: 'Staff Engineer',
    salary: 140000,
    joinDate: '2020-05-12',
    status: 'active',
  },
  {
    id: 'E008',
    name: 'Frank Miller',
    email: 'frank@company.com',
    department: 'Design',
    position: 'UI Designer',
    salary: 85000,
    joinDate: '2022-08-20',
    status: 'resigned',
  },
  {
    id: 'E009',
    name: 'Grace Lee',
    email: 'grace@company.com',
    department: 'Marketing',
    position: 'Content Writer',
    salary: 60000,
    joinDate: '2023-04-05',
    status: 'active',
  },
  {
    id: 'E010',
    name: 'Henry Davis',
    email: 'henry@company.com',
    department: 'Sales',
    position: 'Sales Manager',
    salary: 105000,
    joinDate: '2021-10-18',
    status: 'active',
  },
]

/**
 * 高级表格示例 - 使用 DataTableHooks 组件
 * 展示如何使用封装好的组件快速开发表格
 */
export function AdvancedTableWithCustomHook() {
  const [selectedEmployees, setSelectedEmployees] = React.useState<Employee[]>([])
  const [departmentFilter, setDepartmentFilter] = React.useState<string>('all')
  // 定义列
  const columns = React.useMemo<ColumnDef<Employee>[]>(
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
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue('name')}</div>
            <div className="text-muted-foreground text-sm">
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => {
          const department = row.getValue('department') as string
          const colors = {
            Engineering: 'bg-blue-100 text-blue-800',
            Design: 'bg-purple-100 text-purple-800',
            Marketing: 'bg-green-100 text-green-800',
            Sales: 'bg-yellow-100 text-yellow-800',
            HR: 'bg-pink-100 text-pink-800',
          }
          return (
            <Badge
              variant="secondary"
              className={colors[department as keyof typeof colors]}
            >
              {department}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'position',
        header: 'Position',
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue('position')}</span>
        ),
      },
      {
        accessorKey: 'salary',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Salary
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const salary = parseFloat(row.getValue('salary'))
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(salary)
          return <div className="font-medium">{formatted}</div>
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          const variants = {
            active: 'bg-green-100 text-green-800',
            'on-leave': 'bg-yellow-100 text-yellow-800',
            resigned: 'bg-gray-100 text-gray-800',
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
    ],
    []
  )

  // 过滤数据
  const filteredEmployees = React.useMemo(() => {
    if (departmentFilter === 'all') return employees
    return employees.filter(emp => emp.department === departmentFilter)
  }, [departmentFilter])

  // 处理导出
  const handleExport = React.useCallback(() => {
    console.log('Exporting employees:', selectedEmployees)
    alert(`Exporting ${selectedEmployees.length} employee(s)`)
  }, [selectedEmployees])

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Employee Management</h3>
        <p className="text-muted-foreground text-sm">
          Advanced table using DataTableHooks component with custom filters
        </p>
      </div>

      {/* 自定义部门过滤器 */}
      <div className="flex items-center gap-4">
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
          </SelectContent>
        </Select>
        {departmentFilter !== 'all' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDepartmentFilter('all')}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* 使用 DataTableHooks 组件 */}
      <DataTableHooks
        data={filteredEmployees}
        columns={columns}
        enableRowSelection
        enableFiltering
        enableSorting
        enablePagination
        pageSize={5}
        searchPlaceholder="Search employees..."
        onRowSelectionChange={setSelectedEmployees}
        toolbarContent={
          selectedEmployees.length > 0 && (
            <Button onClick={handleExport} size="sm">
              Export {selectedEmployees.length} selected
            </Button>
          )
        }
      />
    </div>
  )
}
