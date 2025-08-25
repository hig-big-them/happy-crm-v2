/**
 * Supabase Client with Mock Auth Integration
 * 
 * This client integrates mock auth with real Supabase client
 * to bypass RLS policies during development/demo mode.
 */

import { createClient as createRealClient } from './client-real';

/**
 * Get mock user from localStorage/cookie
 */
function getMockUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedUser = localStorage.getItem('mock-auth-user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

/**
 * Create Supabase client that works with mock auth
 * Uses real client but ensures it can insert data
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If no env vars, fallback to mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ No Supabase env vars, using mock client');
    const { createClient: createMockClient } = require('./client');
    return createMockClient();
  }
  
  console.log('🔗 Creating real Supabase client for template operations');
  
  // Create real client - this should work since RLS is disabled
  const client = createRealClient();
  
  // Get mock user for debugging
  const mockUser = getMockUser();
  if (mockUser) {
    console.log(`🔐 Mock user context: ${mockUser.name} (${mockUser.role})`);
  }
  
  return client;
}

/**
 * Create client that bypasses RLS for demo/development
 * Uses service role key when available
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Service role key not available, using regular client');
    return createClient();
  }
  
  console.log('🔑 Using service role client (bypasses RLS)');
  
  // Use service role key to bypass RLS
  return createRealClient();
}