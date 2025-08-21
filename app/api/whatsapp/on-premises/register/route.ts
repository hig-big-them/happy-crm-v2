import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cc, phone_number, method, cert, pin } = body

    // Gerekli parametreleri kontrol et
    if (!cc || !phone_number || !method || !cert) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: cc, phone_number, method, cert'
      }, { status: 400 })
    }

    // On-Premises API endpoint
    const onPremisesUrl = process.env.WHATSAPP_ON_PREMISES_URL || 'https://your-on-premises-server.com'
    const url = `${onPremisesUrl}/v1/account`

    console.log('🔧 WhatsApp On-Premises API Registration:')
    console.log('URL:', url)
    console.log('Country Code:', cc)
    console.log('Phone Number:', phone_number)
    console.log('Method:', method)
    console.log('Certificate Length:', cert.length)

    const requestBody = {
      cc,
      phone_number,
      method,
      cert,
      ...(pin && { pin })
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

    console.log('📡 On-Premises API Response:')
    console.log('Status:', response.status)
    console.log('Data:', data)

    if (response.status === 201) {
      return NextResponse.json({
        success: true,
        message: 'Account already exists and is registered',
        status: 'registered',
        data
      })
    } else if (response.status === 202) {
      return NextResponse.json({
        success: true,
        message: 'Registration code sent. Check your SMS or voice call.',
        status: 'pending_verification',
        data
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'On-Premises API Error',
        details: data,
        status: response.status
      }, { status: response.status })
    }

  } catch (error) {
    console.error('WhatsApp On-Premises registration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp On-Premises API Registration Endpoint',
    usage: 'POST /api/whatsapp/on-premises/register',
    body: {
      cc: '44',
      phone_number: '7782610222',
      method: 'sms',
      cert: 'YOUR_BASE64_CERTIFICATE',
      pin: '123456' // optional
    },
    note: 'Bu endpoint WhatsApp On-Premises API kullanır. On-Premises server URL\'ini yapılandırın.'
  })
}
