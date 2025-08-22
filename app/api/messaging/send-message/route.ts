import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { leadId, phoneNumber, channel, content } = body;

    // Validation
    if ((!leadId && !phoneNumber) || !channel || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basit mesaj insert - minimal fields
    const messageData = {
      lead_id: leadId || null,
      channel: channel || 'whatsapp',
      direction: 'outbound',
      content: content
    };

    console.log('💾 Inserting simple message:', messageData);

    const { data: message, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Failed to insert simple message:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save message', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Simple message saved:', message.id);

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Simple message API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
