import type { Meta, StoryObj } from '@storybook/react'
import {
  Loading,
  LoadingOverlay,
  LoadingWrapper,
} from '../src/components/ui/loading'
import { Button } from '../src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../src/components/ui/card'
import { useState } from 'react'

const meta: Meta<typeof Loading> = {
  title: 'UI/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Loading>

/**
 * 默认的加载指示器
 */
export const Default: Story = {
  args: {},
}

/**
 * 带文本的加载指示器
 */
export const WithText: Story = {
  args: {
    text: '加载中...',
  },
}

/**
 * 不同尺寸
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <Loading size="sm" text="Small" />
      </div>
      <div className="text-center">
        <Loading size="md" text="Medium" />
      </div>
      <div className="text-center">
        <Loading size="lg" text="Large" />
      </div>
      <div className="text-center">
        <Loading size="xl" text="Extra Large" />
      </div>
    </div>
  ),
}

/**
 * 不同变体
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-12">
      <div className="text-center">
        <Loading variant="spinner" text="Spinner" />
      </div>
      <div className="text-center">
        <Loading variant="dots" text="Dots" />
      </div>
      <div className="text-center">
        <Loading variant="pulse" text="Pulse" />
      </div>
    </div>
  ),
}

/**
 * 自定义最小高度
 */
export const CustomMinHeight: Story = {
  args: {
    minHeight: 300,
    text: '加载中...',
  },
  decorators: [
    Story => (
      <div className="w-[600px] border rounded-lg">
        <Story />
      </div>
    ),
  ],
}

/**
 * 全屏加载
 */
export const Fullscreen: Story = {
  args: {
    fullscreen: true,
    text: '正在加载应用...',
    size: 'lg',
  },
  parameters: {
    layout: 'fullscreen',
  },
}

/**
 * LoadingOverlay 示例
 */
const OverlayExampleComponent = () => {
  const [loading, setLoading] = useState(false)

  const handleLoad = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="w-[600px] space-y-4">
      <Button onClick={handleLoad}>触发加载</Button>
      <LoadingOverlay loading={loading} text="处理中...">
        <Card>
          <CardHeader>
            <CardTitle>内容卡片</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              这是一些内容。点击上面的按钮会显示加载蒙层。
            </p>
            <p className="text-muted-foreground mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </CardContent>
        </Card>
      </LoadingOverlay>
    </div>
  )
}

export const OverlayExample: StoryObj<typeof LoadingOverlay> = {
  render: () => <OverlayExampleComponent />,
}

/**
 * LoadingOverlay 不带模糊
 */
const OverlayNoBlurComponent = () => {
  const [loading, setLoading] = useState(false)

  const handleLoad = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="w-[600px] space-y-4">
      <Button onClick={handleLoad}>触发加载</Button>
      <LoadingOverlay
        loading={loading}
        blur={false}
        opacity={0.5}
        text="处理中..."
      >
        <Card>
          <CardHeader>
            <CardTitle>内容卡片</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              这个示例没有模糊效果，只有半透明背景。
            </p>
          </CardContent>
        </Card>
      </LoadingOverlay>
    </div>
  )
}

export const OverlayNoBlur: StoryObj<typeof LoadingOverlay> = {
  render: () => <OverlayNoBlurComponent />,
}

/**
 * LoadingWrapper 示例
 */
const WrapperExampleComponent = () => {
  const [loading, setLoading] = useState(true)

  return (
    <div className="w-[600px] space-y-4">
      <Button onClick={() => setLoading(!loading)}>
        {loading ? '显示内容' : '显示加载'}
      </Button>
      <LoadingWrapper loading={loading} text="正在加载数据..." size="lg">
        <Card>
          <CardHeader>
            <CardTitle>数据内容</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              这是异步加载的内容。加载完成后才会显示。
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <div className="font-semibold">数据项 1</div>
                <div className="text-sm text-muted-foreground">详细信息</div>
              </div>
              <div className="border rounded p-4">
                <div className="font-semibold">数据项 2</div>
                <div className="text-sm text-muted-foreground">详细信息</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </LoadingWrapper>
    </div>
  )
}

export const WrapperExample: StoryObj<typeof LoadingWrapper> = {
  render: () => <WrapperExampleComponent />,
}

/**
 * 表格加载状态
 */
export const TableLoading: Story = {
  render: () => (
    <div className="w-[800px] border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left">名称</th>
            <th className="px-4 py-3 text-left">状态</th>
            <th className="px-4 py-3 text-left">日期</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3}>
              <Loading minHeight={200} text="正在加载表格数据..." />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
}

/**
 * 列表项加载
 */
export const ListItemLoading: Story = {
  render: () => (
    <div className="w-[600px] space-y-2">
      <div className="border rounded-lg p-4">
        <div className="font-semibold mb-2">已加载的项目 1</div>
        <div className="text-sm text-muted-foreground">这是已经加载的内容</div>
      </div>
      <div className="border rounded-lg p-4">
        <div className="font-semibold mb-2">已加载的项目 2</div>
        <div className="text-sm text-muted-foreground">这是已经加载的内容</div>
      </div>
      <div className="border rounded-lg p-4">
        <Loading size="sm" text="加载更多..." />
      </div>
    </div>
  ),
}

/**
 * 卡片网格加载
 */
export const CardGridLoading: Story = {
  render: () => (
    <div className="w-[800px] grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>卡片 1</CardTitle>
        </CardHeader>
        <CardContent>已加载内容</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>卡片 2</CardTitle>
        </CardHeader>
        <CardContent>已加载内容</CardContent>
      </Card>
      <Card className="flex items-center justify-center">
        <Loading size="sm" variant="spinner" />
      </Card>
    </div>
  ),
}
