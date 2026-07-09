import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { Descendant } from 'slate'
import { SlateEditor } from '../src/components/rich-editor/rich-editor'

const meta = {
  title: 'RichEditor/RichEditor',
  component: SlateEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SlateEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[640px]">
      <SlateEditor />
    </div>
  ),
}

const initialContentTemplate: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: '这是一个示例内容，带有 ' },
      { text: '加粗', bold: true },
      { text: ' 和 ' },
      { text: '斜体', italic: true },
      { text: ' 效果。' },
    ],
  },
]

const getInitialContent = (): Descendant[] =>
  JSON.parse(JSON.stringify(initialContentTemplate))

export const WithInitialContent: Story = {
  render: () => (
    <div className="w-[640px]">
      <SlateEditor defaultValue={getInitialContent()} />
    </div>
  ),
}

const WithSaveHandlerExample = () => {
  const [savedContent, setSavedContent] = useState<Descendant[]>([])

  return (
    <div className="w-[640px] space-y-4">
      <SlateEditor onSave={setSavedContent} />
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
        <div className="text-sm font-medium text-gray-700">Saved content</div>
        <pre className="mt-2 max-h-[200px] overflow-auto text-xs text-gray-600">
          {JSON.stringify(savedContent, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const WithSaveHandler: Story = {
  render: () => <WithSaveHandlerExample />,
}

export const WithCustomClassName: Story = {
  render: () => (
    <div className="w-[800px]">
      <SlateEditor className="shadow-lg" />
    </div>
  ),
}

export const ResponsiveWidth: Story = {
  render: () => (
    <div className="w-full max-w-[1200px]">
      <SlateEditor className="w-full" />
      <p className="mt-4 text-sm text-gray-600">
        编辑器会响应容器宽度，内容不会无限变宽
      </p>
    </div>
  ),
}

export const WithMaxLength: Story = {
  render: () => (
    <div className="w-[640px]">
      <SlateEditor maxLength={100} placeholder="最多输入100个字符..." />
    </div>
  ),
}

export const WithCharacterCount: Story = {
  render: () => (
    <div className="w-[640px] space-y-4">
      <SlateEditor
        maxLength={200}
        defaultValue={getInitialContent()}
        placeholder="最多输入200个字符..."
      />
      <p className="text-sm text-gray-600">
        当接近字数限制时，字数会变为橙色；超出限制将阻止输入
      </p>
    </div>
  ),
}

export const OnlyShowCount: Story = {
  render: () => (
    <div className="w-[640px]">
      <SlateEditor
        showCharacterCount={true}
        placeholder="仅显示字数统计，无限制..."
      />
    </div>
  ),
}
