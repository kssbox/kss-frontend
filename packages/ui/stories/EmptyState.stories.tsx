import type { Meta, StoryObj } from '@storybook/react'
import { ArrowRight, FileUp, Globe, Upload, Plus } from 'lucide-react'
import { EmptyState } from '../src/components/empty-state/empty-state'

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'animated'],
      description: '样式变体：default 为朴素样式，animated 为动画样式',
    },
    icon: {
      description: '自定义图标组件',
    },
    helperText: {
      control: 'text',
      description: '辅助文本',
    },
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <EmptyState
      title="暂无数据"
      description="当前没有可展示的内容，请稍后再试。"
      buttonText="刷新列表"
    />
  ),
}

export const WithIllustration: Story = {
  render: () => (
    <EmptyState
      image="https://illustrations.popsy.co/gray/sitting.svg"
      imageAlt="空状态插画"
      imageWidth={220}
      imageHeight={180}
      title="还没有任何内容"
      description="尝试添加一个新的项目，或检查您的筛选条件。"
      buttonText="新建项目"
    />
  ),
}

export const CustomAction: Story = {
  render: () => (
    <EmptyState
      title="没有匹配的结果"
      description="调整筛选条件或创建一个新的条目来开始。"
      buttonText="创建条目"
      buttonIcon={<ArrowRight className="h-4 w-4" />}
      className="bg-muted rounded-lg p-10"
    />
  ),
}

export const WithoutButton: Story = {
  render: () => (
    <EmptyState
      title="等待数据"
      description="系统正在准备必要的信息，请耐心等候。"
      showButton={false}
    />
  ),
}

export const WithIcon: Story = {
  render: () => (
    <EmptyState
      title="文件上传"
      description="选择要上传的文件，支持多种格式。"
      buttonText="选择文件"
      buttonIcon={<Upload className="h-4 w-4" />}
      icon={<FileUp className="w-12 h-12 text-blue-600" strokeWidth={1.5} />}
    />
  ),
}

export const AnimatedVariant: Story = {
  render: () => (
    <EmptyState
      title="网页数据"
      description="抓取或添加内容，AI 助手可以使用这些内容来回答客户的查询。"
      buttonText="添加内容"
      buttonIcon={<Plus className="h-4 w-4" />}
      icon={<Globe className="w-12 h-12 text-violet-600" strokeWidth={1.5} />}
      variant="animated"
    />
  ),
}

export const WithHelperText: Story = {
  render: () => (
    <EmptyState
      title="数据同步中"
      description="正在从服务器同步最新数据，请稍候。"
      buttonText="手动同步"
      helperText="支持 PDF, Markdown, TXT 或 HTML 链接"
      showButton={false}
    />
  ),
}

export const Minimal: Story = {
  render: () => (
    <EmptyState title="暂无内容" description="这里还没有任何数据。" />
  ),
}

export const Compact: Story = {
  render: () => (
    <div className="border rounded-md" style={{ width: 600 }}>
      <EmptyState
        size="compact"
        title="暂无数据"
        description="当前列表没有可展示的内容。"
        showButton={false}
      />
    </div>
  ),
}
