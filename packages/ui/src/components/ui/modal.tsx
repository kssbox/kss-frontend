'use client'

import * as React from 'react'
import { createRoot } from 'react-dom/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { Button } from './button'
import { cn } from '../../lib/utils'

export interface ModalProps {
  /** 控制 Modal 显示/隐藏 */
  open?: boolean
  /** Modal 状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 标题，支持 ReactNode */
  title?: React.ReactNode
  /** 描述，支持 ReactNode */
  description?: React.ReactNode
  /** 底部内容，传 null 则不显示底部，不传则显示默认按钮 */
  footer?: React.ReactNode | null
  /** 确定按钮回调，支持异步 */
  onOk?: () => void | Promise<void>
  /** 取消按钮回调 */
  onCancel?: () => void
  /** 确定按钮文本 */
  okText?: React.ReactNode
  /** 取消按钮文本 */
  cancelText?: React.ReactNode
  /** 确定按钮加载状态 */
  confirmLoading?: boolean
  /** 确定按钮属性 */
  okButtonProps?: React.ComponentProps<typeof Button>
  /** 取消按钮属性 */
  cancelButtonProps?: React.ComponentProps<typeof Button>
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 宽度 */
  width?: number | string
  /** 是否垂直居中 */
  centered?: boolean
  /** 自定义类名 */
  className?: string
  /** 内容 */
  children?: React.ReactNode
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  onOk,
  onCancel,
  okText = '确定',
  cancelText = '取消',
  confirmLoading = false,
  okButtonProps,
  cancelButtonProps,
  closable = true,
  width,
  centered = false,
  className,
  children,
}: ModalProps) {
  const [loading, setLoading] = React.useState(false)

  const handleDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onCancel?.()
      }
      onOpenChange?.(nextOpen)
    },
    [onCancel, onOpenChange]
  )

  const handleOk = React.useCallback(async () => {
    if (!onOk) return

    try {
      setLoading(true)
      await onOk()
      onOpenChange?.(false)
    } catch (_error) {
      // 如果 onOk 抛出错误，不关闭 Modal
    } finally {
      setLoading(false)
    }
  }, [onOk, onOpenChange])

  const handleCancel = React.useCallback(() => {
    onCancel?.()
    onOpenChange?.(false)
  }, [onCancel, onOpenChange])

  // 渲染默认 footer
  const renderFooter = () => {
    // footer 为 null 时不显示
    if (footer === null) return null

    // footer 有自定义内容时直接渲染
    if (footer !== undefined) return <DialogFooter>{footer}</DialogFooter>

    // 默认 footer：有 onOk 或 onCancel 时显示
    if (!onOk && !onCancel) return null

    return (
      <DialogFooter>
        {onCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading || confirmLoading}
            {...cancelButtonProps}
          >
            {cancelText}
          </Button>
        )}
        {onOk && (
          <Button
            onClick={handleOk}
            disabled={loading || confirmLoading}
            {...okButtonProps}
          >
            {loading || confirmLoading ? '加载中...' : okText}
          </Button>
        )}
      </DialogFooter>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={closable}
        className={cn(className)}
        style={{
          maxWidth: width,
          ...(centered && {
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }),
        }}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        {children && <div className="py-4">{children}</div>}

        {renderFooter()}
      </DialogContent>
    </Dialog>
  )
}

// ============ 命令式 API ============

interface ModalFuncProps extends Omit<ModalProps, 'open' | 'onOpenChange'> {
  /** 内容，命令式 API 中使用 content */
  content?: React.ReactNode
}

interface ModalInstance {
  destroy: () => void
  update: (config: ModalFuncProps) => void
}

function createModalInstance(config: ModalFuncProps): ModalInstance {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const root = createRoot(div)

  let currentConfig = { ...config }

  const destroy = () => {
    root.unmount()
    if (div.parentNode) {
      div.parentNode.removeChild(div)
    }
  }

  const render = (props: ModalFuncProps) => {
    root.render(
      <Modal
        open={true}
        onOpenChange={open => {
          if (!open) {
            destroy()
          }
        }}
        {...props}
      >
        {props.content || props.children}
      </Modal>
    )
  }

  const update = (newConfig: ModalFuncProps) => {
    currentConfig = { ...currentConfig, ...newConfig }
    render(currentConfig)
  }

  render(currentConfig)

  return {
    destroy,
    update,
  }
}

function confirm(config: ModalFuncProps): ModalInstance {
  return createModalInstance({
    okText: '确定',
    cancelText: '取消',
    ...config,
    onOk: config.onOk,
    onCancel: () => {
      config.onCancel?.()
    },
  })
}

function info(config: Omit<ModalFuncProps, 'onCancel'>): ModalInstance {
  return createModalInstance({
    okText: '知道了',
    ...config,
    onCancel: undefined,
  })
}

function success(config: Omit<ModalFuncProps, 'onCancel'>): ModalInstance {
  return createModalInstance({
    title: config.title || '成功',
    okText: '知道了',
    ...config,
    onCancel: undefined,
  })
}

function error(config: Omit<ModalFuncProps, 'onCancel'>): ModalInstance {
  return createModalInstance({
    title: config.title || '错误',
    okText: '知道了',
    okButtonProps: { variant: 'destructive', ...config.okButtonProps },
    ...config,
    onCancel: undefined,
  })
}

function warning(config: ModalFuncProps): ModalInstance {
  return createModalInstance({
    title: config.title || '警告',
    okText: '确定',
    cancelText: '取消',
    ...config,
  })
}

// 导出命令式 API
Modal.confirm = confirm
Modal.info = info
Modal.success = success
Modal.error = error
Modal.warning = warning
