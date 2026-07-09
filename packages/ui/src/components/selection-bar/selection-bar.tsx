import { Check } from 'lucide-react'
import * as React from 'react'
import type { ReactNode } from 'react'

export interface SelectionBarProps {
  /**
   * Number of selected items
   */
  count: number
  /**
   * Whether the selection bar is visible
   */
  visible?: boolean
  /**
   * Custom actions to display in the selection bar
   */
  actions?: ReactNode
  /**
   * Custom label for the count display
   * @default "个已选中"
   */
  countLabel?: string
  /**
   * Optional anchor attribute to position the bar
   * If provided, the bar will align with the element that has [data-selection-anchor]
   */
  useAnchor?: boolean
  /**
   * Additional class name for the container
   */
  className?: string
}

export function SelectionBar({
  count,
  visible = true,
  actions,
  countLabel = '个已选中',
  useAnchor = true,
  className = '',
}: SelectionBarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({})

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined' || !visible) {
      return undefined
    }

    if (!useAnchor) {
      setStyle({
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(100%, 1024px)',
      })
      return
    }

    const anchor = containerRef.current?.closest<HTMLElement>(
      '[data-selection-anchor]'
    )
    if (!anchor) {
      setStyle({
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(100%, 1024px)',
      })
      return
    }

    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect()
      setStyle({
        left: rect.left + window.scrollX,
        width: rect.width,
        transform: 'translateX(0)',
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [visible, useAnchor])

  if (!visible || count === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed bottom-6 z-40 flex justify-center px-4 ${className}`}
      style={style}
    >
      <div
        className="pointer-events-auto w-full max-w-5xl rounded-xl bg-primary px-6 py-4 shadow-2xl border border-primary-foreground/10 [&_button.border]:hover:text-primary"
        style={
          {
            '--button-outline-fg': 'var(--primary-foreground)',
            '--button-outline-border': 'var(--primary-foreground)',
            '--button-outline-hover-bg': 'var(--primary-foreground)',
            '--button-outline-hover-border': 'var(--primary-foreground)',
          } as React.CSSProperties
        }
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* 选中计数 */}
          <div className="flex items-center gap-3 text-primary-foreground">
            <Check className="h-5 w-5" />
            <span>
              {count} {countLabel}
            </span>
          </div>

          {/* 操作按钮 */}
          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>
      </div>
    </div>
  )
}
