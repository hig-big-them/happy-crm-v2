import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cc, phone_number, code } = body

    // Gerekli parametreleri kontrol et
    if (!cc || !phone_number || !code) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: cc, phone_number, code'
      }, { status: 400 })
    }

    // On-Premises API endpoint
    const onPremisesUrl = process.env.WHATSAPP_ON_PREMISES_URL || 'https://your-on-premises-server.com'
    const url = `${onPremisesUrl}/v1/account/verify`

    console.log('🔧 WhatsApp On-Premises API Verification:')
    console.log('URL:', url)
    console.log('Country Code:', cc)
    console.log('Phone Number:', phone_number)
    console.log('Code Length:', code.length)

    const requestBody = {
      cc,
      phone_number,
      code
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_ON_PREMISES_TOKEN || ''}`
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    console.log('📡 On-Premises API Verification Response:')
    console.log('Status:', response.status)
    console.log('Data:', data)

    if (response.status === 200) {
      return NextResponse.json({
        success: true,
        message: 'Account verification completed successfully',
        status: 'verified',
        data
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'On-Premises API Verification Error',
        details: data,
        status: response.status
      }, { status: response.status })
    }

  } catch (error) {
    console.error('WhatsApp On-Premises verification error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp On-Premises API Verification Endpoint',
    usage: 'POST /api/whatsapp/on-premises/verify',
    body: {
      cc: '44',
      phone_number: '7782610222',
      code: '123456' // SMS/voice ile gelen kod
    },
    note: 'Bu endpoint WhatsApp On-Premises API kullanır. Registration sonrası doğrulama için kullanılır.'
  })
}
