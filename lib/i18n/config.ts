export const SUPPORTED_LOCALES = ["tr", "en"] as const

export type Locale = typeof SUPPORTED_LOCALES[number]

export const DEFAULT_LOCALE: Locale = "tr"

export const LOCALE_COOKIE = "locale"

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  if (!value) return false
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}


