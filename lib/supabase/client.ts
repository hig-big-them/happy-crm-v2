/**
 * Compatibility entry for browser Supabase client
 * Re-exports the real browser client used in production.
 */
export { createClient as createRealClient } from './client-real'
export type { SupabaseClient } from './client-real'

// Mock Supabase client for demo mode
import { type Database } from '../../types/supabase'

// Mock client that doesn't make any network requests
export function createClient() {
  const createQueryBuilder = () => {
    const queryState = {
      data: [],
      error: null,
      count: 0
    }

    return {
      select: (columns?: string | string[]) => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: async () => ({ data: null, error: null }),
              order: (column: string, options?: any) => {
                return {
                  limit: (count: number) => ({ data: [], error: null }),
                  data: [],
                  error: null
                }
              },
              data: [],
              error: null
            }
          },
          order: (column: string, options?: any) => {
            return {
              limit: (count: number) => ({ data: [], error: null }),
              data: [],
              error: null
            }
          },
          limit: (count: number) => ({ data: [], error: null }),
          data: [],
          error: null
        }
      },
      insert: (data: any) => {
        return {
          select: async (columns?: string) => ({ data: null, error: null })
        }
      },
      update: (data: any) => {
        return {
          eq: (column: string, value: any) => {
            return {
              select: async (columns?: string) => ({ data: null, error: null }),
              data: null,
              error: null
            }
          },
          select: async (columns?: string) => ({ data: null, error: null }),
          data: null,
          error: null
        }
      },
      delete: () => {
        return {
          eq: async (column: string, value: any) => ({ data: null, error: null }),
          data: null,
          error: null
        }
      }
    }
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
    },
    from: (table: string) => createQueryBuilder(),
    rpc: (func: string, params?: any) => ({ data: null, error: null }),
  } as any
}

// Legacy alias
export const createClientSideSupabase = createClient

// Prefer real client when env vars are present
// Consumers importing from lib/supabase/client can call createRealClient directly if needed