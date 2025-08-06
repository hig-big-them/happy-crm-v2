/**
 * API Route: System Settings Management
 * 
 * Handles CRUD operations for system configuration settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { safeStringify } from '@/lib/utils/json-safe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const supabase = createClient();

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (key) {
      console.log('🔍 Loading setting with key:', key);
      
      // Get specific setting
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();

      console.log('📊 Database query result:', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Database error:', error);
        throw error;
      }

      // Handle both string and object formats
      let processedValue = data?.value || null;
      if (processedValue) {
        // If it's a string, try to parse it as JSON
        if (typeof processedValue === 'string') {
          try {
            processedValue = JSON.parse(processedValue);
          } catch (parseError) {
            // If parsing fails, keep as string
            console.log('Value is not JSON, keeping as string:', processedValue);
          }
        }
        // If it's already an object (JSONB), use it as is
      }

      return NextResponse.json({ 
        success: true, 
        data: processedValue 
      });
    } else {
      // Get all settings
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        data 
      });
    }

  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 System settings POST request received');
    
    let body;
    try {
      body = await request.json();
      console.log('✅ Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ Request body parsing failed:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { key, value } = body;
    console.log('📋 Received key:', key, 'value type:', typeof value);

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Save/update setting
    let serializedValue: string;
    try {
      serializedValue = typeof value === 'string' ? value : safeStringify(value);
    } catch (stringifyError) {
      console.error('JSON.stringify error:', stringifyError);
      return NextResponse.json(
        { error: 'Invalid data structure - serialization failed' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        key,
        value: serializedValue,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('Error saving system settings:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Delete setting
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('key', key);

    if (error) throw error;

    return NextResponse.json({
      success: true
    });

  } catch (error: any) {
    console.error('Error deleting system setting:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}