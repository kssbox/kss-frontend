'use client'

import { useTheme } from 'next-themes'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { ExternalToast, Toaster as Sonner, ToasterProps, toast as sonnerToast } from 'sonner'

import { cn } from '../../lib/utils'

type ToastContent = (() => ReactNode) | ReactNode

const EXACT_TRANSLATIONS: Record<string, string> = {
  'too many files': '上传文件数量超出限制，请减少后重试',
  'request timed out': '请求超时，请稍后重试',
  unauthorized: '未授权，请重新登录',
  forbidden: '禁止访问',
  'bad request': '请求参数错误',
  'internal server error': '服务器内部错误',
  'server error': '服务异常',
  'unknown error': '未知错误',
  unknown: '未知错误',
  'event has been created': '事件已创建',
  'login failed, not activated': '登录失败，账号未激活',
  'login failed. token generate error': '登录失败，令牌生成失败',
}

const SUBJECT_TRANSLATIONS: Record<string, string> = {
  'ai service': 'AI 服务',
  chatbot: 'AI 助理',
  conversation: '对话',
  'current tenant': '当前机构',
  'data collection': '数据采集',
  db: '数据库',
  document: '文档',
  'document batch parse': '文档批量解析',
  'document deletion': '文档删除',
  'document parsing': '文档解析',
  'document processing': '文档处理',
  'document update': '文档更新',
  email: '邮箱',
  'edit summary query': '编辑摘要查询',
  'file data': '文件',
  'image fetch': '图片加载',
  'knowledge base': '知识库',
  'knowledge base creation': '知识库创建',
  'knowledge base update': '知识库更新',
  'list ranges': '分段列表查询',
  password: '密码',
  'pipeline detail': '流程详情',
  preview: '预览',
  'preview fetch': '预览加载',
  share: '分享',
  skill: '技能',
  'status query': '状态查询',
  'status update': '状态更新',
  stream: '流式连接',
  token: '令牌',
  'web data': '网页',
  'webhook url': 'Webhook 地址',
}

const INLINE_TRANSLATIONS: Array<[RegExp, string]> = [
  [/\bWebhook URL\b/gi, 'Webhook 地址'],
  [/\bStream(?=连接)/g, '流式'],
  [/\bSkill 协议\b/g, '技能协议'],
  [/\bToo many files\b/gi, '上传文件数量超出限制，请减少后重试'],
  [/\bRequest timed out\b/gi, '请求超时，请稍后重试'],
  [/\bUnauthorized\b/gi, '未授权，请重新登录'],
  [/\bForbidden\b/gi, '禁止访问'],
  [/\bBad Request\b/gi, '请求参数错误'],
  [/\bInternal server error\b/gi, '服务器内部错误'],
  [/\bServer error\b/gi, '服务异常'],
  [/\bUnknown error\b/gi, '未知错误'],
  [/\bUnknown\b/gi, '未知'],
]

const translateSubject = (rawSubject: string) => {
  const subject = rawSubject.trim().replace(/\s+/g, ' ')
  const normalizedSubject = subject.toLowerCase()

  if (EXACT_TRANSLATIONS[normalizedSubject]) {
    return EXACT_TRANSLATIONS[normalizedSubject]
  }

  if (SUBJECT_TRANSLATIONS[normalizedSubject]) {
    return SUBJECT_TRANSLATIONS[normalizedSubject]
  }

  let translated = subject
  for (const [pattern, replacement] of INLINE_TRANSLATIONS) {
    translated = translated.replace(pattern, replacement)
  }

  return translated
}

const translatePermissionAction = (rawAction: string) => {
  const action = rawAction.trim().toLowerCase()
  const actionMap: Record<string, string> = {
    'access this conversation': '访问该对话',
    'delete this conversation': '删除该对话',
    'pin this conversation': '置顶该对话',
    'rename this conversation': '重命名该对话',
    'share this chatbot': '分享当前 AI 助理',
  }

  return actionMap[action] || translateSubject(rawAction)
}

