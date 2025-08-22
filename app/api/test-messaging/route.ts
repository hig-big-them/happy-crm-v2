import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { action = 'create_test_data' } = body;

    if (action === 'create_test_data') {
      // Test lead'i oluştur
      const { data: testLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          lead_name: 'Test WhatsApp Lead',
          contact_phone: '+905327994223',
          source: 'whatsapp',
          status: 'new',
          metadata: {
            created_for: 'messaging_test'
          }
        })
        .select()
        .single();

      if (leadError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to create test lead',
          details: leadError
        }, { status: 500 });
      }

      // Test mesajları oluştur
      const messages = [
        {
          lead_id: testLead.id,
          channel: 'whatsapp',
          direction: 'incoming',
          content: 'Merhaba, randevu almak istiyorum.',
          status: 'received',
          metadata: {
            message_id: 'test_msg_1',
            from_number: '+905327994223',
            to_number: '+447782610222'
          }
        },
        {
          lead_id: testLead.id,
          channel: 'whatsapp',
          direction: 'outgoing',
          content: 'Merhaba! Tabii ki, hangi tarih size uygun?',
          status: 'delivered',
          metadata: {
            message_id: 'test_msg_2',
            from_number: '+447782610222',
            to_number: '+905327994223'
          }
        },
        {
          lead_id: testLead.id,
          channel: 'whatsapp',
          direction: 'incoming',
          content: 'Yarın saat 14:00 müsait misiniz?',
          status: 'received',
          metadata: {
            message_id: 'test_msg_3',
            from_number: '+905327994223',
            to_number: '+447782610222'
          }
        }
      ];

      const { data: insertedMessages, error: messagesError } = await supabase
        .from('messages')
        .insert(messages)
        .select();

      if (messagesError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to create test messages',
          details: messagesError
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        testLead,
        messages: insertedMessages,
        message: 'Test data created successfully'
      });
    }

    if (action === 'cleanup_test_data') {
      // Test verilerini temizle
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('metadata->created_for', 'messaging_test');

      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .eq('metadata->created_for', 'messaging_test');

      return NextResponse.json({
        success: true,
        message: 'Test data cleaned up',
        errors: {
          messages: messagesError,
          leads: leadsError
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });

  } catch (error) {
    console.error('Test messaging API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  try {
    // Messages tablosunun durumunu kontrol et
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        lead_id,
        channel,
        direction,
        content,
        status,
        created_at,
        metadata
      `)
      .limit(10)
      .order('created_at', { ascending: false });

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, lead_name, contact_phone, source')
      .limit(5)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        leads: leads || [],
        messagesCount: messages?.length || 0,
        leadsCount: leads?.length || 0
      },
      errors: {
        messages: messagesError,
        leads: leadsError
      }
    });

  } catch (error) {
    console.error('Test messaging GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
