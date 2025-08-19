/**
 * Real Supabase Browser Client for Production
 * 
 * This is the actual Supabase client that connects to the real database.
 * Use this in production instead of the mock client.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required Supabase environment variables');
  } else {
    console.warn('⚠️ Supabase environment variables not configured');
  }
}

/**
 * Create a Supabase client for browser/client-side operations
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client only in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Using mock Supabase client - configure environment variables for real database');
      // Import mock client as fallback in development
      const { createClient: createMockClient } = require('@/lib/utils/supabase/client');
      return createMockClient();
    }
    
    throw new Error('Supabase client cannot be created without environment variables');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'happy-crm'
      }
    },
    db: {
      schema: 'public'
    },
    // Production optimizations
    ...(process.env.NODE_ENV === 'production' && {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Disable in production for security
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'happy-crm-auth',
        debug: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  });
}

// Export type for the client
export type SupabaseClient = ReturnType<typeof createClient>;