import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Güvenli olmayan bilgileri gizle
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPassword: !!process.env.SMTP_PASSWORD,
      hasSmtpFromEmail: !!process.env.SMTP_FROM_EMAIL,
      hasSmtpFromName: !!process.env.SMTP_FROM_NAME,
    }

    console.log('🔍 Environment check:', envCheck)

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment variables checked'
    })

  } catch (error) {
    console.error('💥 Environment check error:', error)
    return NextResponse.json(
      { error: 'Environment check failed' },
      { status: 500 }
    )
  }
}
