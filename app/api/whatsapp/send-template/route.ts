import { NextRequest, NextResponse } from 'next/server'
import { createWhatsAppService } from '@/lib/services/whatsapp-cloud-service'
import { createClient } from '@/lib/supabase/client'
import { rateLimitMiddleware, createRateLimitResponse } from '@/lib/security/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [WhatsApp API] POST /api/whatsapp/send-template - Template message endpoint called');
    console.log('📄 [WhatsApp Business Messaging] Initiating template message send request');
    
    const body = await request.json()
    const { to, templateName, languageCode = 'tr', components = [] } = body

    console.log('📋 [WhatsApp API] Template request payload:', {
      to: to ? `${to.substring(0, 5)}****` : 'undefined',
      templateName,
      languageCode,
      componentsCount: components.length
    });

    if (!to || !templateName) {
      console.log('❌ [WhatsApp API] Validation failed: Missing required parameters (to, templateName)');
      return NextResponse.json(
        { error: 'to ve templateName parametreleri gerekli' },
        { status: 400 }
      )
    }

    // Apply rate limiting for WhatsApp messages
    const rateLimitResult = await rateLimitMiddleware(request, 'whatsapp', `whatsapp:${to}`)
    if (rateLimitResult && !rateLimitResult.success) {
      console.log('⚠️ [WhatsApp API] Rate limit exceeded for template message to:', to.substring(0, 5) + '****')
      return createRateLimitResponse(rateLimitResult, 'Too many WhatsApp messages. Please wait before sending another.')
    }
    
    console.log('✅ [WhatsApp API] Rate limit check passed for template message');
    console.log('🌐 [WhatsApp Business Messaging] Preparing to send template message');
    console.log('📄 [WhatsApp API] Template details:', { name: templateName, language: languageCode });

    console.log('🔧 [WhatsApp API] Creating WhatsApp service instance');
    const whatsappService = createWhatsAppService()
    
    console.log('📡 [WhatsApp Business Messaging] Sending template message via Facebook Graph API');
    console.log('🔑 [WhatsApp Business Messaging] Using access token with whatsapp_business_messaging permission');
    
    // Template mesajı gönder
    const result = await whatsappService.sendSimpleTemplateMessage(to, templateName, languageCode, components)

    if (result.success) {
      console.log('✅ [WhatsApp API] Template message sent successfully');
      console.log('📱 [WhatsApp Business Messaging] Message ID:', result.messageId);
      console.log('💾 [WhatsApp API] Saving message to database');
      
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

      console.log('🎯 [WhatsApp API] Template message endpoint execution completed successfully');

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'WhatsApp template mesajı başarıyla gönderildi!'
      })
    } else {
      console.log('❌ [WhatsApp API] Template message sending failed');
      console.log('🔍 [WhatsApp Business Messaging] Error details:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.log('💥 [WhatsApp API] Unexpected error in template message endpoint');
    console.log('🔍 [WhatsApp Business Messaging] Error details:', error);
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
