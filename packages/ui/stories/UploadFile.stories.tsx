import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import {
  UploadFile,
  type UploadFileRenderProps,
} from '../src/components/upload-file'
import { Button } from '../src/components/ui/button'

const meta = {
  title: 'Components/UploadFile',
  component: UploadFile,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    maxFiles: {
      control: { type: 'number', min: 1, step: 1 },
    },
    showFileList: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof UploadFile>

export default meta
type Story = StoryObj<typeof meta>

const renderCustomFile = ({
  file,
  remove,
  disabled,
  checksum,
}: UploadFileRenderProps) => (
  <div className="flex w-full items-center justify-between gap-3">
    <div className="flex min-w-0 flex-col">
      <span className="truncate font-medium">{file.name}</span>
      <span className="text-muted-foreground text-xs">
        {`${(file.size / 1024).toFixed(1)} KB`}
      </span>
      {checksum && (
        <span className="truncate font-mono text-[10px] uppercase text-muted-foreground">
          {checksum}
        </span>
      )}
    </div>
    {!disabled && (
      <Button type="button" variant="outline" size="sm" onClick={remove}>
        删除
      </Button>
    )}
  </div>
)

export const Default: Story = {
  args: {
    accept: { 'image/*': [] },
    helper: '支持 PNG、JPG、WEBP，单个文件不超过 5MB。',
    maxFiles: 3,
    enableChecksum: true,
  },
}

export const Controlled: Story = {
  args: {
    accept: { 'image/*': [] },
    maxFiles: 2,
    maxSize: 5 * 1024 * 1024, // 5MB
    helper: '仅支持 image 文件，最多上传 2 个。',
    enableChecksum: true,
  },
  render: args => {
    const [files, setFiles] = React.useState<File[]>([])

    return (
      <UploadFile
        {...args}
        value={files}
        onChange={setFiles}
        helper={
          files.length > 0 ? `当前已选择 ${files.length} 个文件` : args.helper
        }
      />
    )
  },
}

export const CustomRender: Story = {
  args: {
    accept: { 'text/plain': [] },
    maxFiles: 5,
    helper: '列表项使用自定义渲染。',
    renderFile: renderCustomFile,
    enableChecksum: true,
  },
  render: args => {
    const [files, setFiles] = React.useState<File[]>([])
    return <UploadFile {...args} value={files} onChange={setFiles} />
  },
}

export const LongFileName: Story = {
  args: {
    maxFiles: 10,
    helper: '测试长文件名的显示效果',
    maxSize: 50 * 1024 * 1024,
  },
  render: function LongFileNameRender(args) {
    const [files, setFiles] = React.useState<File[]>([])

    React.useEffect(() => {
      // 创建模拟的长文件名文件
      const mockFiles = [
        new File(['content1'], 'short.txt', { type: 'text/plain' }),
        new File(
          ['content2'],
          'long name test long name test long name test long name test long name test long name test long name test long name test long name test.txt',
          { type: 'text/plain' }
        ),
        new File(
          ['contentd'],
          'object_oriented_software_engineering_a_use_case_driven_approach(1992)_1to5.txt',
          { type: 'text/plain' }
        ),
        new File(
          ['content3'],
          'very-long-file-name-with-many-dashes-and-characters-that-should-be-truncated-properly-in-the-UI-component.pdf',
          { type: 'application/pdf' }
        ),
        new File(
          ['content2'],
          'long name test long name test long name test long name test long name test long name test long name test long name test long name test.txt',
          { type: 'text/plain' }
        ),
        new File(
          ['content3'],
          'very-long-file-name-with-many-dashes-and-characters-that-should-be-truncated-properly-in-the-UI-component.pdf',
          { type: 'application/pdf' }
        ),
        new File(
          ['content2'],
          'long name test long name test long name test long name test long name test long name test long name test long name test long name test.txt',
          { type: 'text/plain' }
        ),
        new File(
          ['content3'],
          'very-long-file-name-with-many-dashes-and-characters-that-should-be-truncated-properly-in-the-UI-component.pdf',
          { type: 'application/pdf' }
        ),
        new File(
          ['content4'],
          '这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的中文文件名.docx',
          {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }
        ),
      ]
      setFiles(mockFiles)
    }, [])

    return (
      <UploadFile
        {...args}
        disabled={false}
        loading={false}
        value={files}
        onChange={setFiles}
      />
    )
  },
}
