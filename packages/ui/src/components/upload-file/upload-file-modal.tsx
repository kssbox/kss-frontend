'use client'
import { useCallback, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import { Ellipsis } from '../ui/ellipsis'
import { Progress } from '../ui/progress'
import {
  UploadFile,
  UploadFileProps,
  UploadFileChecksumResult,
  UploadFileRenderProps,
} from './upload-file'

type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error'

interface FileUploadState {
  percent: number
  status: FileUploadStatus
  error?: string
}

const getFileKey = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}`

const formatBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)}${units[unitIndex]}`
}

export interface UploadFileModalProps {
  /** 控制 Modal 的显示/隐藏 */
  open: boolean
  /** Modal 关闭时的回调 */
  onClose: () => void
  /** 上传成功后的回调 */
  onSuccess?: () => void | Promise<void>
  /**
   * 批量上传函数（一次请求上传所有文件，无单文件进度）。
   * 与 `onUploadFile` 二选一，优先使用 `onUploadFile`。
   */
  onUpload?: (files: File[], checksums: string[]) => Promise<void>
  /**
   * 单文件上传函数，支持上报进度。提供后，Modal 将逐个上传文件并展示每个文件的进度。
   */
  onUploadFile?: (
    file: File,
    checksum: string,
    onProgress: (percent: number) => void,
    signal: AbortSignal
  ) => Promise<void>
  /** 单文件模式下的并发数，默认 3 */
  concurrency?: number
  /** UploadFile 组件的配置属性 */
  uploadFileProps?: Partial<UploadFileProps>
  /** Modal 标题 */
  title?: string
  /** Modal 描述 */
  description?: string
  /** 成功提示文案 */
  successMessage?: string
  /** 未选择文件时的提示文案 */
  emptyMessage?: string
}

/**
 * 通用的文件上传 Modal 组件
 *
 * @example 批量上传（无进度）
 * ```tsx
 * <UploadFileModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onUpload={async (files, checksums) => {
 *     await FileService.upload({ files, checksums })
 *   }}
 * />
 * ```
 *
 * @example 单文件上传（带进度）
 * ```tsx
 * <UploadFileModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onUploadFile={async (file, checksum, onProgress, signal) => {
 *     await FileService.uploadWithProgress({ file, checksum }, onProgress, signal)
 *   }}
 * />
 * ```
 */
