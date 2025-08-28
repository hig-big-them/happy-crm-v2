import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Magic link oluştur
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Kullanıcı zaten var
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://happysmileclinic.com'}/welcome`
      }
    })

    if (error) {
      console.error('❌ Magic link error:', error)
      return NextResponse.json(
        { error: 'Magic link oluşturulamadı: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link başarıyla oluşturuldu'
    })

  } catch (error: any) {
    console.error('❌ Magic link API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
