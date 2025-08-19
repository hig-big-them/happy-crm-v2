// Forward to real service client (server-only)
import { createServiceClient as realCreateServiceClient } from '@/lib/supabase/service-real'

export function createServiceClient() {
  return realCreateServiceClient()
}

export function createServiceRoleClient() {
  return realCreateServiceClient()
}

export const createClient = createServiceClient