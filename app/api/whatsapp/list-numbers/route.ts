import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0'

    if (!businessAccountId || !accessToken) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp credentials not configured',
        missing: {
          businessAccountId: !businessAccountId,
          accessToken: !accessToken
        }
      }, { status: 400 })
    }

    // WhatsApp Business API'den phone number'ları listele
    const url = `https://graph.facebook.com/${apiVersion}/${businessAccountId}/phone_numbers?access_token=${accessToken}`
    
    console.log('🔍 Listing WhatsApp phone numbers...')
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
      phoneNumbers: data.data || [],
      config: {
        businessAccountId,
        apiVersion,
        accessTokenConfigured: !!accessToken
      }
    })

  } catch (error) {
    console.error('WhatsApp list numbers error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
