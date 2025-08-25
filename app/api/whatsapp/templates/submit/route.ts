import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { templateId } = await request.json();

    // Get template details
    const { data: template, error: templateError } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

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

    console.log('Submitting template to Meta:', metaPayload);

    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metaPayload)
    });

    const metaData = await metaResponse.json();
    
    if (!metaResponse.ok) {
      console.error('Meta API error:', metaData);
      return NextResponse.json({
        success: false,
        error: 'Failed to submit template to Meta',
        details: metaData
      }, { status: 400 });
    }

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
      console.error('Database update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Template submitted for approval',
      meta_id: metaData.id,
      template_id: templateId
    });

  } catch (error) {
    console.error('Template submission error:', error);
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