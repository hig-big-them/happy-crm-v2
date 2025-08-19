"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale } from "./config"
import { DICTS, type Dictionaries } from "./dictionaries"

interface I18nContextValue {
  locale: Locale
  t: Dictionaries
  setLocale: (next: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode, initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const router = useRouter()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return
    setLocaleState(next)
    // store cookie
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
    // refresh RSC tree
    router.refresh()
  }

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    t: DICTS[locale],
    setLocale,
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("I18nProvider missing")
  return ctx
}


