import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import { UploadFileModal } from '../src/components/upload-file'
import { Button } from '../src/components/ui/button'

const meta = {
  title: 'Components/UploadFileModal',
  component: UploadFileModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '通用文件上传 Modal 组件，封装了文件上传的完整流程。',
      },
    },
  },
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: '控制 Modal 的显示/隐藏',
    },
    title: {
      control: { type: 'text' },
      description: 'Modal 标题',
    },
    successMessage: {
      control: { type: 'text' },
      description: '上传成功提示文案',
    },
    emptyMessage: {
      control: { type: 'text' },
      description: '未选择文件时的提示文案',
    },
    uploadFileProps: {
      control: { type: 'object' },
      description: 'UploadFile 组件的配置属性',
    },
  },
} satisfies Meta<typeof UploadFileModal>

export default meta
type Story = StoryObj<typeof meta>

// 模拟上传函数
const mockUpload = async (files: File[], checksums: string[]) => {
  console.log('Mock upload:', { files, checksums })
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  // 模拟成功
  return Promise.resolve()
}

// 模拟上传失败的函数
const mockUploadFailure = async (files: File[], checksums: string[]) => {
  console.log('Mock upload failure:', { files, checksums })
  await new Promise(resolve => setTimeout(resolve, 1000))
  throw new Error('Upload failed')
}

export const Default: Story = {
  args: {
    open: false,
    onClose: () => { },
    title: '上传文件',
    successMessage: '文件上传成功',
    emptyMessage: '请先选择文件',
    onUpload: mockUpload,
    uploadFileProps: {
      maxFiles: 5,
      maxSize: 10 * 1024 * 1024, // 10MB
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        'application/pdf': ['.pdf'],
        'text/plain': ['.txt'],
      },
    },
  },
  render: function DefaultRender(args) {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setOpen(true)}>打开上传 Modal</Button>
        <UploadFileModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            console.log('Upload success callback')
          }}
        />
      </div>
    )
  },
}

export const WithSuccessCallback: Story = {
  args: {
    open: false,
    onClose: () => { },
    title: '上传文件',
    successMessage: '文件上传成功！',
    onUpload: mockUpload,
    uploadFileProps: {
      maxFiles: 3,
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: { 'image/*': ['.png', '.jpg'] },
    },
  },
  render: function WithSuccessCallbackRender(args) {
    const [open, setOpen] = React.useState(false)
    const [uploadCount, setUploadCount] = React.useState(0)

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          上传次数: {uploadCount}
        </div>
        <Button onClick={() => setOpen(true)}>打开上传 Modal</Button>
        <UploadFileModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setUploadCount(prev => prev + 1)
            console.log('Upload completed successfully!')
          }}
        />
      </div>
    )
  },
}

export const WithUploadFailure: Story = {
  args: {
    open: false,
    onClose: () => { },
    title: '上传文件（模拟失败）',
    successMessage: '文件上传成功',
    emptyMessage: '请先选择文件',
    onUpload: mockUploadFailure,
    uploadFileProps: {
      maxFiles: 2,
      maxSize: 2 * 1024 * 1024, // 2MB
      accept: { 'text/plain': ['.txt'] },
    },
  },
  render: function WithUploadFailureRender(args) {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          这个示例会模拟上传失败的情况
        </div>
        <Button onClick={() => setOpen(true)}>打开上传 Modal（会失败）</Button>
        <UploadFileModal {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
}

export const LargeFileUpload: Story = {
  args: {
    open: false,
    onClose: () => { },
    title: '上传大文件',
    successMessage: '大文件上传成功',
    onUpload: mockUpload,
    uploadFileProps: {
      maxFiles: 1,
      maxSize: 100 * 1024 * 1024, // 100MB
      accept: {
        'video/*': ['.mp4', '.avi', '.mov'],
        'application/zip': ['.zip'],
      },
    },
  },
  render: function LargeFileUploadRender(args) {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          支持上传大文件（最大 100MB）
        </div>
        <Button onClick={() => setOpen(true)}>上传大文件</Button>
        <UploadFileModal {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
}

export const MultipleFileTypes: Story = {
  args: {
    open: false,
    onClose: () => { },
    title: '多文件类型上传',
    successMessage: '文件上传成功',
    onUpload: mockUpload,
    uploadFileProps: {
      maxFiles: 10,
      maxSize: 50 * 1024 * 1024, // 20MB
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
          '.xlsx',
        ],
        'text/plain': ['.txt'],
        'text/csv': ['.csv'],
      },
    },
  },
  render: function MultipleFileTypesRender(args) {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          支持多种文件类型：图片、文档、表格、文本等
        </div>
        <Button onClick={() => setOpen(true)}>多文件类型上传</Button>
        <UploadFileModal {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
}

export const CustomMessages: Story = {
  args: {
    open: false,
    onClose: () => { },
    title: '自定义消息',
    successMessage: '🎉 上传完成！文件已成功保存到服务器',
    emptyMessage: '⚠️ 请先选择要上传的文件',
    onUpload: mockUpload,
    uploadFileProps: {
      maxFiles: 3,
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: { 'image/*': ['.png', '.jpg'] },
    },
  },
  render: function CustomMessagesRender(args) {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          自定义成功和错误消息
        </div>
        <Button onClick={() => setOpen(true)}>自定义消息</Button>
        <UploadFileModal {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
}
