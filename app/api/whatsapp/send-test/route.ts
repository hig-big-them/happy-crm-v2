import { NextRequest, NextResponse } from 'next/server'
import { createWhatsAppService } from '@/lib/services/whatsapp-cloud-service'
import { createClient } from '@/lib/supabase/client'

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

    console.log('🚀 WhatsApp Cloud API ile mesaj gönderiliyor:')
    console.log('To:', to)
    console.log('Message:', message)

    const whatsappService = createWhatsAppService();
    
    // Override with hardcoded values for testing
    const config = {
      accessToken: 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6',
      phoneNumberId: '793146130539824', // TODO: Update to correct Phone Number ID for +447782610222
      businessAccountId: '640124182025093',
      apiVersion: 'v23.0',
      baseUrl: 'https://graph.facebook.com'
    };

    const result = await whatsappService.sendTextMessage(to, message)

    if (result.success) {
      console.log('✅ WhatsApp mesajı başarıyla gönderildi:', result.messageId)
      
      // Mesajı veritabanına kaydet
      const supabase = createClient()
      await supabase.from('whatsapp_messages').insert({
        message_id: result.messageId,
        to_number: to,
        message_type: 'text',
        content: { text: message },
        status: 'sent',
        sent_at: new Date().toISOString(),
        is_incoming: false
      })

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'WhatsApp Cloud API ile mesaj başarıyla gönderildi!'
      })
    } else {
      console.error('❌ WhatsApp mesajı gönderilemedi:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('WhatsApp test mesajı gönderme hatası:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp Cloud API Test Endpoint',
    usage: 'POST /api/whatsapp/send-test',
    body: {
      to: '905327994223',
      message: 'Test mesajı'
    },
    config: {
      phoneNumberId: '793146130539824',
      apiVersion: 'v23.0',
      status: 'Gerçek WhatsApp Cloud API aktif'
    }
  })
}
