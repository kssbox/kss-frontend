'use client'

import { InfoIcon, UploadCloudIcon, XIcon } from 'lucide-react'
import * as React from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'

import { Dropzone, type DropzoneProps } from '../shadcn-io/dropzone'
import { Button } from '../ui/button'
import { Ellipsis } from '../ui/ellipsis'
import { cn } from '../../lib/utils'
import { toast } from '../ui/sonner'
import { computeChecksum as defaultComputeChecksum } from './checksum'
import { LoadingOverlay } from '../ui/loading'

const formatBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)}${units[unitIndex]}`
}

type DropzoneEmptyProps = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
}

/**
 * 空态拖拽区：主视觉只保留一个较大的上传图标、明确主标题与一行轻量副文案，
 * 不再在中间区域堆叠扩展名 / 大小 / 数量等说明。
 */
const DropzoneEmpty = ({ title, subtitle }: DropzoneEmptyProps) => (
  <div className="flex flex-col items-center justify-center text-center">
    <div className="flex size-16 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white text-indigo-600 shadow-sm">
      <UploadCloudIcon className="size-7" />
    </div>
    <p className="mt-5 text-[15px] font-semibold text-foreground">
      {title ?? '点击或将文件拖拽到这里上传'}
    </p>
    <p className="mt-1.5 text-sm text-muted-foreground">
      {subtitle ?? '上传后系统会自动解析内容并建立知识索引'}
    </p>
  </div>
)

export type UploadFileRenderProps = {
  file: File
  index: number
  remove: () => void
  disabled: boolean
  checksum?: string
}

export type UploadFileChecksumResult = {
  file: File
  checksum: string
}

export type UploadFileProps = Omit<
  DropzoneProps,
  'src' | 'children' | 'className'
> & {
  value?: File[]
  defaultValue?: File[]
  onChange?: (files: File[]) => void
  className?: string
  dropzoneClassName?: string
  showFileList?: boolean
  fileListClassName?: string
  renderFile?: (props: UploadFileRenderProps) => React.ReactNode
  emptyState?: React.ReactNode
  content?: React.ReactNode
  /** 空态主标题，覆盖默认「点击或将文件拖拽到这里上传」 */
  title?: React.ReactNode
  /** 空态副文案，覆盖默认一行轻量说明 */
  subtitle?: React.ReactNode
  /** 底部辅助提示：格式 / 大小 / 数量收纳为一行 */
  helper?: React.ReactNode
  enableChecksum?: boolean
  getChecksum?: (file: File) => Promise<string>
  onChecksumsChange?: (items: UploadFileChecksumResult[]) => void
  /** 全局加载态，禁止交互并展示遮罩 */
  loading?: boolean
}

export const UploadFile = ({
  value,
  defaultValue,
  onChange,
  className,
  dropzoneClassName,
  showFileList = true,
  fileListClassName,
  renderFile,
  emptyState,
  content,
  title,
  subtitle,
  helper,
  enableChecksum = true,
  getChecksum,
  onChecksumsChange,
  onDrop: dropzoneOnDrop,
  onError: dropzoneOnError,
  disabled = false,
  maxFiles = 1,
  accept,
  maxSize,
  minSize,
  loading = false,
  ...dropzoneOptions
}: UploadFileProps) => {
  const [files, setFiles] = useControllableState<File[]>({
    prop: value,
    defaultProp: defaultValue ?? [],
    onChange,
  })

  React.useEffect(() => {
    if (value !== undefined) {
      return
    }

    setFiles(previous => {
      if (defaultValue !== undefined) {
        if (previous === defaultValue) {
          return previous
        }
        return defaultValue
      }

      if (previous.length === 0) {
        return previous
      }

      return []
    })
  }, [defaultValue, setFiles, value])

  const resolvedFiles = React.useMemo(() => files ?? [], [files])
  const hasFiles = resolvedFiles.length > 0

  const [checksumMap, setChecksumMap] = React.useState<Record<string, string>>(
    {}
  )

  const shouldComputeChecksum = enableChecksum !== false

  const getFileKey = React.useCallback(
    (file: File) => `${file.name}:${file.size}:${file.lastModified}`,
    []
  )

  const checksumResolver = React.useCallback(
    (file: File) =>
      getChecksum ? getChecksum(file) : defaultComputeChecksum(file),
    [getChecksum]
  )

  const fileLimit =
    typeof maxFiles === 'number' && Number.isFinite(maxFiles) && maxFiles > 0
      ? maxFiles
      : undefined

  const filesWithChecksums = React.useMemo(
    () =>
      resolvedFiles.map(file => ({
        file,
        checksum: checksumMap[getFileKey(file)],
      })),
    [checksumMap, getFileKey, resolvedFiles]
  )

  const defaultDropzoneChildren = React.useMemo(
    () => <DropzoneEmpty title={title} subtitle={subtitle} />,
    [subtitle, title]
  )

  const dropzoneChildrenWithFiles = React.useMemo(
    () => (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-background text-indigo-600 shadow-sm">
          <UploadCloudIcon className="size-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">
          继续添加文件
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          已选择 {resolvedFiles.length} 个文件
          {fileLimit
            ? `，还可继续添加 ${Math.max(fileLimit - resolvedFiles.length, 0)} 个`
            : ''}
        </p>
      </div>
    ),
    [resolvedFiles.length, fileLimit]
  )

  const commitFiles = React.useCallback(
    (updater: (previous: File[]) => File[]) => {
      setFiles(prev => {
        const base = prev ?? []
        const next = updater(base)
        return next
      })
    },
    [setFiles]
  )

  const handleDrop = React.useCallback<NonNullable<DropzoneProps['onDrop']>>(
    (acceptedFiles, fileRejections, event) => {
      let trimmedCount = 0
      let duplicateCount = 0

      if (acceptedFiles.length > 0) {
        commitFiles(previous => {
          // 过滤掉重复的文件
          const existingKeys = new Set(previous.map(getFileKey))
          const uniqueAcceptedFiles = acceptedFiles.filter(
            file => !existingKeys.has(getFileKey(file))
          )
          duplicateCount = acceptedFiles.length - uniqueAcceptedFiles.length

          if (uniqueAcceptedFiles.length === 0) {
            // 只有重复文件，不需要设置trimmedCount
            return previous
          }

          // 检查是否会超过文件限制
          if (
            fileLimit &&
            previous.length + uniqueAcceptedFiles.length > fileLimit
          ) {
            // 如果会超过限制，只保留能添加的数量
            const availableSlots = fileLimit - previous.length
            if (availableSlots <= 0) {
              // 已经达到限制，不添加任何文件
              trimmedCount = uniqueAcceptedFiles.length
              return previous
            }
            const kept = uniqueAcceptedFiles.slice(0, availableSlots)
            trimmedCount = uniqueAcceptedFiles.length - kept.length
            return [...previous, ...kept]
          }

          return [...previous, ...uniqueAcceptedFiles]
        })
      }

      // 显示相应的提示
      if (duplicateCount > 0) {
        toast.warning(`跳过了 ${duplicateCount} 个重复文件`)
      }

      if (trimmedCount > 0 && fileLimit) {
        toast.warning(`最多只能上传 ${fileLimit} 个文件`)
      }

      if (fileRejections.length > 0) {
        const messages = fileRejections
          .flatMap(rejection =>
            rejection.errors.map(error => {
              // 转换错误消息中的bytes为MB
              let message = error.message
              const bytesMatch = message.match(/(\d+) bytes/)
              if (bytesMatch) {
                const bytes = parseInt(bytesMatch[1])
                const mb = Math.round(bytes / (1024 * 1024))
                message = message.replace(/\d+ bytes/, `${mb} M`)
              }
              return message
            })
          )
          .filter(Boolean)

        if (messages.length > 0) {
          toast.warning(messages.join('\n'))
        }
      }

      dropzoneOnDrop?.(acceptedFiles, fileRejections, event)
    },
    [commitFiles, dropzoneOnDrop, fileLimit, getFileKey]
  )

  const handleRemove = React.useCallback(
    (index: number) => {
      if (disabled || loading) return
      commitFiles(previous =>
        previous.filter((_, currentIndex) => currentIndex !== index)
      )
    },
    [commitFiles, disabled, loading]
  )

  const lastChecksumKeyRef = React.useRef<string>('')

  const handleDropzoneError = React.useCallback(
    (error: Error) => {
      if (error?.message) {
        toast.warning(error.message)
      }
      dropzoneOnError?.(error)
    },
    [dropzoneOnError]
  )

  React.useEffect(() => {
    if (!shouldComputeChecksum) {
      if (Object.keys(checksumMap).length > 0) {
        setChecksumMap({})
        lastChecksumKeyRef.current = ''
        onChecksumsChange?.([])
      }
      return
    }

    const filtered: Record<string, string> = {}

    for (const file of resolvedFiles) {
      const key = getFileKey(file)
      const value = checksumMap[key]
      if (value) {
        filtered[key] = value
      }
    }

    const filteredKeys = Object.keys(filtered)
    const originalKeys = Object.keys(checksumMap)

    const needsFilter =
      filteredKeys.length !== originalKeys.length ||
      filteredKeys.some(key => checksumMap[key] !== filtered[key])

    if (needsFilter) {
      setChecksumMap(filtered)
      return
    }

    const missingFiles = resolvedFiles.filter(
      file => !checksumMap[getFileKey(file)]
    )

    if (missingFiles.length === 0) {
      if (onChecksumsChange) {
        const nextKey = filesWithChecksums
          .map(item =>
            item.checksum
              ? `${item.file.name}:${item.file.size}:${item.checksum}`
              : `${item.file.name}:${item.file.size}`
          )
          .join('|')

        if (nextKey !== lastChecksumKeyRef.current) {
          lastChecksumKeyRef.current = nextKey
          const results = filesWithChecksums.filter(
            (item): item is UploadFileChecksumResult =>
              typeof item.checksum === 'string'
          )
          onChecksumsChange(results)
        }
      }
      return
    }

    let cancelled = false

    const run = async () => {
      const updates: Record<string, string> = {}

      for (const file of missingFiles) {
        try {
          const checksum = await checksumResolver(file)
          if (cancelled) {
            return
          }
          updates[getFileKey(file)] = checksum
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('[UploadFile] Failed to compute checksum', error)
        }
      }

      if (cancelled || Object.keys(updates).length === 0) {
        return
      }

      setChecksumMap(prev => {
        const merged = { ...prev, ...updates }
        const next: Record<string, string> = {}

        for (const file of resolvedFiles) {
          const key = getFileKey(file)
          const value = merged[key]
          if (value) {
            next[key] = value
          }
        }

        return next
      })
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [
    checksumMap,
    checksumResolver,
    filesWithChecksums,
    getFileKey,
    onChecksumsChange,
    resolvedFiles,
    shouldComputeChecksum,
  ])

  return (
    <div className={cn('relative w-[500px] space-y-3', className)}>
      <LoadingOverlay
        loading={loading}
        text="上传中..."
        blur
        opacity={0.3}
        className="pointer-events-auto rounded-md"
      >
        <Dropzone
          {...dropzoneOptions}
          accept={accept}
          disabled={disabled || loading}
          src={hasFiles ? resolvedFiles : undefined}
          onDrop={handleDrop}
          onError={handleDropzoneError}
          maxFiles={maxFiles}
          maxSize={maxSize}
          minSize={minSize}
          className={dropzoneClassName}
        >
          {hasFiles
            ? (content ?? dropzoneChildrenWithFiles)
            : (emptyState ?? defaultDropzoneChildren)}
        </Dropzone>

        {helper && (
          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <span>{helper}</span>
          </div>
        )}

        {showFileList && hasFiles && (
          <ul
            className={cn(
              'max-h-[350px] space-y-2 overflow-y-auto text-sm',
              fileListClassName
            )}
          >
            {filesWithChecksums.map(({ file, checksum }, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-dashed border-border bg-muted/60 px-3 py-2"
              >
                {renderFile ? (
                  renderFile({
                    file,
                    index,
                    remove: () => handleRemove(index),
                    disabled: disabled || loading,
                    checksum,
                  })
                ) : (
                  <>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <Ellipsis className="block" enableTooltip>
                        {file.name}
                      </Ellipsis>
                      <span className="text-muted-foreground text-xs">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        className="size-7 shrink-0"
                        onClick={() => handleRemove(index)}
                        disabled={disabled || loading}
                      >
                        <XIcon className="size-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </LoadingOverlay>
    </div>
  )
}
