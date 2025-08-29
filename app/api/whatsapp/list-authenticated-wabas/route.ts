import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v23.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [WhatsApp API] GET /api/whatsapp/list-authenticated-wabas - Authenticated WABAs endpoint called');
    
    console.log('🔑 [WhatsApp Business Management] Using access token:', ACCESS_TOKEN ? 'Token available' : 'No token');

    console.log('🔍 [WhatsApp Business Management] Fetching authenticated WABAs from Facebook Graph API');
    console.log('🔑 [WhatsApp Business Management] Using access token with whatsapp_business_management permission');

    // Get authenticated WhatsApp Business Accounts
    const response = await fetch(
      `${WHATSAPP_API_URL}/me/businesses?fields=id,name,whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,messaging_limit_tier}}`,
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
      console.log('❌ [WhatsApp API] Failed to fetch authenticated WABAs');
      console.log('🔍 [WhatsApp Business Management] Error details:', {
        status: response.status,
        error: data.error?.message,
        code: data.error?.code,
        type: data.error?.type
      });
      
      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to fetch authenticated WABAs',
          details: data.error,
          success: false
        },
        { status: response.status }
      );
    }

    console.log('✅ [WhatsApp API] Authenticated WABAs fetched successfully');

    // Process the response to extract WABA information
    const authenticatedWABAs: any[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((business: any) => {
        if (business.whatsapp_business_accounts && Array.isArray(business.whatsapp_business_accounts.data)) {
          business.whatsapp_business_accounts.data.forEach((waba: any) => {
            if (waba.phone_numbers && Array.isArray(waba.phone_numbers.data)) {
              waba.phone_numbers.data.forEach((phone: any) => {
                authenticatedWABAs.push({
                  id: waba.id,
                  waba_name: waba.name,
                  business_name: business.name,
                  phone_number_id: phone.id,
                  display_phone_number: phone.display_phone_number,
                  verified_name: phone.verified_name,
                  quality_rating: phone.quality_rating || 'UNKNOWN',
                  messaging_limit_tier: phone.messaging_limit_tier || '1000',
                  namespace: waba.name?.toLowerCase().replace(/\s+/g, '_') || 'whatsapp_business',
                  max_phone_numbers: 1
                });
              });
            }
          });
        }
      });
    }

    console.log('📱 [WhatsApp Business Management] Processed authenticated WABAs:', authenticatedWABAs.length);
    console.log('🎯 [WhatsApp API] Authenticated WABAs endpoint completed successfully');

    return NextResponse.json({
      success: true,
      data: authenticatedWABAs,
      count: authenticatedWABAs.length
    });

  } catch (error) {
    console.log('💥 [WhatsApp API] Unexpected error in authenticated WABAs endpoint');
    console.log('🔍 [WhatsApp Business Management] Error details:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
