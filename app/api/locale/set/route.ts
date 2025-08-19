import { NextResponse } from "next/server"
import { LOCALE_COOKIE, isSupportedLocale } from "@/lib/i18n/config"

export async function POST(req: Request) {
  let locale: string | null = null
  try {
    const data = await req.json()
    locale = data?.locale
  } catch {}

  if (!isSupportedLocale(locale)) {
    return NextResponse.json({ ok: false, error: "unsupported_locale" }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}


