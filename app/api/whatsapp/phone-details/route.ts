import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v23.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [WhatsApp API] GET /api/whatsapp/phone-details - Phone details endpoint called');
    
    const { searchParams } = new URL(request.url);
    const phoneNumberId = searchParams.get('phone_number_id');

    if (!phoneNumberId) {
      console.log('❌ [WhatsApp API] Phone number ID is required');
      return NextResponse.json(
        { error: 'Phone number ID is required' },
        { status: 400 }
      );
    }

    console.log('📱 [WhatsApp Business Management] Fetching phone details for:', phoneNumberId);

    if (!ACCESS_TOKEN) {
      console.log('❌ [WhatsApp API] Access token not configured');
      return NextResponse.json(
        { error: 'WhatsApp access token is not configured' },
        { status: 500 }
      );
    }

    console.log('🌐 [WhatsApp Business Management] Requesting phone details from Facebook Graph API');
    console.log('📡 [WhatsApp API] GET request to:', `${WHATSAPP_API_URL}/${phoneNumberId}`);
    console.log('🔑 [WhatsApp Business Management] Using access token with whatsapp_business_management permission');

    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier,max_phone_numbers_per_business,namespace`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    console.log('📨 [WhatsApp API] Facebook Graph API response received');
    console.log('📊 [WhatsApp Business Management] Response status:', response.status);

    if (!response.ok) {
      console.log('❌ [WhatsApp API] Failed to fetch phone details');
      console.log('🔍 [WhatsApp Business Management] Error details:', {
        status: response.status,
        error: data.error?.message,
        code: data.error?.code,
        type: data.error?.type
      });
      
      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to fetch phone details',
          details: data.error 
        },
        { status: response.status }
      );
    }

    console.log('✅ [WhatsApp API] Phone details fetched successfully');
    console.log('📱 [WhatsApp Business Management] Phone details:', {
      display_phone_number: data.display_phone_number,
      verified_name: data.verified_name,
      quality_rating: data.quality_rating
    });
    console.log('🎯 [WhatsApp API] Phone details endpoint completed successfully');

    return NextResponse.json({
      success: true,
      display_phone_number: data.display_phone_number,
      verified_name: data.verified_name,
      quality_rating: data.quality_rating || 'UNKNOWN',
      messaging_limit_tier: data.messaging_limit_tier || '1000',
      max_phone_numbers: data.max_phone_numbers_per_business || 1,
      namespace: data.namespace || 'whatsapp_business',
      data
    });

  } catch (error) {
    console.log('💥 [WhatsApp API] Unexpected error in phone details endpoint');
    console.log('🔍 [WhatsApp Business Management] Error details:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
