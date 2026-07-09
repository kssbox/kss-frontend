'use client'

import { useCallback, useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import {
  getTheme,
  restoreTheme,
  toggleColorMode,
  type ThemeMode,
} from '../lib/theme-switcher'

interface ThemeToggleProps {
  className?: string
  /** 是否在 SSR 阶段隐藏（避免水合不一致） */
  hideUntilHydrated?: boolean
}

/**
 * 轻量的"明亮 / 暗黑"一键切换图标按钮。
 * 适合放在各应用 Header 右上角作为快速切换入口。
 */
export function ThemeToggle({
  className,
  hideUntilHydrated = true,
}: ThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    restoreTheme()
    setMode(getTheme().themeName)
    setHydrated(true)
  }, [])

  const onClick = useCallback(() => {
    const next = toggleColorMode()
    setMode(next)
  }, [])

  if (hideUntilHydrated && !hydrated) {
    return <span className={cn('inline-block h-9 w-9', className)} aria-hidden />
  }

  const isDark = mode === 'dark'
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={isDark ? '切换到明亮模式' : '切换到暗黑模式'}
      title={isDark ? '切换到明亮模式' : '切换到暗黑模式'}
      className={cn('h-9 w-9 p-0 text-foreground/70 hover:text-primary', className)}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
