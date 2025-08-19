/**
 * Supabase Client Exports
 * 
 * This module exports the appropriate Supabase clients based on the environment.
 * In production, it uses real clients. In development, it can use mock clients if needed.
 */

// Determine which clients to use based on environment
const USE_REAL_SUPABASE = process.env.USE_REAL_SUPABASE === 'true' || 
                          process.env.NODE_ENV === 'production';

// Browser/Client exports
export { createClient } from USE_REAL_SUPABASE 
  ? './client-real' 
  : '@/lib/utils/supabase/client';

// Server exports  
export { createClient as createServerClient } from USE_REAL_SUPABASE
  ? './server-real'
  : '@/lib/utils/supabase/server';

// Service role exports
export { createServiceClient } from USE_REAL_SUPABASE
  ? './service-real'
  : '@/lib/utils/supabase/service';

// Type exports
export type { Database } from '@/types/supabase';

// Helper to check if using real database
export const isUsingRealDatabase = () => USE_REAL_SUPABASE;

// Log current mode
if (typeof window === 'undefined') {
  console.log(
    `🗄️ Supabase Mode: ${USE_REAL_SUPABASE ? 'REAL DATABASE' : 'MOCK MODE'}`
  );
}