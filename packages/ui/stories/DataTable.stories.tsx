import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, DataTableSkeleton } from '../src/components'
import type { Task } from './data-table/types'
import { tasks, projects } from './data-table/mock-data'
import { defaultColumns, projectColumns } from './data-table/columns'
import { DataTableWithActions } from './data-table/DataTableWithActions'
import { DataTableToolbarShowcase } from './data-table/DataTableToolbarShowcase'
import { BizTable } from './data-table/BizTable'
import {
  ScrollableTable,
  ScrollableTableWithViewportHeight,
  ScrollableTableWithPagination,
} from './data-table/ScrollableTable'

const meta = {
  title: 'Data Table/Components Table',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DataTable<Task, unknown>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { columns: [], data: [] },
  render: () => <BizTable />,
}

export const EASY: Story = {
  args: { columns: [], data: [] },
  render: () => <DataTable columns={defaultColumns} data={tasks} />,
}

export const AdvancedFilters: Story = {
  args: { columns: [], data: [] },
  render: () => (
    <DataTable
      columns={projectColumns}
      data={projects}
      viewOptions
      filterOptions
    />
  ),
}

export const WithActions: Story = {
  args: { columns: [], data: [] },
  render: () => <DataTableWithActions />,
}

export const ToolkitPieces: Story = {
  args: { columns: [], data: [] },
  render: () => <DataTableToolbarShowcase />,
}

export const EmptyData: Story = {
  args: { columns: [], data: [] },
  render: () => <DataTable columns={defaultColumns} data={[]} />,
  parameters: {
    docs: {
      description: {
        story: '表格没有数据时的空状态展示，使用 EmptyState compact 样式。',
      },
    },
  },
}

export const LoadingState: Story = {
  args: { columns: [], data: [] },
  render: () => (
    <div className="max-w-5xl">
      <DataTableSkeleton columnCount={5} filterCount={4} />
    </div>
  ),
}

export const ScrollableWithFixedHeader: Story = {
  args: { columns: [], data: [] },
  render: () => <ScrollableTable />,
  parameters: {
    docs: {
      description: {
        story:
          '展示固定表头和垂直滚动功能。表格包含 100 行数据，最大高度限制为 500px。向下滚动时表头保持固定在顶部。',
      },
    },
  },
}

export const ScrollableWithViewportHeight: Story = {
  args: { columns: [], data: [] },
  render: () => <ScrollableTableWithViewportHeight />,
  parameters: {
    docs: {
      description: {
        story:
          '使用响应式视口高度（60vh）的滚动表格。包含 150 行数据，表格高度会根据浏览器窗口大小自动调整。',
      },
    },
  },
}

export const ScrollableWithPagination: Story = {
  args: { columns: [], data: [] },
  render: () => <ScrollableTableWithPagination />,
  parameters: {
    docs: {
      description: {
        story:
          '结合分页功能的滚动表格。包含 200 行数据，每页显示 50 条，表格高度限制为 400px。支持排序、搜索和分页功能。',
      },
    },
  },
}
