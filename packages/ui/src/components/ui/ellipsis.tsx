'use client'

import * as React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import { cn } from '../../lib/utils'

export interface EllipsisProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否启用悬浮展示完整文案 */
  enableTooltip?: boolean
  children: string
}

/**
 * Ellipsis 组件
 * 根据容器宽度动态判断是否省略文本，鼠标悬浮能展示全部文案
 * 只支持末尾省略
 * 使用 scrollWidth vs clientWidth 判断是否需要省略，比 Canvas 测量更准确
 */
export const Ellipsis = React.forwardRef<HTMLDivElement, EllipsisProps>(
  ({ enableTooltip = true, children, className, ...props }, ref) => {
    const text = children || ''
    const [needsEllipsis, setNeedsEllipsis] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const textRef = React.useRef<HTMLSpanElement>(null)

    // 使用 scrollWidth vs clientWidth 判断是否发生了文本截断
    React.useEffect(() => {
      const textEl = textRef.current
      if (!textEl) return

      const checkOverflow = () => {
        // 容差 1px，避免 sub-pixel 渲染导致误判
        setNeedsEllipsis(textEl.scrollWidth > textEl.clientWidth + 1)
      }

      checkOverflow()

      const resizeObserver = new ResizeObserver(() => {
        checkOverflow()
      })

      resizeObserver.observe(textEl)

      return () => {
        resizeObserver.disconnect()
      }
    }, [text])

    const content = (
      <span
        ref={textRef}
        className={cn(
          'block w-full overflow-hidden whitespace-nowrap text-ellipsis',
          className
        )}
        title={needsEllipsis && !enableTooltip ? text : undefined}
      >
        {text}
      </span>
    )

    const containerElement = ref || containerRef

    if (enableTooltip && needsEllipsis) {
      return (
        <div
          ref={containerElement as React.RefObject<HTMLDivElement>}
          className="w-full"
          {...props}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="top" className="break-words max-w-xs">
                {text}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }

    return (
      <div
        ref={containerElement as React.RefObject<HTMLDivElement>}
        className="w-full"
        {...props}
      >
        {content}
      </div>
    )
  }
)

Ellipsis.displayName = 'Ellipsis'
