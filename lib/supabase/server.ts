/**
 * Compatibility entry for server Supabase client
 * Re-exports the real SSR server client used in production.
 */
export { createClient } from './server-real'
export type { SupabaseServerClient } from './server-real'


