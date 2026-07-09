'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
import { Button } from './button'

interface ConfirmDialogProps {
  open?: boolean
  defaultOpen?: boolean
  title?: string
  content?: string
  okText?: string
  loadingText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function ConfirmDialog({
  open: openProp,
  defaultOpen,
  title = '确认删除？',
  content = '删除后无法恢复，请谨慎操作',
  okText = '删除',
  loadingText,
  cancelText = '取消',
  onConfirm,
  onCancel,
  onOpenChange,
  children,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string>('')
  const [internalOpen, setInternalOpen] = React.useState(!!defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? !!openProp : internalOpen

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  React.useEffect(() => {
    if (open) {
      setErrorMessage('')
    }
  }, [open])

  const handleConfirm = async () => {
    if (!onConfirm || isConfirming) return
    setErrorMessage('')
    setIsConfirming(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message)
      } else if (typeof error === 'string' && error) {
        setErrorMessage(error)
      } else {
        setErrorMessage('操作失败，请稍后重试')
      }
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    if (isConfirming) return
    setErrorMessage('')
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={nextOpen => {
        if (isConfirming) return
        setOpen(nextOpen)
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent showCloseButton={!isConfirming}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {content}
            {errorMessage && (
              <div className="mt-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isConfirming}>
            {cancelText}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (loadingText ?? `${okText}中...`) : okText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
