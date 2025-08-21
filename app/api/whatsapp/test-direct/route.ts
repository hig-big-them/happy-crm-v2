import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message } = body

    if (!to || !message) {
      return NextResponse.json(
        { error: 'to ve message parametreleri gerekli' },
        { status: 400 }
      )
    }

    const phoneNumberId = '793146130539824'
    const accessToken = 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6'

    const url = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`

    console.log('🚀 Doğrudan WhatsApp Cloud API test:')
    console.log('URL:', url)
    console.log('To:', to)
    console.log('Message:', message)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      })
    })

    const data = await response.json()

    console.log('📡 WhatsApp Cloud API Response:')
    console.log('Status:', response.status)
    console.log('Data:', data)

    if (response.ok) {
      return NextResponse.json({
        success: true,
        messageId: data.messages?.[0]?.id,
        data: data,
        message: 'WhatsApp Cloud API ile mesaj başarıyla gönderildi!'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp Cloud API Error',
        details: data,
        status: response.status
      }, { status: response.status })
    }

  } catch (error) {
    console.error('WhatsApp direct test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Doğrudan WhatsApp Cloud API Test Endpoint',
    usage: 'POST /api/whatsapp/test-direct',
    body: {
      to: '905327994223',
      message: 'Test mesajı'
    },
    note: 'Bu endpoint doğrudan WhatsApp Cloud API kullanır.'
  })
}
