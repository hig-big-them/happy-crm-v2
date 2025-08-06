// Mock Supabase client for demo mode
import { type Database } from '../../../types/supabase'

// Mock client that doesn't make any network requests
export function createClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ 
          single: async () => ({ data: null, error: null }),
          order: () => ({ limit: () => ({ data: [], error: null }) }),
          data: [],
          error: null 
        }),
        order: () => ({ 
          limit: () => ({ data: [], error: null }),
          data: [],
          error: null 
        }),
        limit: () => ({ data: [], error: null }),
        data: [],
        error: null
      }),
      insert: () => ({ select: async () => ({ data: null, error: null }) }),
      update: () => ({ 
        eq: () => ({ 
          select: async () => ({ data: null, error: null }),
          data: null,
          error: null 
        }),
        select: async () => ({ data: null, error: null }),
        data: null,
        error: null
      }),
      delete: () => ({ 
        eq: async () => ({ data: null, error: null }),
        data: null,
        error: null 
      }),
    }),
    rpc: () => ({ data: null, error: null }),
  } as any
}

// Legacy alias
export const createClientSideSupabase = createClient