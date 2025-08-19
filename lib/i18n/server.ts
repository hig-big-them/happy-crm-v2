import { cookies, headers } from "next/headers"
import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale, type Locale } from "./config"
import { DICTS } from "./dictionaries"

export async function getLocaleFromCookie(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  if (isSupportedLocale(value)) return value

  // Fallback to Accept-Language header
  const hdrs = await headers()
  const acceptLanguage = hdrs.get("accept-language") || ""
  const matched = acceptLanguage
    .split(",")
    .map(s => s.trim().slice(0, 2))
    .find(isSupportedLocale)
  if (matched) return matched

  return DEFAULT_LOCALE
}

export function getDictionary(locale: Locale) {
  return DICTS[locale]
}


