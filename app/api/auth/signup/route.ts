import { NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, businessCode, phone, whatsappData } = await request.json()

    // Validation
    if (!firstName || !lastName || !email || !businessCode || !whatsappData) {
      return NextResponse.json(
        { error: 'Tüm gerekli alanlar doldurulmalıdır' },
        { status: 400 }
      )
    }

    const supabase = createServerActionClient<Database>({ cookies })

    console.log('📝 Creating user account with WhatsApp data:', {
      firstName,
      lastName,
      email,
      businessCode,
      waba_id: whatsappData.waba_id,
      phone_number_id: whatsappData.phone_number_id
    })

    // 1. Kullanıcı hesabı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: generateTemporaryPassword(), // Geçici şifre oluştur
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          business_code: businessCode,
          phone: phone || null,
          role: 'agency' // Varsayılan rol
        }
      }
    })

    if (authError) {
      console.error('❌ Auth signup error:', authError)
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

    // 2. WhatsApp hesabı bilgilerini kaydet
    const { error: whatsappError } = await supabase
      .from('whatsapp_accounts')
      .insert({
        user_id: userId,
        waba_id: whatsappData.waba_id,
        phone_number_id: whatsappData.phone_number_id,
        verified_name: whatsappData.verified_name,
        display_phone_number: whatsappData.display_phone_number,
        status: whatsappData.status || 'active',
        quality_rating: whatsappData.quality_rating,
        business_code: businessCode,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (whatsappError) {
      console.error('❌ WhatsApp account save error:', whatsappError)
      // Kullanıcı oluşturuldu ama WhatsApp bilgileri kaydedilemedi
      // Kullanıcıyı sil ve hata döndür
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'WhatsApp hesabı bilgileri kaydedilemedi' },
        { status: 500 }
      )
    }

    // 3. Kullanıcı profilini güncelle
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        business_code: businessCode,
        phone: phone || null,
        whatsapp_connected: true,
        whatsapp_waba_id: whatsappData.waba_id,
        whatsapp_phone_number_id: whatsappData.phone_number_id,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('❌ Profile update error:', profileError)
      // Kritik değil, devam et
    }

    console.log('✅ User account created successfully:', {
      userId,
      email,
      waba_id: whatsappData.waba_id
    })

    return NextResponse.json({
      success: true,
      message: 'Hesap başarıyla oluşturuldu',
      user: {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        business_code: businessCode,
        whatsapp_connected: true,
        whatsapp_data: {
          waba_id: whatsappData.waba_id,
          phone_number_id: whatsappData.phone_number_id,
          verified_name: whatsappData.verified_name,
          display_phone_number: whatsappData.display_phone_number
        }
      }
    })

  } catch (error) {
    console.error('💥 Signup error:', error)
    return NextResponse.json(
      { error: 'Hesap oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

// Geçici şifre oluştur (kullanıcı daha sonra değiştirecek)
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
