import type { Meta, StoryObj } from '@storybook/react'

import { Ellipsis } from '../src/components/ui/ellipsis'

type EllipsisPosition = 'end' | 'middle'

type EllipsisStoryArgs = {
  children: string
  enableTooltip?: boolean
  position?: EllipsisPosition
  headLength?: number
  tailLength?: number
}

function buildMiddleEllipsis(
  text: string,
  headLength = 12,
  tailLength = 12
) {
  if (text.length <= headLength + tailLength + 1) {
    return text
  }

  return `${text.slice(0, headLength)}...${text.slice(-tailLength)}`
}

function renderEllipsis(args: EllipsisStoryArgs) {
  const {
    children,
    enableTooltip = true,
    position = 'end',
    headLength,
    tailLength,
  } = args

  const displayText =
    position === 'middle'
      ? buildMiddleEllipsis(children, headLength, tailLength)
      : children

  return <Ellipsis enableTooltip={enableTooltip}>{displayText}</Ellipsis>
}

const meta = {
  title: 'Components/Ellipsis',
  component: Ellipsis,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    enableTooltip: {
      control: { type: 'boolean' },
      description: '是否启用悬浮展示完整文案',
    },
    position: {
      control: { type: 'radio' },
      options: ['end', 'middle'],
      description: '省略号位置：end 表示尾部省略，middle 表示中间省略',
    },
    headLength: {
      control: { type: 'number', min: 1, step: 1 },
      description: '中间省略时，头部保留的字符数',
    },
    tailLength: {
      control: { type: 'number', min: 1, step: 1 },
      description: '中间省略时，尾部保留的字符数',
    },
  },
} satisfies Meta<EllipsisStoryArgs>

export default meta
type Story = StoryObj<EllipsisStoryArgs>

const longText =
  'This is a very long text that will be truncated with ellipsis when it exceeds the available container width'
const longChineseName =
  '这是一个非常非常长的中文文件名称，用来测试省略号的展示效果和鼠标悬浮时的完整文案显示'
const veryLongEmail =
  'very-long-email-address-with-many-characters-that-should-be-truncated@example.com'

export const Default: Story = {
  args: {
    children: longText,
    enableTooltip: true,
    position: 'end',
  },
  render: args => (
    <div className="w-64">
      {renderEllipsis(args)}
    </div>
  ),
}

export const ShortText: Story = {
  args: {
    children: 'Short text',
    position: 'end',
  },
  render: args => (
    <div className="w-64">
      {renderEllipsis(args)}
    </div>
  ),
}

export const ChineseName: Story = {
  args: {
    children: longChineseName,
    enableTooltip: true,
    position: 'end',
  },
  render: args => (
    <div className="w-80 space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          中文长名称 (尾部省略):
        </p>
        <div className="border border-dashed border-border rounded-md p-3 bg-muted/30">
          {renderEllipsis(args)}
        </div>
      </div>
    </div>
  ),
}

export const MiddleEllipsis: Story = {
  args: {
    children: veryLongEmail,
    position: 'middle',
    headLength: 12,
    tailLength: 15,
    enableTooltip: true,
  },
  render: args => (
    <div className="w-80 space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Email (中间省略):</p>
        <div className="border border-dashed border-border rounded-md p-3 bg-muted/30">
          {renderEllipsis(args)}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">完整内容:</p>
        <p className="text-sm bg-muted p-2 rounded break-all">
          {args.children}
        </p>
      </div>
    </div>
  ),
}

export const MiddleEllipsisFilename: Story = {
  args: {
    children:
      'object_oriented_software_engineering_a_use_case_driven_approach_1992.pdf',
    position: 'middle',
    headLength: 15,
    tailLength: 4,
    enableTooltip: true,
  },
  render: args => (
    <div className="w-80 space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">文件名 (中间省略):</p>
        <div className="border border-dashed border-border rounded-md p-3 bg-muted/30">
          {renderEllipsis(args)}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">完整内容:</p>
        <p className="text-sm bg-muted p-2 rounded break-all">
          {args.children}
        </p>
      </div>
    </div>
  ),
}

