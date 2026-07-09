'use client'

import * as React from 'react'
import {
  setTheme,
  getTheme,
  type ThemeName,
  type ColorMode,
} from '../lib/theme-switcher'

interface ThemeContextValue {
  themeName: ThemeName
  colorMode: ColorMode
  setThemeName: (name: ThemeName) => void
  setColorMode: (mode: ColorMode) => void
  toggleColorMode: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
  defaultColorMode?: ColorMode
}

export function ThemeProvider({
  children,
  defaultTheme = 'default',
  defaultColorMode = 'light',
}: ThemeProviderProps) {
  const [themeName, setThemeNameState] = React.useState<ThemeName>(defaultTheme)
  const [colorMode, setColorModeState] =
    React.useState<ColorMode>(defaultColorMode)

  // 初始化时恢复主题
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const savedThemeName =
      (localStorage.getItem('theme-name') as ThemeName) || defaultTheme
    const savedColorMode =
      (localStorage.getItem('theme-color-mode') as ColorMode) ||
      defaultColorMode

    setThemeNameState(savedThemeName)
    setColorModeState(savedColorMode)
    setTheme(savedThemeName, savedColorMode)
  }, [defaultTheme, defaultColorMode])

  const handleSetThemeName = React.useCallback((name: ThemeName) => {
    setThemeNameState(name)
    setTheme(name, undefined)
  }, [])

  const handleSetColorMode = React.useCallback((mode: ColorMode) => {
    setColorModeState(mode)
    const { themeName } = getTheme()
    setTheme(themeName, mode)
  }, [])

  const handleToggleColorMode = React.useCallback(() => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark'
    handleSetColorMode(newMode)
  }, [colorMode, handleSetColorMode])

  const value = React.useMemo(
    () => ({
      themeName,
      colorMode,
      setThemeName: handleSetThemeName,
      setColorMode: handleSetColorMode,
      toggleColorMode: handleToggleColorMode,
    }),
    [
      themeName,
      colorMode,
      handleSetThemeName,
      handleSetColorMode,
      handleToggleColorMode,
    ]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
