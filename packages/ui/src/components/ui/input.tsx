import * as React from 'react'

import { cn } from '../../lib/utils'

function Input({
  className,
  type = 'text',
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md shadow-xs transition-[color,box-shadow] outline-none',
        'px-3 py-1 text-base md:text-sm',
        'bg-[var(--input-bg,transparent)]',
        'text-[var(--input-fg,var(--foreground))]',
        'border border-[var(--input-border,var(--border))]',
        'placeholder:text-[var(--input-placeholder,var(--muted-foreground))]',
        'hover:border-[var(--input-hover-border,var(--border))]',
        'focus-visible:border-[var(--input-focus-border,var(--ring))]',
        'focus-visible:ring-[var(--input-focus-ring,var(--ring))]/50',
        'focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:cursor-not-allowed',
        'disabled:bg-[var(--input-disabled-bg,var(--muted))]',
        'disabled:text-[var(--input-disabled-fg,var(--muted-foreground))]',
        'disabled:opacity-50',
        'selection:bg-primary selection:text-primary-foreground',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'file:text-foreground',
        className
      )}
      {...props}
    />
  )
}

export { Input }
