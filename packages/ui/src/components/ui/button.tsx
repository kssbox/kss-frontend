import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { debounce as debounceFn } from 'lodash-es'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--button-primary-bg)]',
          'text-[var(--button-primary-fg)]',
          'border-[var(--button-primary-border)]',
          'hover:bg-[var(--button-primary-hover-bg)]',
          'active:bg-[var(--button-primary-active-bg)]',
          'disabled:bg-[var(--button-primary-disabled-bg)]',
          'disabled:text-[var(--button-primary-disabled-fg)]',
        ].join(' '),
        destructive: [
          'bg-[var(--button-destructive-bg)]',
          'text-[var(--button-destructive-fg)]',
          'border-[var(--button-destructive-border)]',
          'hover:bg-[var(--button-destructive-hover-bg)]',
          'active:bg-[var(--button-destructive-active-bg)]',
          'disabled:bg-[var(--button-destructive-disabled-bg)]',
          'focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        ].join(' '),
        outline: [
          'border',
          'bg-[var(--button-outline-bg)]',
          'text-[var(--button-outline-fg)]',
          'border-[var(--button-outline-border)]',
          'hover:bg-[var(--button-outline-hover-bg)]',
          'hover:border-[var(--button-outline-hover-border)]',
          'active:bg-[var(--button-outline-active-bg)]',
          'disabled:text-[var(--button-outline-disabled-fg)]',
        ].join(' '),
        secondary: [
          'bg-[var(--button-secondary-bg)]',
          'text-[var(--button-secondary-fg)]',
          'border-[var(--button-secondary-border)]',
          'hover:bg-[var(--button-secondary-hover-bg)]',
          'active:bg-[var(--button-secondary-active-bg)]',
          'disabled:bg-[var(--button-secondary-disabled-bg)]',
          'disabled:text-[var(--button-secondary-disabled-fg)]',
        ].join(' '),
        ghost: [
          'bg-[var(--button-ghost-bg)]',
          'text-[var(--button-ghost-fg)]',
          'hover:bg-[var(--button-ghost-hover-bg)]',
          'active:bg-[var(--button-ghost-active-bg)]',
          'disabled:text-[var(--button-ghost-disabled-fg)]',
        ].join(' '),
        link: [
          'text-[var(--button-link-fg)]',
          'hover:text-[var(--button-link-hover-fg)]',
          'active:text-[var(--button-link-active-fg)]',
          'underline-offset-4 hover:underline',
        ].join(' '),
      },
      size: {
        xs: 'h-6 px-1.5 rounded-sm gap-0.5 text-xs has-[>svg]:px-1',
        sm: 'h-7 px-2 gap-1 text-sm has-[>svg]:px-1.5',
        md: 'h-8 px-3 gap-1.5 text-sm has-[>svg]:px-2',
        lg: 'h-9 px-4 py-2 gap-2 has-[>svg]:px-3',
        xl: 'h-10 rounded-md px-6 has-[>svg]:px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

// 默认防抖时间（毫秒）
const DEFAULT_DEBOUNCE_WAIT = 500

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * 是否启用防抖
   * - true: 使用默认防抖时间（500ms）
   * - number: 使用指定的防抖时间（毫秒）
   * - false | 0: 关闭防抖
   * @default true
   */
  debounce?: boolean | number
  /**
   * 防抖模式：是否在第一次点击时立即执行
   * - true: 第一次点击立即执行，后续点击进行防抖（leading 模式）
   * - false: 等待防抖时间结束后才执行（trailing 模式）
   * @default true
   */
  debounceLeading?: boolean
}

function Button({
  className,
  variant = 'default',
  size = 'md',
  asChild = false,
  debounce = true, // 默认启用防抖
  debounceLeading = true, // 默认先执行第一次
  onClick,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  // 计算实际防抖时间
  const debounceWait = React.useMemo(() => {
    if (debounce === true) return DEFAULT_DEBOUNCE_WAIT
    if (typeof debounce === 'number') return debounce > 0 ? debounce : 0
    return 0
  }, [debounce])

  // 使用 ref 存储最新的 onClick，避免因为 onClick 引用改变而重新创建防抖函数
  const onClickRef = React.useRef(onClick)
  React.useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  // 使用 useRef 存储每个按钮实例独立的 debounced 函数
  interface DebouncedClickHandler {
    (e: React.MouseEvent<HTMLButtonElement>): void
    cancel(): void
  }
  const debouncedClickRef = React.useRef<DebouncedClickHandler | null>(null)

  // 只在防抖参数改变时创建 debounced 函数
  React.useEffect(() => {
    if (debounceWait) {
      // 创建一个调用最新 onClick 的函数
      debouncedClickRef.current = debounceFn((e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClickRef.current) {
          onClickRef.current(e)
        }
      }, debounceWait, {
        leading: debounceLeading,
        trailing: !debounceLeading,
      })
    } else {
      debouncedClickRef.current = null
    }

    // 清理函数
    return () => {
      if (debouncedClickRef.current) {
        debouncedClickRef.current.cancel()
      }
    }
  }, [debounceWait, debounceLeading])

  // 决定使用哪个 onClick
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (debounceWait && debouncedClickRef.current) {
        debouncedClickRef.current(e)
      } else if (onClickRef.current) {
        onClickRef.current(e)
      }
    },
    [debounceWait]
  )

  return (
    <Comp
      data-slot="button"
      className={cn(
        'cursor-pointer',
        buttonVariants({ variant, size, className })
      )}
      onClick={handleClick}
      type={asChild ? type : (type ?? 'button')}
      {...props}
    />
  )
}

export { Button, buttonVariants }
