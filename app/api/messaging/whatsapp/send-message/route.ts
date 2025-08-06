/**
 * API Route: Send WhatsApp Free-form Message
 * 
 * Sends free-form WhatsApp messages within 24-hour window
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/services/twilio-whatsapp-service';
// Note: WhatsApp session manager will be implemented server-side
// import { whatsappSessionManager } from '@/lib/services/whatsapp-session-manager';
import { createClient } from '@/lib/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      leadId, 
      phoneNumber, 
      message
    } = body;

    if (!leadId || !phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, phoneNumber, message' },
        { status: 400 }
      );
    }

    // TODO: Check session status (implement server-side session manager)
    // For now, allow free-form messaging (implement proper session checking later)
    const sessionStatus = { canSendFreeForm: true };

    // Send message via Twilio
    const twilioResult = await sendWhatsAppMessage(
      phoneNumber,
      message,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook`
    );

    if (!twilioResult.success) {
      return NextResponse.json(
        { error: twilioResult.error || 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }

    // TODO: Update session activity (implement server-side session manager)
    // await whatsappSessionManager.updateSessionActivity(leadId, phoneNumber, 'outbound');

    // Save to database
    const supabase = createClient();
    
    const { data: messageRecord, error: dbError } = await supabase
      .from('messages')
      .insert({
        lead_id: leadId,
        content: message,
        channel: 'whatsapp',
        direction: 'outbound',
        status: 'sent',
        recipient_phone: phoneNumber,
        metadata: {
          source: 'timeline',
          type: 'freeform',
          twilio_sid: twilioResult.messageSid,
          session_active: true
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if database save fails, message was sent
    }

    return NextResponse.json({
      success: true,
      messageSid: twilioResult.messageSid,
      phoneNumber,
      status: twilioResult.status,
      messageId: messageRecord?.id,
      sessionStatus
    });

  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}