/**
 * Real Supabase Service Role Client for Production
 * 
 * This is the actual Supabase service client with elevated privileges.
 * Use this in production for admin operations instead of the mock client.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required Supabase service role environment variables');
  } else {
    console.warn('⚠️ Supabase service role variables not configured');
  }
}

/**
 * Create a Supabase client with service role privileges
 * 
 * WARNING: This client bypasses Row Level Security (RLS)
 * Only use for administrative operations that require elevated privileges
 */
export function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    // Return a mock client only in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Using mock Supabase service client - configure environment variables for real database');
      // Import mock client as fallback in development
      const { createServiceClient: createMockClient } = require('@/lib/utils/supabase/service');
      return createMockClient();
    }
    
    throw new Error('Supabase service client cannot be created without environment variables');
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false, // Service role doesn't need sessions
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'x-application-name': 'happy-crm-service'
      }
    },
    db: {
      schema: 'public'
    },
    // Production optimizations
    ...(process.env.NODE_ENV === 'production' && {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        debug: false
      }
    })
  });
}

// Export type for the client
export type SupabaseServiceClient = ReturnType<typeof createServiceClient>;