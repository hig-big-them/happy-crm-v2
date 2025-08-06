/**
 * WhatsApp Settings Save API - No Auth Required
 * 
 * Special endpoint for WhatsApp settings that doesn't require admin auth
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔓 WhatsApp settings save endpoint called (no auth)');
    
    // Parse request body
    const body = await request.json();
    const { config } = body;
    
    if (!config) {
      return NextResponse.json({ error: 'Config required' }, { status: 400 });
    }
    
    // Direct Supabase API call without auth-helpers
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase configuration missing');
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }
    
    console.log('💾 Saving WhatsApp config to database...');
    
    // Direct REST API call to Supabase
    const saveResponse = await fetch(`${supabaseUrl}/rest/v1/system_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        key: 'twilio_whatsapp_config',
        value: config,
        updated_at: new Date().toISOString()
      })
    });
    
    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      console.error('❌ Database save failed:', errorText);
      throw new Error(`Database error: ${errorText}`);
    }
    
    const saveResult = await saveResponse.json();
    console.log('✅ WhatsApp settings saved successfully');
    
    return NextResponse.json({
      success: true,
      message: 'WhatsApp settings saved successfully'
    });
    
  } catch (error: any) {
    console.error('❌ WhatsApp save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save WhatsApp settings' },
      { status: 500 }
    );
  }
}