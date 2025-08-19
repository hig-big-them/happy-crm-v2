// Real Supabase server client forwarder
// This file now forwards to the real SSR client so existing imports keep working
import { createClient as createRealServerClient } from '@/lib/supabase/server-real'

export async function createServerClientComponent() {
  return createRealServerClient()
}

export async function createServerActionClient() {
  return createRealServerClient()
}

// Backward-compatible aliases used widely across the app
export const createClient = createServerActionClient
export const createServerClient = createServerActionClient