export function UploadFileModal({
  open,
  onClose,
  onSuccess,
  onUpload,
  onUploadFile,
  concurrency = 3,
  uploadFileProps = {},
  title = '上传文件',
  description = '上传后系统会自动解析内容并建立知识索引',
  successMessage = '文件上传成功',
  emptyMessage = '请先选择文件',
}: UploadFileModalProps) {
  const [fileAndChecksums, setFileAndChecksums] = useState<
    UploadFileChecksumResult[]
  >([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadStates, setUploadStates] = useState<
    Record<string, FileUploadState>
  >({})
  const abortRef = useRef<AbortController | null>(null)

  const perFileMode = Boolean(onUploadFile)

  const resetAll = useCallback(() => {
    setSubmitting(false)
    setFileAndChecksums([])
    setUploadStates({})
    abortRef.current = null
  }, [])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    resetAll()
    onClose()
  }, [onClose, resetAll])

  const updateState = useCallback((key: string, next: FileUploadState) => {
    setUploadStates(prev => ({ ...prev, [key]: next }))
  }, [])

  const handlePerFileUpload = useCallback(async () => {
    if (!onUploadFile) return

    // 仅上传尚未成功的文件（支持失败后重试）
    const pending = fileAndChecksums.filter(
      item => uploadStates[getFileKey(item.file)]?.status !== 'success'
    )

    if (pending.length === 0) {
      toast.error(emptyMessage)
      return
    }

    setSubmitting(true)
    const controller = new AbortController()
    abortRef.current = controller

    setUploadStates(prev => {
      const next = { ...prev }
      pending.forEach(item => {
        next[getFileKey(item.file)] = { percent: 0, status: 'pending' }
      })
      return next
    })

    const queue = [...pending]
    let hadError = false

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift()
        if (!item) break
        const key = getFileKey(item.file)
        updateState(key, { percent: 0, status: 'uploading' })
        try {
          await onUploadFile(
            item.file,
            item.checksum,
            percent => updateState(key, { percent, status: 'uploading' }),
            controller.signal
          )
          updateState(key, { percent: 100, status: 'success' })
        } catch (error) {
          hadError = true
          const message = error instanceof Error ? error.message : '上传失败'
          updateState(key, { percent: 0, status: 'error', error: message })
        }
      }
    }

    const workerCount = Math.max(1, Math.min(concurrency, pending.length))
    await Promise.all(Array.from({ length: workerCount }, () => worker()))

    abortRef.current = null
    setSubmitting(false)

    if (hadError) {
      toast.error('部分文件上传失败，请重试')
      // 保留弹窗，让用户查看失败项并重试；同时刷新列表展示已成功项
      await onSuccess?.()
      return
    }

    toast.success(successMessage)
    setFileAndChecksums([])
    setUploadStates({})
    onClose()
    await onSuccess?.()
  }, [
    concurrency,
    emptyMessage,
    fileAndChecksums,
    onClose,
    onSuccess,
    onUploadFile,
    successMessage,
    updateState,
    uploadStates,
  ])

  const handleBatchUpload = useCallback(async () => {
    if (!onUpload) return

    const files: File[] = []
    const checksums: string[] = []
    fileAndChecksums.forEach(item => {
      files.push(item.file)
      checksums.push(item.checksum)
    })

    if (!files.length) {
      toast.error(emptyMessage)
      return
    }

    setSubmitting(true)
    try {
      await onUpload(files, checksums)
      toast.success(successMessage)
      setFileAndChecksums([])
      onClose()
      await onSuccess?.()
    } catch {
      // 错误处理由调用方的 onUpload 函数负责
    } finally {
      setSubmitting(false)
    }
  }, [
    emptyMessage,
    fileAndChecksums,
    onClose,
    onSuccess,
    onUpload,
    successMessage,
  ])

  const handleOk = useCallback(async () => {
    if (submitting) return
    if (perFileMode) {
      await handlePerFileUpload()
    } else {
      await handleBatchUpload()
    }
  }, [handleBatchUpload, handlePerFileUpload, perFileMode, submitting])

  const renderFileWithProgress = useCallback(
    ({ file, remove, disabled }: UploadFileRenderProps) => {
      const state = uploadStates[getFileKey(file)]
      return (
        <div className="flex w-full min-w-0 items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Ellipsis className="block text-sm" enableTooltip>
              {file.name}
            </Ellipsis>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="shrink-0">{formatBytes(file.size)}</span>
              {state?.status === 'uploading' && (
                <span className="shrink-0 text-primary">
                  上传中 {state.percent}%
                </span>
              )}
              {state?.status === 'success' && (
                <span className="shrink-0 text-emerald-600">上传成功</span>
              )}
              {state?.status === 'error' && (
                <Ellipsis className="block text-destructive" enableTooltip>
                  {state.error || '上传失败'}
                </Ellipsis>
              )}
            </div>
            {(state?.status === 'uploading' ||
              state?.status === 'pending') && (
              <Progress value={state.percent} className="h-1.5" />
            )}
          </div>
          {state?.status === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          ) : state?.status === 'error' ? (
            <AlertCircle className="size-5 shrink-0 text-destructive" />
          ) : state?.status === 'uploading' ? (
            <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="size-7 shrink-0"
              onClick={remove}
              disabled={disabled}
            >
              <XIcon className="size-4" />
              <span className="sr-only">移除文件</span>
            </Button>
          )}
        </div>
      )
    },
    [uploadStates]
  )

  const finalUploadFileProps: UploadFileProps = useMemo(
    () => ({
      maxFiles: 10,
      maxSize: 50 * 1024 * 1024,
      ...uploadFileProps,
      onChecksumsChange: setFileAndChecksums,
      disabled: submitting,
      // 单文件模式用每个文件自身的进度条展示，不再使用全屏遮罩
      loading: perFileMode ? false : submitting,
      ...(perFileMode ? { renderFile: renderFileWithProgress } : {}),
    }),
    [perFileMode, renderFileWithProgress, submitting, uploadFileProps]
  )

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      title={title}
      description={description}
      width={600}
      confirmLoading={submitting}
      okText="开始上传"
    >
      <div className="min-h-[220px]">
        <UploadFile {...finalUploadFileProps} className="w-full space-y-3" />
      </div>
    </Modal>
  )
}
