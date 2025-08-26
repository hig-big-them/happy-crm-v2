import { NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { sendEmailTemplate } from '@/lib/services/email-service'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Supabase bağlantısını kontrol et
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase configuration missing')
      return NextResponse.json(
        { error: 'Veritabanı bağlantısı yapılandırılmamış' },
        { status: 500 }
      )
    }

    const supabase = createServerActionClient<Database>({ cookies })

    console.log('📝 Creating simple user account:', { email })

    try {
      // Kullanıcı hesabı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'agency' // Varsayılan rol
          }
        }
      })

      if (authError) {
        console.error('❌ Auth signup error:', authError)
        
        // Email zaten kullanımda mı kontrol et
        if (authError.message.includes('already registered')) {
          return NextResponse.json(
            { error: 'Bu email adresi zaten kullanımda' },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { error: 'Kullanıcı hesabı oluşturulamadı: ' + authError.message },
          { status: 400 }
        )
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Kullanıcı hesabı oluşturulamadı' },
          { status: 500 }
        )
      }

      const userId = authData.user.id

      // Kullanıcı profilini oluştur
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            whatsapp_connected: false,
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('❌ Profile creation error:', profileError)
          // Kritik değil, devam et
        }
      } catch (profileError) {
        console.error('❌ Profile creation failed:', profileError)
        // Kritik değil, devam et
      }

      console.log('✅ Simple user account created successfully:', {
        userId,
        email
      })

      // Hoş geldin emaili gönder (opsiyonel)
      try {
        // SMTP ayarları var mı kontrol et
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
          const emailResult = await sendEmailTemplate(
            email,
            'WELCOME_SIGNUP',
            {
              userEmail: email
            }
          )

          if (emailResult.success) {
            console.log('✅ Welcome email sent successfully:', emailResult.messageId)
          } else {
            console.warn('⚠️ Welcome email could not be sent:', emailResult.error)
          }
        } else {
          console.log('ℹ️ SMTP settings not configured, skipping welcome email')
        }
      } catch (emailError) {
        console.error('❌ Welcome email error:', emailError)
        // Email hatası kritik değil, devam et
      }

      return NextResponse.json({
        success: true,
        message: 'Hesap başarıyla oluşturuldu',
        user: {
          id: userId,
          email
        }
      })

    } catch (error) {
      console.error('💥 Simple signup error:', error)
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Hesap oluşturulurken hata oluştu'
      
      if (error instanceof Error) {
        console.error('Error details:', error.message)
        errorMessage = `Hesap oluşturulurken hata oluştu: ${error.message}`
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('💥 Simple signup error:', error)
    
    // Daha detaylı hata mesajı
    let errorMessage = 'Hesap oluşturulurken hata oluştu'
    
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      errorMessage = `Hesap oluşturulurken hata oluştu: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
