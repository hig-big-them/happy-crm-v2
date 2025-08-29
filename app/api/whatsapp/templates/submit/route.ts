import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [WhatsApp Templates] POST /api/whatsapp/templates/submit - Template submission endpoint called');
    console.log('📄 [WhatsApp Business Management] Initiating template submission to Facebook');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ [WhatsApp Templates] Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [WhatsApp Templates] User authenticated:', user.id);

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      console.log('❌ [WhatsApp Templates] Insufficient permissions - admin role required');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('✅ [WhatsApp Templates] Admin permissions verified');

    const { templateId } = await request.json();
    console.log('📋 [WhatsApp Templates] Template submission request:', { templateId });

    console.log('🔍 [WhatsApp Templates] Fetching template details from database');
    
    // Get template details
    const { data: template, error: templateError } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      console.log('❌ [WhatsApp Templates] Template not found in database:', templateId);
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    console.log('✅ [WhatsApp Templates] Template found:', {
      name: template.name,
      category: template.category,
      language: template.language,
      status: template.status
    });

    console.log('🔧 [WhatsApp Templates] Preparing template components for Facebook API');
    
    // Prepare the template for Meta API
    const components = [];

    // Add header component if exists
    if (template.header_text) {
      components.push({
        type: 'HEADER',
        format: template.header_type || 'TEXT',
        text: template.header_text
      });
    }

    // Add body component
    components.push({
      type: 'BODY',
      text: template.body_text,
      example: template.variables?.length > 0 ? {
        body_text: template.variables.map((v: any, i: number) => [`Example ${i + 1}`])
      } : undefined
    });

    // Add footer component if exists
    if (template.footer_text) {
      components.push({
        type: 'FOOTER',
        text: template.footer_text
      });
    }

    // Add buttons if exist
    if (template.buttons && template.buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: template.buttons
      });
    }

    console.log('📊 [WhatsApp Templates] Template components prepared:', {
      componentsCount: components.length,
      hasHeader: components.some(c => c.type === 'HEADER'),
      hasFooter: components.some(c => c.type === 'FOOTER'),
      hasButtons: components.some(c => c.type === 'BUTTONS')
    });

    // Meta API configuration
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '640124182025093';
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6';

    const metaUrl = `https://graph.facebook.com/v23.0/${businessAccountId}/message_templates`;

    const metaPayload = {
      name: template.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      category: template.category,
      language: template.language,
      components: components
    };

    console.log('🌐 [WhatsApp Business Management] Submitting template to Facebook Graph API');
    console.log('📡 [WhatsApp Templates] POST request to:', metaUrl);
    console.log('🔑 [WhatsApp Business Management] Using access token with whatsapp_business_management permission');
    console.log('📋 [WhatsApp Templates] Template payload:', {
      name: metaPayload.name,
      category: metaPayload.category,
      language: metaPayload.language,
      componentsCount: metaPayload.components.length
    });

    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metaPayload)
    });

    const metaData = await metaResponse.json();
    
    console.log('📨 [WhatsApp Templates] Facebook Graph API response received');
    console.log('📊 [WhatsApp Business Management] Response status:', metaResponse.status);
    
    if (!metaResponse.ok) {
      console.log('❌ [WhatsApp Templates] Template submission failed');
      console.log('🔍 [WhatsApp Business Management] Error details:', {
        status: metaResponse.status,
        error: metaData.error?.message,
        code: metaData.error?.code,
        type: metaData.error?.type
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to submit template to Meta',
        details: metaData
      }, { status: 400 });
    }

    console.log('✅ [WhatsApp Templates] Template submitted successfully to Facebook');
    console.log('📱 [WhatsApp Business Management] Template ID:', metaData.id);

    console.log('💾 [WhatsApp Templates] Updating template status in database');
    
    // Update template status in database
    const { error: updateError } = await supabase
      .from('message_templates')
      .update({
        status: 'PENDING',
        meta_template_id: metaData.id,
        submitted_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (updateError) {
      console.log('❌ [WhatsApp Templates] Database update failed:', updateError);
    } else {
      console.log('✅ [WhatsApp Templates] Template status updated to PENDING in database');
    }

    console.log('🎯 [WhatsApp Templates] Template submission endpoint completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Template submitted for approval',
      meta_id: metaData.id,
      template_id: templateId
    });

  } catch (error) {
    console.log('💥 [WhatsApp Templates] Unexpected error in template submission');
    console.log('🔍 [WhatsApp Business Management] Error details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get template status from Meta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metaTemplateId = searchParams.get('meta_id');

    if (!metaTemplateId) {
      return NextResponse.json({ error: 'meta_id is required' }, { status: 400 });
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAZA7w2AadZC4BPPRnKtBXXhi8ZAZBV06ZCHRurPtBikOW4umxYccikfaEcKUiopL8BnEAhO7X6YEl0CZAJ0nQpv8ZAD1BPZCOM6Isl49iowBHjBJwIW7lu33kPzykNBNtTlhRIuX99X2gZAcgwwjTzyLU9YjiuytvdKsPwQQIVS2SYDeYwUKFK1sD17ubZBC2J01D1yIsSaCRTAU9TZCCwP80gHFKcors4XQkFCFYtdYh6';
    
    const metaUrl = `https://graph.facebook.com/v23.0/${metaTemplateId}?access_token=${accessToken}`;

    const metaResponse = await fetch(metaUrl);
    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get template status',
        details: metaData
      }, { status: 400 });
    }

    // Map Meta status to our status
    let status = 'PENDING';
    if (metaData.status === 'APPROVED') {
      status = 'APPROVED';
    } else if (metaData.status === 'REJECTED') {
      status = 'REJECTED';
    }

    return NextResponse.json({
      success: true,
      status: status,
      meta_status: metaData.status,
      rejection_reason: metaData.rejected_reason,
      data: metaData
    });

  } catch (error) {
    console.error('Template status check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}