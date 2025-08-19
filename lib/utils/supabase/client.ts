// Real Supabase client forwarder for browser environment
import { createClient as createRealClient } from '@/lib/supabase/client-real'

export function createClient() {
  return createRealClient()
}

export const createClientSideSupabase = createClient