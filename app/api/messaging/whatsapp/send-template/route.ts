/**
 * API Route: Send WhatsApp Template
 * 
 * Sends WhatsApp templates via Twilio and manages 24-hour sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppTemplate } from '@/lib/services/twilio-whatsapp-service';
// Note: WhatsApp session manager will be implemented server-side
// import { whatsappSessionManager } from '@/lib/services/whatsapp-session-manager';
import { createClient } from '@/lib/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      leadId, 
      phoneNumber, 
      templateSid, 
      variables, 
      recipientName 
    } = body;

    if (!leadId || !phoneNumber || !templateSid) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, phoneNumber, templateSid' },
        { status: 400 }
      );
    }

    // Send template via Twilio
    const twilioResult = await sendWhatsAppTemplate(
      phoneNumber,
      templateSid,
      variables || {},
      `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook`
    );

    if (!twilioResult.success) {
      return NextResponse.json(
        { error: twilioResult.error || 'Failed to send WhatsApp template' },
        { status: 500 }
      );
    }

    // TODO: Create new 24-hour session (implement server-side session manager)
    // await whatsappSessionManager.createSession(leadId, phoneNumber, true);

    // Save to database
    const supabase = createClient();
    
    // Generate template content for display
    const templateContent = Object.entries(variables || {}).reduce((content, [key, value]) => {
      return content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }, `WhatsApp template (${templateSid}) sent`);

    const { data: message, error: dbError } = await supabase
      .from('messages')
      .insert({
        lead_id: leadId,
        content: templateContent,
        channel: 'whatsapp',
        direction: 'outbound',
        status: 'sent',
        recipient_phone: phoneNumber,
        metadata: {
          source: 'timeline',
          type: 'template',
          twilio_sid: twilioResult.messageSid,
          template_sid: templateSid,
          template_variables: variables
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if database save fails, template was sent
    }

    return NextResponse.json({
      success: true,
      messageSid: twilioResult.messageSid,
      phoneNumber,
      status: twilioResult.status,
      messageId: message?.id
    });

  } catch (error: any) {
    console.error('Error sending WhatsApp template:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}