const translateToastMessage = (rawMessage: string): string => {
  const message = rawMessage.trim()
  if (!message) {
    return rawMessage
  }

  const colonMatch = message.match(/^(.*?)[：:]\s+(.+)$/)
  if (colonMatch) {
    return `${translateToastMessage(colonMatch[1])}: ${translateToastMessage(colonMatch[2])}`
  }

  const normalizedMessage = message.toLowerCase()
  if (EXACT_TRANSLATIONS[normalizedMessage]) {
    return EXACT_TRANSLATIONS[normalizedMessage]
  }

  const patternHandlers: Array<[(value: string) => RegExpMatchArray | null, (match: RegExpMatchArray) => string]> = [
    [
      (value) => value.match(/^http\s+(\d+)$/i),
      (match) => `请求失败（HTTP ${match[1]}）`,
    ],
    [
      (value) => value.match(/^api error:\s*(\d+)\s*(.*)$/i),
      (match) => `接口错误（${match[1]}${match[2] ? ` ${translateToastMessage(match[2])}` : ''}）`,
    ],
    [
      (value) => value.match(/^preview fetch failed:\s*(\d+)\s*(.*)$/i),
      (match) => `预览加载失败（${match[1]}${match[2] ? ` ${translateToastMessage(match[2])}` : ''}）`,
    ],
    [
      (value) => value.match(/^image fetch failed:\s*(\d+)\s*(.*)$/i),
      (match) => `图片加载失败（${match[1]}${match[2] ? ` ${translateToastMessage(match[2])}` : ''}）`,
    ],
    [
      (value) => value.match(/^(.+?)\s+service temporarily unavailable$/i),
      (match) => `${translateSubject(match[1])}暂时不可用`,
    ],
    [
      (value) => value.match(/^(.+?)\s+temporarily unavailable$/i),
      (match) => `${translateSubject(match[1])}暂时不可用`,
    ],
    [
      (value) => value.match(/^(.+?)\s+service unavailable$/i),
      (match) => `${translateSubject(match[1])}服务暂时不可用`,
    ],
    [
      (value) => value.match(/^(.+?)\s+response invalid$/i),
      (match) => `${translateSubject(match[1])}响应无效`,
    ],
    [
      (value) => value.match(/^(.+?)\s+query failed$/i),
      (match) => `${translateSubject(match[1])}查询失败`,
    ],
    [
      (value) => value.match(/^(.+?)\s+failed:\s*(.+)$/i),
      (match) => `${translateSubject(match[1])}失败：${translateToastMessage(match[2])}`,
    ],
    [
      (value) => value.match(/^(.+?)\s+failed$/i),
      (match) => `${translateSubject(match[1])}失败`,
    ],
    [
      (value) => value.match(/^(.+?)\s+not found or access denied$/i),
      (match) => `${translateSubject(match[1])}不存在或无权访问`,
    ],
    [
      (value) => value.match(/^(.+?)\s+not found$/i),
      (match) => `${translateSubject(match[1])}不存在`,
    ],
    [
      (value) => value.match(/^no permission(?:\s+to\s+(.+))?$/i),
      (match) => match[1] ? `没有权限${translatePermissionAction(match[1])}` : '没有权限',
    ],
    [
      (value) => value.match(/^(.+?)\s+empty$/i),
      (match) => `${translateSubject(match[1])}不能为空`,
    ],
    [
      (value) => value.match(/^(.+?)\s+contains empty value$/i),
      (match) => `${translateSubject(match[1])}包含空值`,
    ],
    [
      (value) => value.match(/^invalid\s+(.+?)\s+format$/i),
      (match) => `${translateSubject(match[1])}格式无效`,
    ],
    [
      (value) => value.match(/^invalid\s+(.+)$/i),
      (match) => `${translateSubject(match[1])}无效`,
    ],
    [
      (value) => value.match(/^(.+?)\s+does not belong to this kb$/i),
      (match) => `${translateSubject(match[1])}不属于当前知识库`,
    ],
    [
      (value) => value.match(/^(.+?)\s+returned empty doc_id$/i),
      (match) => `${translateSubject(match[1])}返回了空的文档 ID`,
    ],
    [
      (value) => value.match(/^(.+?)\s+missing$/i),
      (match) => `${translateSubject(match[1])}缺失`,
    ],
    [
      (value) => value.match(/^(.+?)\s+mismatch$/i),
      (match) => `${translateSubject(match[1])}不匹配`,
    ],
    [
      (value) => value.match(/^(.+?)\s+is required(?:\s+for\s+(.+))?$/i),
      (match) => match[2]
        ? `${translateSubject(match[1])}为必填项，用于${translateSubject(match[2])}`
        : `${translateSubject(match[1])}为必填项`,
    ],
  ]

  for (const [matchMessage, buildMessage] of patternHandlers) {
    const match = matchMessage(message)
    if (match) {
      return buildMessage(match)
    }
  }

  let translated = message
  for (const [pattern, replacement] of INLINE_TRANSLATIONS) {
    translated = translated.replace(pattern, replacement)
  }

  return translated
}

