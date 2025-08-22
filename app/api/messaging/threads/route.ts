import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  try {
    console.log('🔄 Loading message threads from API...');
    
    // Get leads with their messages - sadece mevcut kolonları kullan
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        messages:messages(
          id,
          channel,
          direction,
          content,
          status,
          metadata,
          created_at
        )
      `)
      .order('created_at', { ascending: false });
    
    console.log('📊 Leads fetched from API:', leads?.length || 0);
    
    if (leadsError) {
      console.error('Error fetching leads from API:', leadsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads',
        details: leadsError
      }, { status: 500 });
    }
    
    // Transform data into MessageThread format
    const threads = [];
    
    if (leads) {
      for (const lead of leads) {
        const leadMessages = lead.messages || [];
        
        if (leadMessages.length > 0) {
          // Sort messages by created_at
          const sortedMessages = leadMessages
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          const lastMessage = sortedMessages[sortedMessages.length - 1];
          
          const thread = {
            lead_id: lead.id,
            lead: {
              id: lead.id,
              lead_name: lead.lead_name || 'Unknown Lead',
              contact_phone: lead.contact_phone,
              contact_email: lead.contact_email,
              company: lead.company,
              status: lead.status || 'new',
              priority: lead.priority || 'medium',
              assigned_to: lead.assigned_to,
              tags: lead.tags || [],
              location: lead.location,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.id}`,
              last_seen: 'Az önce',
              is_online: false
            },
            last_message: {
              id: lastMessage.id,
              content: lastMessage.content,
              channel: lastMessage.channel,
              direction: lastMessage.direction,
              status: lastMessage.status,
              created_at: lastMessage.created_at,
              is_outbound: lastMessage.direction === 'outbound',
              type: 'text'
            },
            messages: sortedMessages.map(msg => ({
              id: msg.id,
              content: msg.content,
              channel: msg.channel,
              direction: msg.direction,
              status: msg.status,
              created_at: msg.created_at,
              is_outbound: msg.direction === 'outbound',
              type: 'text',
              metadata: msg.metadata
            })),
            unread_count: sortedMessages.filter(m => !m.metadata?.is_read && m.direction === 'inbound').length,
            starred_count: sortedMessages.filter(m => m.metadata?.is_starred).length,
            total_messages: sortedMessages.length,
            is_starred: false,
            is_archived: false,
            is_muted: false,
            channel: lastMessage.channel || 'whatsapp',
            phone_number_id: '793146130539824',
            typing_indicator: false,
            last_activity: lastMessage.created_at
          };
          
          threads.push(thread);
        }
      }
    }
    
    console.log('🧵 Threads created from API:', threads.length);
    
    return NextResponse.json({
      success: true,
      threads,
      stats: {
        total_threads: threads.length,
        total_leads: leads?.length || 0,
        total_messages: threads.reduce((sum, t) => sum + t.total_messages, 0)
      }
    });
    
  } catch (error) {
    console.error('Failed to load message threads from API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
