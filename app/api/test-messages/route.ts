import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { leadId, content, channel = 'whatsapp' } = body;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test mesajı ekle
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        lead_id: leadId,
        channel,
        direction: 'outgoing',
        content,
        sender_id: user.id,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          test_message: true,
          created_by: user.email
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert test message:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Failed to create test message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  try {
    // Test mesajlarını getir
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        lead:leads(lead_name, contact_phone),
        sender:user_profiles!sender_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Failed to fetch test messages:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Failed to fetch test messages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
