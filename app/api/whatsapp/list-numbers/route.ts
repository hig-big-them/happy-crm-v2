import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use hardcoded credentials like other WhatsApp endpoints
    const businessAccountId = '640124182025093'
    const accessToken = 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6'
    const apiVersion = 'v23.0'

    // WhatsApp Business API'den phone number'ları listele
    const url = `https://graph.facebook.com/${apiVersion}/${businessAccountId}/phone_numbers?access_token=${accessToken}`
    
    console.log('🔍 Listing WhatsApp phone numbers...')
    console.log('URL:', url.replace(accessToken, '***HIDDEN***'))

    const response = await fetch(url)
    const data = await response.json()

    console.log('📡 WhatsApp Phone Numbers Response:')
    console.log('Status:', response.status)
    console.log('Data:', data)

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
