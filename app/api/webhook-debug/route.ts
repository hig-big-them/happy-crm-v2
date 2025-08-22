import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  try {
    // Webhook loglarını kontrol et
    const { data: webhookLogs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('processed_at', { ascending: false })
      .limit(10);

    // Son mesajları kontrol et
    const { data: recentMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Lead'leri kontrol et
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, lead_name, contact_phone')
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        webhook_logs: webhookLogs || [],
        recent_messages: recentMessages || [],
        leads: leads || [],
        errors: {
          logs: logsError,
          messages: messagesError,
          leads: leadsError
        }
      }
    });

  } catch (error) {
    console.error('Webhook debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { action = 'test_message_insert' } = body;

    if (action === 'test_message_insert') {
      // Test mesajı direkt ekle - minimal fields
      const testMessage = {
        channel: 'whatsapp',
        direction: 'inbound', // Mevcut tabloda "inbound/outbound" kullanılıyor
        content: 'Test mesajı - webhook debug'
      };

      const { data: insertedMessage, error: insertError } = await supabase
        .from('messages')
        .insert(testMessage)
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to insert test message',
          details: insertError
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Test message inserted successfully',
        data: insertedMessage
      });
    }

    if (action === 'check_messages_table') {
      // Messages tablosunun yapısını kontrol et
      const { data, error } = await supabase
        .rpc('get_table_info', { table_name: 'messages' });

      return NextResponse.json({
        success: true,
        table_info: data,
        error: error
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });

  } catch (error) {
    console.error('Webhook debug POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