const normalizeToastContent = (message: ToastContent): ToastContent => {
  if (typeof message === 'string') {
    return translateToastMessage(message)
  }

  if (typeof message === 'function') {
    return () => {
      const content = message()
      return typeof content === 'string' ? translateToastMessage(content) : content
    }
  }

  return message
}

const baseToasterStyle = {
  '--normal-bg': 'var(--toast-bg,var(--popover))',
  '--normal-text': 'var(--toast-fg,var(--popover-foreground))',
  '--normal-border': 'var(--toast-border,var(--border))',
  '--success-bg': 'var(--toast-success-bg)',
  '--success-text': 'var(--toast-success-fg)',
  '--error-bg': 'var(--toast-error-bg)',
  '--error-text': 'var(--toast-error-fg)',
  '--warning-bg': 'var(--toast-warning-bg)',
  '--warning-text': 'var(--toast-warning-fg)',
  '--info-bg': 'var(--toast-info-bg)',
  '--info-text': 'var(--toast-info-fg)',
} as CSSProperties

const Toaster = ({
  className,
  style,
  richColors,
  toastOptions,
  ...props
}: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const mergedStyle: CSSProperties = { ...baseToasterStyle, ...style }
  const shouldApplyBaseToastStyle = toastOptions?.unstyled !== true
  const mergedToastOptions = shouldApplyBaseToastStyle
    ? {
        ...toastOptions,
        style: {
          ...baseToasterStyle,
          ...toastOptions?.style,
        },
      }
    : toastOptions

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      richColors={richColors ?? true}
      className={cn('toaster group', className)}
      style={mergedStyle}
      closeButton={true}
      toastOptions={mergedToastOptions}
      {...props}
    />
  )
}

const toast = Object.assign(
  (message: ToastContent, data?: ExternalToast) =>
    sonnerToast(normalizeToastContent(message), data),
  sonnerToast,
  {
    success: (message: ToastContent, data?: ExternalToast) =>
      sonnerToast.success(normalizeToastContent(message), data),
    error: (message: ToastContent, data?: ExternalToast) =>
      sonnerToast.error(normalizeToastContent(message), data),
    info: (message: ToastContent, data?: ExternalToast) =>
      sonnerToast.info(normalizeToastContent(message), data),
    warning: (message: ToastContent, data?: ExternalToast) =>
      sonnerToast.warning(normalizeToastContent(message), data),
    loading: (message: ToastContent, data?: ExternalToast) =>
      sonnerToast.loading(normalizeToastContent(message), data),
    message: (message: ToastContent, data?: ExternalToast) =>
      sonnerToast.message(normalizeToastContent(message), data),
  }
) as typeof sonnerToast

const quickMsg = {
  success: (message: ToastContent, data?: ExternalToast) =>
    toast.success(message, { position: 'top-center', ...data }),
  error: (message: ToastContent, data?: ExternalToast) =>
    toast.error(message, { position: 'top-center', ...data }),
  info: (message: ToastContent, data?: ExternalToast) =>
    toast.info(message, { position: 'top-center', ...data }),
  warning: (message: ToastContent, data?: ExternalToast) =>
    toast.warning(message, { position: 'top-center', ...data }),
  loading: (message: ToastContent, data?: ExternalToast) =>
    toast.loading(message, { position: 'top-center', ...data }),
}

export * from 'sonner'
export { Toaster, quickMsg, toast }
