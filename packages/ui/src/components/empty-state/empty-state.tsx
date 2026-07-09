import React from 'react'
import { ImageWithFallback } from './image-with-fallback'
import { Button } from '../ui/button'

export interface EmptyStateProps {
  /** 图片地址 */
  image?: string
  /** 图片替代文本 */
  imageAlt?: string
  /** 图片宽度 */
  imageWidth?: number
  /** 图片高度 */
  imageHeight?: number
  /** 标题文案 */
  title?: string
  /** 描述文案 */
  description?: string
  /** 按钮文案 */
  buttonText?: string
  /** 按钮点击事件 */
  onButtonClick?: () => void
  /** 是否显示按钮 */
  showButton?: boolean
  /** 按钮图标（可选） */
  buttonIcon?: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 自定义图标 */
  icon?: React.ReactNode
  /** 辅助文本 */
  helperText?: string
  /** 样式变体 */
  variant?: 'default' | 'animated'
  /** 尺寸，compact 适合嵌入表格等紧凑场景 */
  size?: 'default' | 'compact'
}

export function EmptyState({
  image,
  imageAlt = '暂无数据',
  imageWidth = 200,
  imageHeight = 200,
  title = '暂无数据',
  description,
  buttonText,
  onButtonClick,
  showButton = true,
  buttonIcon,
  className = '',
  icon,
  helperText,
  variant = 'default',
  size = 'default',
}: EmptyStateProps) {
  const isCompact = size === 'compact'

  if (isCompact) {
    return (
      <div
        className={`w-full flex flex-col items-center justify-center min-h-[160px] py-6 px-4 text-center ${className}`}
      >
        <div className="relative mb-4">
          <div className="relative w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            {icon ? (
              <div className="w-10 h-10 flex items-center justify-center text-muted-foreground">
                {icon}
              </div>
            ) : (
              <svg
                className="w-8 h-8 text-muted-foreground/50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V7.5M3.75 7.5h16.5"
                />
              </svg>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center min-h-[400px] py-8 px-4 text-center ${className}`}
    >
      {/* Illustration Area */}
      <div className="relative mb-8">
        {/* Animated Background Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-2xl opacity-30"></div>

        {/* The Main Icon Circle or Image */}
        <div
          className={`relative w-40 h-40 ${variant === 'animated' ? 'bg-gradient-to-br from-violet-100 to-indigo-100' : 'bg-gray-100'} rounded-full flex items-center justify-center shadow-inner`}
        >
          {image ? (
            <ImageWithFallback
              src={image}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className="object-contain rounded-2xl shadow-xl"
            />
          ) : icon ? (
            <div
              className={`relative z-10 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center ${variant === 'animated' ? 'transform rotate-2 hover:rotate-0 transition-transform duration-500' : ''}`}
            >
              {icon}
            </div>
          ) : null}

          {/* Floating Accents */}
          <div className="absolute -top-4 -right-4 w-4 h-4 bg-violet-200 rounded-full animate-bounce delay-150"></div>
          <div className="absolute top-10 -left-6 w-3 h-3 bg-indigo-200 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-violet-50 rounded-full border-2 border-violet-100"></div>
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-500 max-w-lg mb-10 leading-relaxed text-sm">
        {description}
      </p>

      {/* Action Button */}
      {showButton && buttonText && (
        <Button
          size="xl"
          onClick={onButtonClick}
          className={
            variant === 'animated'
              ? 'group relative inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-semibold overflow-hidden hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95'
              : ''
          }
        >
          <span
            className={`flex items-center gap-2 ${variant === 'animated' ? 'relative z-10' : ''}`}
          >
            {buttonIcon}
            {buttonText}
          </span>
          {variant === 'animated' && (
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
        </Button>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="mt-6 text-[11px] text-slate-400 font-medium">
          {helperText}
        </p>
      )}
    </div>
  )
}
