// Mock Safari Supabase client for demo mode
import { type Database } from '../../types/supabase'

// Mock client that doesn't make any network requests
export function createSafariClient() {
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

// Legacy function for backward compatibility
export function createClient(supabaseUrl: string, supabaseKey: string, options?: any) {
  return createSafariClient()
}

// Auto-detect ve uygun client'ı döndür
export function createOptimizedClient() {
  if (typeof window === 'undefined') return null // Safari detection is removed, so return null
  
  const ua = window.navigator.userAgent
  const safari = /^((?!chrome|android).)*safari/i.test(ua)
  const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
  const webkit = /AppleWebKit/.test(ua) && !/Chrome/.test(ua)
  
  if (safari || ios || webkit) {
    console.log('🍎 [CLIENT-FACTORY] Safari detected, using Safari client')
    return createSafariClient()
  } else {
    console.log('🌐 [CLIENT-FACTORY] Regular browser detected, using regular client')
    return createRegularClient()
  }
}

// Regular client function for non-Safari browsers
export function createRegularClient() {
  return createSafariClient() // Same mock client for all browsers now
} 