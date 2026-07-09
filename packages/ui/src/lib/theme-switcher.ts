/**
 * Theme Switcher Utility
 * 全局明亮 / 暗黑模式切换。
 *
 * 设计说明：
 *   - 对外 API 使用 `light` | `dark`（语义清晰）
 *   - DOM 直接写 `data-theme="light|dark"`
 *   - 兼容历史值：`default` → `light`，`pro` → `light`（pro 已废弃为仅装饰用）
 */

export type ThemeMode = 'light' | 'dark'

// 历史兼容：旧版可能还在用的值
export type LegacyThemeName = 'default' | 'pro'
export type ThemeName = ThemeMode | LegacyThemeName

// 旧 colorMode 兼容签名
export type ColorMode = 'light' | 'dark'

const STORAGE_KEY = 'kssbox-theme'

function normalize(value: string | null | undefined): ThemeMode {
  if (value === 'dark') return 'dark'
  return 'light'
}

/**
 * 设置当前主题模式（首选 API）。
 * 第二参数保留是为了兼容历史调用形式 `setTheme('default', 'dark')`。
 */
export function setTheme(
  name: ThemeName,
  legacyColorMode?: ColorMode,
  element: HTMLElement = typeof document !== 'undefined'
    ? document.documentElement
    : (undefined as unknown as HTMLElement)
): void {
  if (!element) return

  const mode: ThemeMode =
    legacyColorMode === 'dark' || legacyColorMode === 'light'
      ? legacyColorMode
      : normalize(name)

  element.setAttribute('data-theme', mode)
  if (mode === 'dark') {
    element.classList.add('dark')
  } else {
    element.classList.remove('dark')
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore quota */
    }
  }
}

export function getTheme(
  element: HTMLElement = typeof document !== 'undefined'
    ? document.documentElement
    : (undefined as unknown as HTMLElement)
): { themeName: ThemeMode; colorMode: ColorMode } {
  if (!element) return { themeName: 'light', colorMode: 'light' }
  const mode = normalize(element.getAttribute('data-theme'))
  return { themeName: mode, colorMode: mode }
}

/** 从 localStorage 恢复主题（支持旧 key 迁移） */
export function restoreTheme(
  element: HTMLElement = typeof document !== 'undefined'
    ? document.documentElement
    : (undefined as unknown as HTMLElement)
): void {
  if (typeof window === 'undefined' || !element) return

  let saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    const legacy =
      localStorage.getItem('theme-name') ||
      localStorage.getItem('storeTheme') ||
      null
    if (legacy) {
      saved = normalize(legacy)
      try {
        localStorage.setItem(STORAGE_KEY, saved)
      } catch {
        /* ignore */
      }
    }
  }

  if (!saved && typeof window.matchMedia === 'function') {
    saved = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  setTheme(normalize(saved), undefined, element)
}

/** 在明亮 / 暗黑之间一键切换 */
export function toggleColorMode(
  element: HTMLElement = typeof document !== 'undefined'
    ? document.documentElement
    : (undefined as unknown as HTMLElement)
): ThemeMode {
  if (!element) return 'light'
  const { themeName } = getTheme(element)
  const next: ThemeMode = themeName === 'dark' ? 'light' : 'dark'
  setTheme(next, undefined, element)
  return next
}

/** 监听系统颜色模式变化 */
export function watchSystemColorMode(
  callback: (colorMode: ColorMode) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches ? 'dark' : 'light')
  }
  handler(mq)
  mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void)
  return () => {
    mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void)
  }
}

/**
 * 生成可内联到 <head> 的首屏注入脚本，
 * 在 React 挂载前同步设置 data-theme，避免 FOUC。
 */
export const THEME_BOOT_SCRIPT = `
(function () {
  try {
    var k = '${STORAGE_KEY}';
    var v = localStorage.getItem(k);
    if (!v) {
      var legacy = localStorage.getItem('theme-name') || localStorage.getItem('storeTheme');
      if (legacy === 'dark') v = 'dark';
      else if (legacy === 'light' || legacy === 'default' || legacy === 'pro') v = 'light';
    }
    if (!v) {
      v = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var root = document.documentElement;
    root.setAttribute('data-theme', v);
    if (v === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  } catch (e) { /* noop */ }
})();
`
