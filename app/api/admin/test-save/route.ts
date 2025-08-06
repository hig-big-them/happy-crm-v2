/**
 * Test Save Endpoint - Minimal implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Simple test data
    const testData = {
      test: "value",
      timestamp: new Date().toISOString()
    };
    
    const supabase = createClient();
    
    // Just try to save without any auth check for testing
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'test_key',
        value: testData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}