-- Security Migration: Enable Row Level Security on Critical Tables
-- Run Date: 2025-01-25
-- Purpose: Implement comprehensive RLS security as per SECURITY.md

-- First, re-enable RLS on tables that were temporarily disabled
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_log ENABLE ROW LEVEL SECURITY;

-- Enable RLS on all critical data tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "user_profile_access" ON public.user_profiles;
DROP POLICY IF EXISTS "messages_user_access" ON public.messages;
DROP POLICY IF EXISTS "whatsapp_messages_user_access" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "leads_user_access" ON public.leads;
DROP POLICY IF EXISTS "superuser_access_all" ON public.agencies;
DROP POLICY IF EXISTS "template_access_policy" ON public.message_templates;
DROP POLICY IF EXISTS "whatsapp_sessions_user_access" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "template_usage_user_access" ON public.template_usage_log;

-- User Profile Access Policy
-- Users can only access their own profile
CREATE POLICY "user_profile_access" ON public.user_profiles
FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Messages Access Policy - Users can access messages for their leads
CREATE POLICY "messages_user_access" ON public.messages
FOR ALL TO authenticated
USING (
  -- Superuser can access everything
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superuser'
  )
  OR
  -- Users can access messages for leads they created or are assigned to
  lead_id IN (
    SELECT id FROM public.leads 
    WHERE created_by = auth.uid() 
    OR assigned_user_id = auth.uid()
  )
);

-- WhatsApp Messages Access Policy - Users can access messages for their leads
CREATE POLICY "whatsapp_messages_user_access" ON public.whatsapp_messages
FOR ALL TO authenticated
USING (
  -- Superuser can access everything
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superuser'
  )
  OR
  -- Users can access WhatsApp messages for leads they created or are assigned to
  lead_id IN (
    SELECT id FROM public.leads 
    WHERE created_by = auth.uid() 
    OR assigned_user_id = auth.uid()
  )
);

-- Leads Access Policy - Users can access their own leads
CREATE POLICY "leads_user_access" ON public.leads
FOR ALL TO authenticated
USING (
  -- Superuser can access everything
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superuser'
  )
  OR
  -- Users can access leads they created or are assigned to
  (created_by = auth.uid() OR assigned_user_id = auth.uid())
);

-- Agency Management Policy (Only superusers can manage agencies)
CREATE POLICY "superuser_access_all" ON public.agencies
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superuser'
  )
);

-- Template Access Policy - Users can access approved templates or all if superuser
CREATE POLICY "template_access_policy" ON public.message_templates
FOR ALL TO authenticated
USING (
  -- Superuser can access everything
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superuser'
  )
  OR
  -- Regular users can only access approved templates
  status = 'APPROVED'
);

-- Webhook Logs - Only superusers can view webhook logs (security)
CREATE POLICY "webhook_logs_superuser_only" ON public.webhook_logs
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superuser'
  )
);

-- Notification Preferences - Users can manage their own preferences
CREATE POLICY "notification_preferences_own" ON public.notification_preferences
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- WhatsApp Sessions - User access based on leads
CREATE POLICY "whatsapp_sessions_user_access" ON public.whatsapp_sessions
FOR ALL TO authenticated
USING (
  -- Superuser can access everything
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superuser'
  )
  OR
  -- Users can access sessions for their leads
  lead_id IN (
    SELECT id FROM public.leads 
    WHERE created_by = auth.uid() 
    OR assigned_user_id = auth.uid()
  )
);

-- Template Usage Log - Users can access their own usage logs
CREATE POLICY "template_usage_user_access" ON public.template_usage_log
FOR ALL TO authenticated
USING (
  -- Superuser can access everything
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superuser'
  )
  OR
  -- Users can access their own usage logs (if user_id exists)
  customer_id IN (
    SELECT id FROM public.customers
    WHERE created_by = auth.uid()
  )
);

-- Create indexes for performance on commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_agency_users_user_id ON public.agency_users(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_users_agency_id ON public.agency_users(agency_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_user ON public.leads(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_lead_id ON public.whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_lead_id ON public.whatsapp_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_status ON public.message_templates(status);