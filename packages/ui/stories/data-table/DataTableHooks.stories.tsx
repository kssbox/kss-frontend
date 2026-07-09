import type { Meta, StoryObj } from '@storybook/react'
import { ProductTableWithFilters } from './hooks-examples/ProductTableWithFilters'
import { TaskTableWithSelection } from './hooks-examples/TaskTableWithSelection'
import { AdvancedTableWithCustomHook } from './hooks-examples/AdvancedTableWithCustomHook'

const meta = {
  title: 'Data Table/Hooks Examples',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Data Table Hooks Examples

这些示例展示了如何使用 @tanstack/react-table 的 hooks 方式创建各种功能的表格。

## 示例列表

1. **Product Table With Filters** - 带过滤和排序功能
2. **Task Table With Selection** - 带行选择和批量操作
3. **Advanced Table With Custom Hook** - 使用自定义 hook 的完整功能表格

所有代码都在 \`stories/data-table/hooks-examples/\` 目录中，可以直接复制使用。
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * 产品表格，展示过滤和排序功能。
 *
 * 特性：
 * - 全局搜索
 * - 下拉菜单分类过滤
 * - 点击表头排序
 * - 货币格式化
 * - 库存提醒
 */
export const ProductWithFilters: Story = {
  render: () => (
    <div className="w-full p-6">
      <ProductTableWithFilters />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '带有全局搜索、列过滤和排序功能的产品表格。',
      },
    },
  },
}

/**
 * 任务管理表格，展示行选择和批量操作。
 *
 * 特性：
 * - 单选/全选
 * - 批量删除
 * - 批量更新状态
 * - 行操作菜单
 * - 动态数据更新
 */
export const TaskWithSelection: Story = {
  render: () => (
    <div className="w-full p-6">
      <TaskTableWithSelection />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '支持行选择和批量操作的任务管理表格，可以批量删除或更新任务状态。',
      },
    },
  },
}

/**
 * 高级表格，使用自定义 useDataTable hook。
 *
 * 特性：
 * - 所有功能集成（过滤、排序、分页、行选择）
 * - 简化的 API
 * - 分页控件
 * - 导出功能
 * - 更少的样板代码
 */
export const AdvancedWithCustomHook: Story = {
  render: () => (
    <div className="w-full p-6">
      <AdvancedTableWithCustomHook />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '使用自定义 useDataTable hook 的完整功能表格，代码更简洁易维护。查看 `hooks-examples/useDataTable.ts` 了解 hook 实现。',
      },
    },
  },
}