export const NoTooltip: Story = {
  args: {
    children: longText,
    enableTooltip: false,
    position: 'end',
  },
  render: args => (
    <div className="w-64 space-y-2">
      <p className="text-sm text-muted-foreground">
        未启用悬浮提示（鼠标悬浮无效果）:
      </p>
      {renderEllipsis(args)}
    </div>
  ),
}

export const FileNameExamples: Story = {
  args: {
    children: 'example.txt',
  },
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          短文件名 (容器 320px):
        </p>
        <div className="border border-dashed border-border rounded-md p-3 bg-muted/30">
          <Ellipsis>document.pdf</Ellipsis>
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          长文件名 (尾部省略，容器 320px):
        </p>
        <div className="w-80 border border-dashed border-border rounded-md p-3 bg-muted/30">
          {renderEllipsis({
            children: 'very_long_document_name_with_detailed_description_2024.pdf',
            position: 'end',
          })}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          长文件名 (中间省略，容器 320px):
        </p>
        <div className="w-80 border border-dashed border-border rounded-md p-3 bg-muted/30">
          {renderEllipsis({
            children: 'very_long_document_name_with_detailed_description_2024.pdf',
            position: 'middle',
            headLength: 15,
            tailLength: 4,
          })}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          中文长文件名 (尾部省略，容器 320px):
        </p>
        <div className="w-80 border border-dashed border-border rounded-md p-3 bg-muted/30">
          {renderEllipsis({
            children: '这是一个非常非常非常长的中文文件名称_2024_版本_1.docx',
            position: 'end',
          })}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          中文长文件名 (中间省略，容器 320px):
        </p>
        <div className="w-80 border border-dashed border-border rounded-md p-3 bg-muted/30">
          {renderEllipsis({
            children: '这是一个非常非常非常长的中文文件名称_2024_版本_1.docx',
            position: 'middle',
            headLength: 12,
            tailLength: 5,
          })}
        </div>
      </div>
    </div>
  ),
}

export const ResponsiveWidths: Story = {
  args: {
    children: longText,
  },
  render: () => (
    <div className="space-y-6">
      <p className="text-sm font-semibold">自适应不同容器宽度:</p>
      {[
        { width: '150px', label: '150px' },
        { width: '200px', label: '200px' },
        { width: '300px', label: '300px' },
        { width: '500px', label: '500px' },
        { width: '100%', label: '100% (完整)' },
      ].map(({ width, label }) => (
        <div key={width}>
          <p className="text-xs text-muted-foreground mb-1">{label}:</p>
          <div
            style={{ width }}
            className="border border-dashed border-border rounded-md p-3 bg-muted/30"
          >
            {renderEllipsis({ children: longText })}
          </div>
        </div>
      ))}
    </div>
  ),
}

export const MiddleEllipsisVariations: Story = {
  args: {
    children: veryLongEmail,
  },
  render: () => (
    <div className="w-96 space-y-3">
      <p className="text-sm font-semibold mb-4">
        中间省略的不同配置 (容器 320px):
      </p>
      {[
        { head: 5, tail: 5 },
        { head: 10, tail: 5 },
        { head: 5, tail: 10 },
        { head: 15, tail: 10 },
      ].map(({ head, tail }) => (
        <div key={`${head}-${tail}`}>
          <p className="text-xs text-muted-foreground mb-1">
            headLength={head}, tailLength={tail}:
          </p>
          <div className="border border-dashed border-border rounded-md p-3 bg-muted/30">
            {renderEllipsis({
              children: veryLongEmail,
              position: 'middle',
              headLength: head,
              tailLength: tail,
            })}
          </div>
        </div>
      ))}
    </div>
  ),
}
