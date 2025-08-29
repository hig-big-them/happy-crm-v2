import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [WhatsApp Templates] GET /api/whatsapp/templates - Template list endpoint called');
    console.log('📄 [WhatsApp Business Management] Fetching templates from Facebook Graph API');
    
    const businessAccountId = '640124182025093'
    const accessToken = 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6'

    const url = `https://graph.facebook.com/v23.0/${businessAccountId}/message_templates?access_token=${accessToken}`

    console.log('🌐 [WhatsApp Business Management] Requesting templates from Facebook');
    console.log('📡 [WhatsApp Templates] GET request to:', url.replace(accessToken, 'ACCESS_TOKEN_HIDDEN'));
    console.log('🔑 [WhatsApp Business Management] Using access token with whatsapp_business_management permission');

    const response = await fetch(url)
    const data = await response.json()

    console.log('📨 [WhatsApp Templates] Facebook Graph API response received');
    console.log('📊 [WhatsApp Business Management] Response status:', response.status);
    console.log('📋 [WhatsApp Templates] Templates count:', data.data?.length || 0);

    if (response.ok) {
      console.log('✅ [WhatsApp Templates] Templates fetched successfully from Facebook');
      console.log('🎯 [WhatsApp Templates] Template list endpoint completed successfully');
      
      return NextResponse.json({
        success: true,
        templates: data.data || [],
        message: 'WhatsApp template\'leri başarıyla alındı'
      })
    } else {
      console.log('❌ [WhatsApp Templates] Failed to fetch templates from Facebook');
      console.log('🔍 [WhatsApp Business Management] Error details:', {
        status: response.status,
        error: data.error?.message,
        code: data.error?.code,
        type: data.error?.type
      });
      
      return NextResponse.json({
        success: false,
        error: 'Template\'ler alınamadı',
        details: data
      }, { status: response.status })
    }

  } catch (error) {
    console.log('💥 [WhatsApp Templates] Unexpected error in template list endpoint');
    console.log('🔍 [WhatsApp Business Management] Error details:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
