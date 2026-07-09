import * as React from 'react'

import { cn } from '../../lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'resize-none flex field-sizing-content min-h-16 w-full rounded-md shadow-xs transition-[color,box-shadow] outline-none',
        'border border-[var(--input-border,var(--border))]',
        'bg-[var(--input-bg,transparent)]',
        'px-3 py-2 text-base md:text-sm',
        'text-[var(--input-fg,var(--foreground))]',
        'placeholder:text-[var(--input-placeholder,var(--muted-foreground))]',
        'hover:border-[var(--input-hover-border,var(--border))]',
        'focus-visible:border-[var(--input-focus-border,var(--ring))]',
        'focus-visible:ring-[var(--input-focus-ring,var(--ring))]/50',
        'focus-visible:ring-[3px]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'disabled:bg-[var(--input-disabled-bg,var(--muted))]',
        'disabled:text-[var(--input-disabled-fg,var(--muted-foreground))]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
