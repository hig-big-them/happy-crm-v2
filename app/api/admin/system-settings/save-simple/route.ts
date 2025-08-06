/**
 * Simple System Settings Save (Fallback API)
 * 
 * Minimal, safe approach for saving settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Simple save endpoint called');
    
    let formData;
    try {
      formData = await request.formData();
      console.log('📋 FormData parsed successfully');
    } catch (formDataError) {
      console.error('❌ FormData parsing error:', formDataError);
      return NextResponse.json(
        { error: 'FormData parsing failed: ' + formDataError },
        { status: 400 }
      );
    }
    
    const configString = formData.get('config') as string;
    console.log('📦 Config string received, length:', configString?.length);
    
    if (!configString) {
      console.log('❌ No config data provided');
      return NextResponse.json(
        { error: 'No config data provided' },
        { status: 400 }
      );
    }

    let config;
    try {
      config = JSON.parse(configString);
      console.log('✅ Config JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON format: ' + parseError },
        { status: 400 }
      );
    }

    console.log('🔐 Creating Supabase client...');
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Check if user is admin
    console.log('👤 Checking user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ User authenticated:', user.id);

    // Get user profile to check role
    console.log('🔍 Checking user role...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      console.log('❌ Role check failed:', profileError, profile?.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    console.log('✅ User role verified:', profile.role);

    // Save to database with minimal processing
    console.log('💾 Saving to database...');
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'twilio_whatsapp_config',
        value: config, // Store as JSONB object, not string
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    console.log('✅ Settings saved successfully');
    // Return minimal response to avoid serialization issues
    return NextResponse.json({
      success: true,
      message: 'Settings saved'
    });

  } catch (error: any) {
    console.error('❌ Simple save error details:');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}