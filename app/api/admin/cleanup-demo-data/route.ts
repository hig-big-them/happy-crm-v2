import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { action, confirm } = body;

    // Güvenlik için confirmation gerekli
    if (!confirm || confirm !== 'DEMO_CLEANUP_CONFIRMED') {
      return NextResponse.json({
        success: false,
        error: 'Cleanup confirmation required',
        required_confirm: 'DEMO_CLEANUP_CONFIRMED'
      }, { status: 400 });
    }

    const results: any = {};

    if (action === 'cleanup_test_messages' || action === 'cleanup_all') {
      console.log('🧹 Cleaning up test messages...');
      
      // Test mesajlarını sil (content'inde "test" geçen mesajlar)
      const { data: deletedMessages, error: messagesError } = await supabase
        .from('messages')
        .delete()
        .or(`
          content.ilike.%test%,
          content.ilike.%debug%,
          content.ilike.%mock%,
          content.ilike.%curl%,
          content.ilike.%API test%,
          content.ilike.%webhook%,
          content.ilike.%constraint%,
          content.ilike.%circular%,
          content.ilike.%final fix%,
          content.ilike.%media_type%,
          content.ilike.%port 3001%,
          content.ilike.%build sonrası%,
          content.ilike.%status sent%,
          content.ilike.%gerçek zamanlı%,
          content.ilike.%production%,
          content.ilike.%basit api%
        `);

      results.messages = {
        deleted: deletedMessages,
        error: messagesError
      };
    }

    if (action === 'cleanup_webhook_logs' || action === 'cleanup_all') {
      console.log('🧹 Cleaning up webhook logs...');
      
      // Test webhook log'larını sil
      const { data: deletedLogs, error: logsError } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('service', 'whatsapp')
        .contains('payload', { 
          entry: [{ 
            changes: [{ 
              value: { 
                messages: [{ 
                  id: 'test' 
                }] 
              } 
            }] 
          }] 
        });

      results.webhook_logs = {
        deleted: deletedLogs,
        error: logsError
      };
    }

    if (action === 'cleanup_auto_leads' || action === 'cleanup_all') {
      console.log('🧹 Cleaning up auto-created leads...');
      
      // Otomatik oluşturulan lead'leri sil
      const { data: deletedLeads, error: leadsError } = await supabase
        .from('leads')
        .delete()
        .or(`
          metadata->auto_created.eq.true,
          metadata->created_from.eq.messaging,
          metadata->created_from.eq.whatsapp_webhook,
          lead_name.ilike.%WhatsApp:%,
          lead_name.ilike.%test%,
          lead_name.eq.unknown
        `);

      results.leads = {
        deleted: deletedLeads,
        error: leadsError
      };
    }

    if (action === 'cleanup_activities' || action === 'cleanup_all') {
      console.log('🧹 Cleaning up test activities...');
      
      // Test aktivitelerini sil
      const { data: deletedActivities, error: activitiesError } = await supabase
        .from('activities')
        .delete()
        .or(`
          description.ilike.%test%,
          description.ilike.%debug%,
          description.ilike.%webhook%
        `);

      results.activities = {
        deleted: deletedActivities,
        error: activitiesError
      };
    }

    return NextResponse.json({
      success: true,
      action,
      results,
      message: 'Demo data cleanup completed'
    });

  } catch (error) {
    console.error('Demo cleanup error:', error);
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
    // Temizlenecek veri miktarını göster
    const { data: testMessages } = await supabase
      .from('messages')
      .select('id, content, created_at')
      .or(`
        content.ilike.%test%,
        content.ilike.%debug%,
        content.ilike.%mock%,
        content.ilike.%API test%,
        content.ilike.%webhook%
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: autoLeads } = await supabase
      .from('leads')
      .select('id, lead_name, metadata')
      .or(`
        metadata->auto_created.eq.true,
        lead_name.ilike.%WhatsApp:%,
        lead_name.ilike.%test%
      `);

    const { data: webhookLogs } = await supabase
      .from('webhook_logs')
      .select('id, processed_at, event_type')
      .eq('service', 'whatsapp')
      .order('processed_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      preview: {
        test_messages: testMessages?.length || 0,
        auto_leads: autoLeads?.length || 0,
        webhook_logs: webhookLogs?.length || 0,
        sample_messages: testMessages?.slice(0, 5).map(m => ({ 
          content: m.content?.substring(0, 50) + '...', 
          created_at: m.created_at 
        })) || []
      }
    });

  } catch (error) {
    console.error('Demo cleanup preview error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
