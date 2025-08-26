import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🧪 Test signup attempt:', { email, passwordLength: password?.length })

    // Basit validasyon
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

    // Test başarılı
    console.log('✅ Test signup successful')

    return NextResponse.json({
      success: true,
      message: 'Test kayıt başarılı',
      user: {
        id: 'test-user-id',
        email
      }
    })

  } catch (error) {
    console.error('💥 Test signup error:', error)
    return NextResponse.json(
      { error: 'Test kayıt hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') },
      { status: 500 }
    )
  }
}
