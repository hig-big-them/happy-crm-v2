import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/service'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  try {
    // WhatsApp mesajlarını getir
    const { data: messages, error: messagesError } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(20)

    if (messagesError) {
      console.error('WhatsApp mesajları yüklenirken hata:', messagesError)
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    // Webhook loglarını getir
    const { data: webhookLogs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('service', 'whatsapp')
      .order('processed_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('Webhook logları yüklenirken hata:', logsError)
    }

    // Lead'leri getir
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, lead_name, contact_phone, source')
      .eq('source', 'whatsapp_incoming')
      .order('created_at', { ascending: false })
      .limit(10)

    if (leadsError) {
      console.error('Lead\'ler yüklenirken hata:', leadsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        webhookLogs: webhookLogs || [],
        leads: leads || [],
        summary: {
          totalMessages: messages?.length || 0,
          totalWebhookLogs: webhookLogs?.length || 0,
          totalLeads: leads?.length || 0
        }
      }
    })

  } catch (error) {
    console.error('Debug endpoint hatası:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_test_message':
        // Test mesajı oluştur
        const { data: testMessage, error: insertError } = await supabase
          .from('whatsapp_messages')
          .insert({
            message_id: 'test-' + Date.now(),
            from_number: '905327994223',
            to_number: '905327994223',
            message_type: 'text',
            content: {
              text: 'Test mesajı - ' + new Date().toISOString(),
              type: 'text'
            },
            status: 'received',
            received_at: new Date().toISOString(),
            is_incoming: true
          })
          .select()
          .single()

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: testMessage })

      case 'create_test_lead':
        // Test lead oluştur
        const { data: testLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            lead_name: 'Test WhatsApp Lead',
            contact_phone: '905327994223',
            source: 'whatsapp_incoming',
            description: 'Test lead oluşturuldu',
            priority: 'Orta'
          })
          .select()
          .single()

        if (leadError) {
          return NextResponse.json({ error: leadError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: testLead })

      case 'clear_test_data':
        // Test verilerini temizle
        await supabase
          .from('whatsapp_messages')
          .delete()
          .like('message_id', 'test-%')

        await supabase
          .from('leads')
          .delete()
          .eq('lead_name', 'Test WhatsApp Lead')

        return NextResponse.json({ success: true, message: 'Test verileri temizlendi' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Debug POST hatası:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
