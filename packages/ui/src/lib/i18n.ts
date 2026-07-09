import enUS from '../locales/en-US.json'
import zhCN from '../locales/zh-CN.json'

export type Locale = 'en-US' | 'zh-CN'

const messages: Record<Locale, typeof enUS> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

/**
 * Get the current locale from the browser or default to zh-CN
 * In SSR context, defaults to zh-CN to avoid hydration mismatches
 */
export function getCurrentLocale(): Locale {
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('locale') as Locale | null
    if (savedLocale && (savedLocale === 'en-US' || savedLocale === 'zh-CN')) {
      return savedLocale
    }

    const browserLocale = navigator.language
    if (browserLocale.startsWith('zh')) {
      return 'zh-CN'
    }
  }
  // Default to zh-CN for SSR to match the primary user base
  // This prevents hydration mismatches in Chinese applications
  return 'zh-CN'
}

/**
 * Set the current locale and save to localStorage
 */
export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale)
  }
}

/**
 * Get a message by key path (e.g., 'dataTable.pagination.rowsPerPage')
 * Supports template variables like {{name}}
 */
export function getMessage(
  key: string,
  variables?: Record<string, string> | Locale,
  maybeVariables?: Record<string, string>
): string {
  // Handle overloaded parameters
  let locale: Locale = getCurrentLocale()
  let vars: Record<string, string> | undefined = undefined

  if (typeof variables === 'string' && (variables === 'en-US' || variables === 'zh-CN')) {
    // Second parameter is locale
    locale = variables
    vars = maybeVariables
  } else if (variables && typeof variables === 'object') {
    // Second parameter is variables
    vars = variables
  }

  const keys = key.split('.')
  let value: Record<string, any> | null = messages[locale]

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      // Fallback to en-US if key not found
      value = null
      break
    }
  }

  // If not found in the locale, try en-US as fallback
  if (!value) {
    value = messages['en-US']
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key as last resort
      }
    }
  }

  let message = String(value || key)

  // Replace template variables
  if (vars) {
    Object.entries(vars).forEach(([varKey, varValue]) => {
      message = message.replace(`{{${varKey}}}`, varValue)
    })
  }

  return message
}

/**
 * Hook-like function to get messages for a component
 * Returns a function that gets messages with the current locale
 */
export function useI18n() {
  const locale = getCurrentLocale()

  return {
    t: (key: string, variables?: Record<string, string>) =>
      getMessage(key, locale, variables),
    locale,
  }
}
