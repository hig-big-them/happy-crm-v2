import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const businessAccountId = '640124182025093'
    const accessToken = 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6'

    const url = `https://graph.facebook.com/v23.0/${businessAccountId}/message_templates?access_token=${accessToken}`

    console.log('📋 WhatsApp template\'leri alınıyor...')
    console.log('URL:', url)

    const response = await fetch(url)
    const data = await response.json()

    console.log('📡 WhatsApp Template Response:')
    console.log('Status:', response.status)
    console.log('Data:', data)

    if (response.ok) {
      return NextResponse.json({
        success: true,
        templates: data.data || [],
        message: 'WhatsApp template\'leri başarıyla alındı'
      })
    } else {
      console.error('❌ WhatsApp template\'leri alınamadı:', data)
      return NextResponse.json({
        success: false,
        error: 'Template\'ler alınamadı',
        details: data
      }, { status: response.status })
    }

  } catch (error) {
    console.error('WhatsApp template\'leri alma hatası:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
