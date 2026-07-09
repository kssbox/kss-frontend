import type { Meta, StoryObj } from '@storybook/react'
import { SelectionBar } from '../src/components/selection-bar'
import { Button } from '../src/components/ui'
import { Trash2, Download, Copy } from 'lucide-react'

const meta = {
  title: 'Components/SelectionBar',
  component: SelectionBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: 'number',
      description: 'Number of selected items',
    },
    visible: {
      control: 'boolean',
      description: 'Whether the selection bar is visible',
    },
    countLabel: {
      control: 'text',
      description: 'Custom label for the count display',
    },
    useAnchor: {
      control: 'boolean',
      description: 'Whether to use anchor positioning',
    },
  },
} satisfies Meta<typeof SelectionBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    count: 3,
    visible: true,
    countLabel: '个已选中',
    useAnchor: false,
    actions: (
      <>
        <Button variant="outline" size="sm">
          <Copy className="mr-2 h-4 w-4" />
          复制
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          导出
        </Button>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
      </>
    ),
  },
  render: args => (
    <div className="h-screen bg-gray-100 p-8">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">数据列表</h2>
        <p className="text-muted-foreground">
          选择列表中的项目以查看选择栏。滚动到页面底部查看固定定位的选择栏。
        </p>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="rounded border border-gray-200 bg-gray-50 p-3"
            >
              项目 {i + 1}
            </div>
          ))}
        </div>
      </div>
      <SelectionBar {...args} />
    </div>
  ),
}

export const SingleItem: Story = {
  args: {
    count: 1,
    visible: true,
    countLabel: '个已选中',
    useAnchor: false,
    actions: (
      <>
        <Button variant="outline" size="sm">
          编辑
        </Button>
        <Button variant="destructive" size="sm">
          删除
        </Button>
      </>
    ),
  },
  render: args => (
    <div className="h-screen bg-gray-100 p-8">
      <SelectionBar {...args} />
    </div>
  ),
}

export const ManyItems: Story = {
  args: {
    count: 156,
    visible: true,
    countLabel: '个已选中',
    useAnchor: false,
    actions: (
      <>
        <Button variant="outline" size="sm">
          批量编辑
        </Button>
        <Button variant="outline" size="sm">
          导出选中项
        </Button>
        <Button variant="destructive" size="sm">
          批量删除
        </Button>
      </>
    ),
  },
  render: args => (
    <div className="h-screen bg-gray-100 p-8">
      <SelectionBar {...args} />
    </div>
  ),
}

export const WithAnchor: Story = {
  args: {
    count: 5,
    visible: true,
    countLabel: '个已选中',
    useAnchor: true,
    actions: (
      <>
        <Button variant="outline" size="sm">
          操作
        </Button>
        <Button variant="destructive" size="sm">
          删除
        </Button>
      </>
    ),
  },
  render: args => (
    <div className="h-screen bg-gray-100 p-8">
      <div
        data-selection-anchor
        className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-semibold">带锚点定位的表格</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          选择栏将与这个容器对齐（因为它有 data-selection-anchor 属性）
        </p>
        <div className="space-y-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="rounded border border-gray-200 bg-gray-50 p-3"
            >
              表格行 {i + 1}
            </div>
          ))}
        </div>
      </div>
      <SelectionBar {...args} />
    </div>
  ),
}

export const CustomLabel: Story = {
  args: {
    count: 10,
    visible: true,
    countLabel: 'items selected',
    useAnchor: false,
    actions: (
      <>
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </>
    ),
  },
  render: args => (
    <div className="h-screen bg-gray-100 p-8">
      <SelectionBar {...args} />
    </div>
  ),
}

export const NoActions: Story = {
  args: {
    count: 7,
    visible: true,
    countLabel: '个已选中',
    useAnchor: false,
  },
  render: args => (
    <div className="h-screen bg-gray-100 p-8">
      <SelectionBar {...args} />
    </div>
  ),
}

export const Hidden: Story = {
  args: {
    count: 0,
    visible: false,
    countLabel: '个已选中',
    useAnchor: false,
    actions: (
      <Button variant="destructive" size="sm">
        删除
      </Button>
    ),
  },
  render: args => (
    <div className="h-screen bg-gray-100 p-8">
      <p className="text-center text-muted-foreground">
        选择栏已隐藏（count=0 或 visible=false）
      </p>
      <SelectionBar {...args} />
    </div>
  ),
}
