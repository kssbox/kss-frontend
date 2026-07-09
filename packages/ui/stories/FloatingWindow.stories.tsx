import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FloatingWindow, FloatingActionButton } from '../src/components/floating-window'
import { MessageCircleIcon, XIcon, PlusIcon, HelpCircleIcon } from 'lucide-react'

const meta = {
  title: 'Components/FloatingWindow',
  component: FloatingWindow,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FloatingWindow>

export default meta
type Story = StoryObj<typeof meta>

const positions = {
  bottomRight: { bottom: 24, right: 24 },
  bottomLeft: { bottom: 24, left: 24 },
  topRight: { top: 24, right: 24 },
  topLeft: { top: 24, left: 24 },
} as const

export const Default: Story = {
  render: () => (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Floating Window Example</h1>
      <p className="mb-8 text-muted-foreground">
        浮窗按钮显示在右下角，点击可以查看效果
      </p>
      <FloatingWindow>
        <MessageCircleIcon className="size-6" />
      </FloatingWindow>
    </div>
  ),
}

export const BottomRight: Story = {
  render: () => (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">右下角浮窗</h1>
      <FloatingWindow position={positions.bottomRight}>
        <MessageCircleIcon className="size-6" />
      </FloatingWindow>
    </div>
  ),
}

export const BottomLeft: Story = {
  render: () => (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">左下角浮窗</h1>
      <FloatingWindow position={positions.bottomLeft}>
        <PlusIcon className="size-6" />
      </FloatingWindow>
    </div>
  ),
}

export const TopRight: Story = {
  render: () => (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">右上角浮窗</h1>
      <FloatingWindow position={positions.topRight}>
        <HelpCircleIcon className="size-6" />
      </FloatingWindow>
    </div>
  ),
}

export const TopLeft: Story = {
  render: () => (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">左上角浮窗</h1>
      <FloatingWindow position={positions.topLeft}>
        <XIcon className="size-6" />
      </FloatingWindow>
    </div>
  ),
}

export const CustomStyle: Story = {
  render: () => (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">自定义样式</h1>
      <div className="space-y-4">
        <FloatingWindow className="bg-purple-600 hover:bg-purple-700">
          <MessageCircleIcon className="size-6" />
        </FloatingWindow>
        <FloatingWindow
          position={positions.bottomLeft}
          className="bg-gradient-to-r from-pink-500 to-orange-500"
        >
          <PlusIcon className="size-6" />
        </FloatingWindow>
      </div>
    </div>
  ),
}

export const ActionButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    const handleToggle = (newState: boolean) => {
      setIsOpen(newState)
    }
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">浮动操作按钮</h1>
        <p className="mb-4 text-muted-foreground">
          点击按钮可以切换图标状态 (当前状态: {isOpen ? '打开' : '关闭'})
        </p>
        <FloatingActionButton onToggle={handleToggle} />
      </div>
    )
  },
}

export const MultipleButtons: Story = {
  render: () => (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">多个浮窗按钮</h1>
      <FloatingWindow position={positions.bottomRight} className="bg-blue-600">
        <MessageCircleIcon className="size-6" />
      </FloatingWindow>
      <FloatingWindow position={positions.bottomLeft} className="bg-green-600">
        <PlusIcon className="size-6" />
      </FloatingWindow>
      <FloatingWindow position={positions.topRight} className="bg-orange-600">
        <HelpCircleIcon className="size-6" />
      </FloatingWindow>
      <FloatingWindow position={positions.topLeft} className="bg-purple-600">
        <XIcon className="size-6" />
      </FloatingWindow>
    </div>
  ),
}

export const WithContent: Story = {
  render: () => (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">带内容的页面</h1>
      <div className="max-w-2xl space-y-4">
        <p className="text-muted-foreground">
          这是一个示例页面内容，浮窗按钮会显示在右下角。
        </p>
        <div className="rounded-lg border bg-muted/50 p-6">
          <h2 className="mb-2 text-xl font-semibold">内容区域</h2>
          <p className="text-muted-foreground">
            你可以在这里放置任何内容，浮窗按钮会一直保持在屏幕上的固定位置。
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/50 p-6">
            <h3 className="mb-2 text-lg font-semibold">卡片 1</h3>
            <p className="text-sm text-muted-foreground">
              浮窗按钮不会影响页面布局。
            </p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-6">
            <h3 className="mb-2 text-lg font-semibold">卡片 2</h3>
            <p className="text-sm text-muted-foreground">
              它使用固定定位，始终可见。
            </p>
          </div>
        </div>
      </div>
      <FloatingWindow>
        <MessageCircleIcon className="size-6" />
      </FloatingWindow>
    </div>
  ),
}
