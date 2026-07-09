'use client'
import { ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BackButtonProps {
  onClick?: () => void
  className?: string
  disabled?: boolean
  variant?: 'default' | 'circle'
  ariaLabel?: string
}

export function BackButton({
  onClick,
  className,
  disabled = false,
  variant = 'default',
  ariaLabel = '返回',
}: BackButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center transition-colors cursor-pointer select-none'

  if (variant === 'circle') {
    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : onClick}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick?.()
          }
        }}
        className={cn(
          baseStyles,
          'h-8 text-muted-foreground hover:text-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        title={ariaLabel}
      >
        <ArrowLeft className="w-5 h-5" />
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={e => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={cn(
        baseStyles,
        'size-9 rounded-md shrink-0 hover:bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      title={ariaLabel}
    >
      <ArrowLeft className="h-5 w-5" />
    </div>
  )
}
