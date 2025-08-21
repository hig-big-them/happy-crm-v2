import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0'

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp credentials not configured',
        missing: {
          phoneNumberId: !phoneNumberId,
          accessToken: !accessToken
        }
      }, { status: 400 })
    }

    // WhatsApp Business API'den phone number bilgilerini al
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}?access_token=${accessToken}`
    
    console.log('🔍 Checking WhatsApp phone number status...')
    console.log('URL:', url.replace(accessToken, '***HIDDEN***'))

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp API Error',
        details: data,
        status: response.status
      }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      phoneNumber: data,
      config: {
        phoneNumberId,
        apiVersion,
        accessTokenConfigured: !!accessToken
      }
    })

  } catch (error) {
    console.error('WhatsApp status check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
