import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  type DropzoneProps,
} from '../src/components/shadcn-io/dropzone'

const meta = {
  title: 'Components/Dropzone',
  component: Dropzone,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxFiles: {
      control: { type: 'number', min: 1, step: 1 },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Dropzone>

export default meta
type Story = StoryObj<typeof meta>

type DemoDropzoneProps = DropzoneProps & {
  initialFiles?: File[]
}

const DemoDropzone = ({
  initialFiles = [],
  src,
  children,
  onDrop,
  ...props
}: DemoDropzoneProps) => {
  const [files, setFiles] = React.useState<File[]>(() => src ?? initialFiles)

  React.useEffect(() => {
    if (src) {
      setFiles(src)
    }
  }, [src])

  React.useEffect(() => {
    if (!src) {
      setFiles(initialFiles)
    }
  }, [initialFiles, src])

  const handleDrop = React.useCallback<NonNullable<DropzoneProps['onDrop']>>(
    (acceptedFiles, fileRejections, event) => {
      setFiles(acceptedFiles)
      onDrop?.(acceptedFiles, fileRejections, event)
    },
    [onDrop]
  )

  const hasFiles = files.length > 0

  return (
    <div className="w-[420px] space-y-4">
      <Dropzone
        {...props}
        src={hasFiles ? files : undefined}
        onDrop={handleDrop}
      >
        {children}
      </Dropzone>
      {hasFiles && (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {files.map(file => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const Default: Story = {
  args: {
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  },
  render: args => (
    <DemoDropzone {...args}>
      <DropzoneEmptyState />
      <DropzoneContent />
    </DemoDropzone>
  ),
}

export const MultipleFiles: Story = {
  args: {
    accept: { 'image/*': [] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  },
  render: args => (
    <DemoDropzone {...args}>
      <DropzoneEmptyState />
      <DropzoneContent />
    </DemoDropzone>
  ),
}

export const WithPreloadedFiles: Story = {
  args: {
    accept: { 'image/*': [] },
  },
  render: args => {
    const initialFiles = React.useMemo(
      () => [
        new File(['dummy'], 'design.png', { type: 'image/png' }),
        new File(['dummy'], 'wireframe.jpg', { type: 'image/jpeg' }),
      ],
      []
    )

    return (
      <DemoDropzone {...args} initialFiles={initialFiles}>
        <DropzoneEmptyState />
        <DropzoneContent />
      </DemoDropzone>
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: args => (
    <DemoDropzone {...args}>
      <DropzoneEmptyState />
      <DropzoneContent />
    </DemoDropzone>
  ),
}
