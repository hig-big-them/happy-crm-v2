import { NextRequest, NextResponse } from 'next/server'
import { createWhatsAppService } from '@/lib/services/whatsapp-cloud-service'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, templateName, languageCode = 'tr', components = [] } = body

    if (!to || !templateName) {
      return NextResponse.json(
        { error: 'to ve templateName parametreleri gerekli' },
        { status: 400 }
      )
    }

    console.log('🚀 WhatsApp Template mesajı gönderiliyor:')
    console.log('To:', to)
    console.log('Template:', templateName)
    console.log('Language:', languageCode)

    const whatsappService = createWhatsAppService()
    
    // Template mesajı gönder
    const result = await whatsappService.sendSimpleTemplateMessage(to, templateName, languageCode, components)

    if (result.success) {
      console.log('✅ WhatsApp template mesajı başarıyla gönderildi:', result.messageId)
      
      // Mesajı veritabanına kaydet
      const supabase = createClient()
      await supabase.from('whatsapp_messages').insert({
        message_id: result.messageId,
        to_number: to,
        message_type: 'template',
        content: { 
          template_name: templateName,
          language_code: languageCode,
          components: components
        },
        status: 'sent',
        sent_at: new Date().toISOString(),
        is_incoming: false
      })

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'WhatsApp template mesajı başarıyla gönderildi!'
      })
    } else {
      console.error('❌ WhatsApp template mesajı gönderilemedi:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('WhatsApp template mesajı gönderme hatası:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp Template Mesajı Gönderme Endpoint',
    usage: 'POST /api/whatsapp/send-template',
    body: {
      to: '905327994223',
      templateName: 'hello_world',
      languageCode: 'tr',
      components: []
    },
    note: 'Template mesajları 24 saat kuralı için gereklidir'
  })
}
