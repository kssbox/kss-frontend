import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-gray-100 text-gray-700 [a&]:hover:bg-gray-200',
        destructive:
          'border-transparent bg-red-100 text-red-700 [a&]:hover:bg-red-200 focus-visible:ring-red-200',
        outline: 'text-foreground border border-gray-300 [a&]:hover:bg-gray-50',
        success:
          'border-transparent bg-green-100 text-green-700 [a&]:hover:bg-green-200',
        warning:
          'border-transparent bg-amber-100 text-amber-700 [a&]:hover:bg-amber-200',
        info: 'border-transparent bg-blue-100 text-blue-700 [a&]:hover:bg-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
