'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'

const DOT_SPINNER_POINTS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
    opacity: 0.35 + (index / 8) * 0.55,
  }
})

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 加载指示器的大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 加载提示文本 */
  text?: string
  /** 加载指示器类型 */
  variant?: 'spinner' | 'dots' | 'pulse'
  /** 最小高度 */
  minHeight?: string | number
  /** 是否全屏居中 */
  fullscreen?: boolean
}

export interface LoadingIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    container: 'h-20',
    spinner: 'h-4 w-4',
    dots: 'h-6 w-6',
    pulse: 'h-8 w-8',
    radius: 8,
    text: 'text-xs',
  },
  md: {
    container: 'h-32',
    spinner: 'h-6 w-6',
    dots: 'h-10 w-10',
    pulse: 'h-12 w-12',
    radius: 12,
    text: 'text-sm',
  },
  lg: {
    container: 'h-48',
    spinner: 'h-8 w-8',
    dots: 'h-14 w-14',
    pulse: 'h-16 w-16',
    radius: 16,
    text: 'text-base',
  },
  xl: {
    container: 'h-64',
    spinner: 'h-12 w-12',
    dots: 'h-20 w-20',
    pulse: 'h-24 w-24',
    radius: 20,
    text: 'text-lg',
  },
}

const indicatorSizeClasses = {
  xs: {
    container: 'h-3.5 w-3.5',
    dot: 'size-1',
    radius: 5,
  },
  sm: {
    container: 'h-4 w-4',
    dot: 'size-1',
    radius: 6,
  },
  md: {
    container: 'h-6 w-6',
    dot: 'size-1.5',
    radius: 9,
  },
  lg: {
    container: 'h-8 w-8',
    dot: 'size-2',
    radius: 12,
  },
}

/**
 * Unified loading indicator used across page, panel, and inline states.
 */
export function LoadingIndicator({
  size = 'md',
  className,
  ...props
}: LoadingIndicatorProps) {
  const indicator = indicatorSizeClasses[size]

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center text-primary',
        indicator.container,
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <span className="relative h-full w-full animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]">
        {DOT_SPINNER_POINTS.map((point, index) => (
          <span
            key={index}
            className={cn(
              'absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-current',
              indicator.dot
            )}
            style={{
              transform: `translate(${point.x * indicator.radius}px, ${point.y * indicator.radius}px)`,
              opacity: point.opacity,
            }}
          />
        ))}
      </span>
      <span className="sr-only">Loading...</span>
    </span>
  )
}

/**
 * Loading 组件
 *
 * 通用的加载指示器组件，支持多种样式和尺寸
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Loading />
 *
 * // 带文本
 * <Loading text="加载中..." />
 *
 * // 不同尺寸
 * <Loading size="sm" />
 * <Loading size="lg" />
 *
 * // 不同变体
 * <Loading variant="spinner" />
 * <Loading variant="dots" />
 * <Loading variant="pulse" />
 *
 * // 全屏居中
 * <Loading fullscreen text="正在加载数据..." />
 *
 * // 自定义最小高度
 * <Loading minHeight={200} />
 * ```
 */
export function Loading({
  size = 'md',
  text,
  variant = 'dots',
  minHeight,
  fullscreen = false,
  className,
  ...props
}: LoadingProps) {
  const containerStyle = minHeight
    ? {
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      }
    : undefined
  const indicatorSize: LoadingIndicatorProps['size'] =
    size === 'sm' ? 'sm' : size === 'xl' ? 'lg' : size

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        !minHeight && !fullscreen && sizeClasses[size].container,
        fullscreen && 'min-h-screen',
        className
      )}
      style={containerStyle}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-loading-variant={variant}
      {...props}
    >
      <LoadingIndicator size={indicatorSize} />
      {text && (
        <p className={cn('text-muted-foreground', sizeClasses[size].text)}>
          {text}
        </p>
      )}
    </div>
  )
}

/**
 * LoadingOverlay 组件
 *
 * 用于在现有内容上显示加载蒙层
 *
 * @example
 * ```tsx
 * <LoadingOverlay loading={isLoading}>
 *   <YourContent />
 * </LoadingOverlay>
 * ```
 */
export interface LoadingOverlayProps extends Omit<LoadingProps, 'fullscreen'> {
  /** 是否显示加载状态 */
  loading: boolean
  /** 子内容 */
  children: React.ReactNode
  /** 背景模糊程度 */
  blur?: boolean
  /** 背景透明度 */
  opacity?: number
}

export function LoadingOverlay({
  loading,
  children,
  blur = true,
  opacity = 0.1,
  size = 'md',
  text,
  variant = 'dots',
  className,
  ...props
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center',
            blur && 'backdrop-blur-[2px]',
            className
          )}
          style={{ backgroundColor: `rgba(255, 255, 255, ${opacity})` }}
          {...props}
        >
          <Loading size={size} text={text} variant={variant} minHeight="auto" />
        </div>
      )}
    </div>
  )
}

/**
 * LoadingWrapper 组件
 *
 * 根据 loading 状态决定显示加载指示器还是子内容
 *
 * @example
 * ```tsx
 * <LoadingWrapper loading={isLoading} text="正在加载...">
 *   <YourContent />
 * </LoadingWrapper>
 * ```
 */
export interface LoadingWrapperProps extends LoadingProps {
  /** 是否显示加载状态 */
  loading: boolean
  /** 子内容 */
  children: React.ReactNode
}

export function LoadingWrapper({
  loading,
  children,
  ...loadingProps
}: LoadingWrapperProps) {
  if (loading) {
    return <Loading {...loadingProps} />
  }

  return <>{children}</>
}
