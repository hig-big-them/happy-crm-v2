import { NextRequest, NextResponse } from 'next/server';
import { rateLimitWhatsApp, createRateLimitResponse, getClientIP } from '@/lib/security/rate-limiter';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0';
const PHONE_NUMBER_ID = '660093600519552';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [WhatsApp API] POST /api/whatsapp/send - Message sending endpoint called');
    console.log('📱 [WhatsApp Business Messaging] Initiating message send request');
    
    // Access token kontrolü
    if (!ACCESS_TOKEN) {
      console.log('❌ [WhatsApp API] Access token not configured - this requires whatsapp_business_messaging permission');
      return NextResponse.json(
        { error: 'WhatsApp access token is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { to, message, type = 'text', template } = body;
    
    console.log('📋 [WhatsApp API] Request payload received:', {
      to: to ? `${to.substring(0, 5)}****` : 'undefined', // Mask phone number for privacy
      messageType: type,
      hasTemplate: !!template,
      messageLength: message?.length || 0
    });
    
    // Rate limiting - telefon numarası bazında
    if (to) {
      const rateLimitResult = await rateLimitWhatsApp(to);
      if (!rateLimitResult.success) {
        console.log('⚠️ [WhatsApp API] Rate limit exceeded for phone number:', to.substring(0, 5) + '****');
        return createRateLimitResponse(
          rateLimitResult,
          'Too many WhatsApp messages sent to this number. Please try again later.'
        );
      }
      console.log('✅ [WhatsApp API] Rate limit check passed');
    }

    if (!to) {
      console.log('❌ [WhatsApp API] Validation failed: Phone number is required');
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    let payload: any = {
      messaging_product: 'whatsapp',
      to: to.startsWith('+') ? to.substring(1) : to,
    };

    if (type === 'template' && template) {
      payload.type = 'template';
      payload.template = template;
      console.log('📄 [WhatsApp API] Preparing template message with template:', template.name);
    } else {
      payload.type = 'text';
      payload.text = {
        body: message || 'Test message from Happy CRM'
      };
      console.log('💬 [WhatsApp API] Preparing text message');
    }

    console.log('🌐 [WhatsApp Business Messaging] Sending request to Facebook Graph API');
    console.log('📡 [WhatsApp API] POST request to:', `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`);
    console.log('🔑 [WhatsApp Business Messaging] Using access token with whatsapp_business_messaging permission');

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    
    console.log('📨 [WhatsApp API] Facebook Graph API response received');
    console.log('📊 [WhatsApp Business Messaging] Response status:', response.status);

    if (!response.ok) {
      console.log('❌ [WhatsApp API] Message sending failed');
      console.log('🔍 [WhatsApp Business Messaging] Error details:', {
        status: response.status,
        error: data.error?.message,
        code: data.error?.code,
        type: data.error?.type
      });
      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to send message',
          details: data.error 
        },
        { status: response.status }
      );
    }

    console.log('✅ [WhatsApp API] Message sent successfully');
    console.log('📱 [WhatsApp Business Messaging] Message ID:', data.messages?.[0]?.id);
    console.log('🎯 [WhatsApp API] Endpoint execution completed successfully');

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
      data
    });

  } catch (error) {
    console.log('💥 [WhatsApp API] Unexpected error occurred');
    console.log('🔍 [WhatsApp Business Messaging] Error details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}