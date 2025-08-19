/**
 * Real Supabase Server Client for Production
 * 
 * This is the actual Supabase server client that connects to the real database.
 * Use this in production instead of the mock client.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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
 * Create a Supabase client for server-side operations
 */
export async function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client only in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Using mock Supabase server client - configure environment variables for real database');
      // Import mock client as fallback in development
      const { createClient: createMockClient } = require('@/lib/utils/supabase/server');
      return createMockClient();
    }
    
    throw new Error('Supabase server client cannot be created without environment variables');
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Handle cookie errors in server components
          console.error('Cookie operation failed:', error);
        }
      }
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // Always false on server
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'happy-crm-server'
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
        detectSessionInUrl: false,
        flowType: 'pkce',
        debug: false
      }
    })
  });
}

// Export type for the client
export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;