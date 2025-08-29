import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v23.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [WhatsApp API] POST /api/whatsapp/register-number - Number registration endpoint called');
    
    const body = await request.json();
    const { phone_number_id, pin = "111111" } = body;

    if (!phone_number_id) {
      console.log('❌ [WhatsApp API] Phone number ID is required');
      return NextResponse.json(
        { error: 'Phone number ID is required' },
        { status: 400 }
      );
    }

    if (!ACCESS_TOKEN) {
      console.log('❌ [WhatsApp API] Access token not configured');
      return NextResponse.json(
        { error: 'WhatsApp access token is not configured' },
        { status: 500 }
      );
    }

    console.log('📱 [WhatsApp Business Management] Registering phone number:', phone_number_id);
    console.log('🔑 [WhatsApp Business Management] Using access token with whatsapp_business_management permission');
    console.log('📋 [WhatsApp API] Registration payload:', { messaging_product: 'whatsapp', pin });

    const registrationUrl = `${WHATSAPP_API_URL}/${phone_number_id}/register`;
    console.log('🌐 [WhatsApp Business Management] Registration URL:', registrationUrl);

    const response = await fetch(registrationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin: pin
      }),
    });

    const data = await response.json();

    console.log('📨 [WhatsApp API] Facebook Graph API response received');
    console.log('📊 [WhatsApp Business Management] Response status:', response.status);

    if (!response.ok) {
      console.log('❌ [WhatsApp API] Failed to register phone number');
      console.log('🔍 [WhatsApp Business Management] Error details:', {
        status: response.status,
        error: data.error?.message,
        code: data.error?.code,
        type: data.error?.type,
        fbtrace_id: data.error?.fbtrace_id
      });
      
      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to register phone number',
          details: data.error,
          success: false
        },
        { status: response.status }
      );
    }

    console.log('✅ [WhatsApp API] Phone number registered successfully');
    console.log('📱 [WhatsApp Business Management] Registration response:', data);
    console.log('🎯 [WhatsApp API] Number registration endpoint completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Phone number registered successfully',
      data: data
    });

  } catch (error) {
    console.log('💥 [WhatsApp API] Unexpected error in number registration endpoint');
    console.log('🔍 [WhatsApp Business Management] Error details:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
