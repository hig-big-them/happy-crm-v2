import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/service';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  try {
    // Basit leads sorgusu
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(5);
    
    console.log('Leads query result:', { leads, leadsError });
    
    // Basit messages sorgusu
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);
    
    console.log('Messages query result:', { messages, messagesError });
    
    return NextResponse.json({
      success: true,
      data: {
        leads: leads || [],
        messages: messages || [],
        leadsCount: leads?.length || 0,
        messagesCount: messages?.length || 0
      },
      errors: {
        leads: leadsError,
        messages: messagesError
      }
    });
    
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
