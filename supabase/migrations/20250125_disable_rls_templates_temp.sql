-- Temporary fix: Disable RLS for message_templates table
-- This allows template sync to work with mock auth during development
-- TODO: Re-enable RLS after fixing mock auth integration

ALTER TABLE public.message_templates DISABLE ROW LEVEL SECURITY;

-- Also disable for template_usage_log 
ALTER TABLE public.template_usage_log DISABLE ROW LEVEL SECURITY;

-- Add comment to remember this is temporary
COMMENT ON TABLE public.message_templates IS 'RLS temporarily disabled for demo/development - re-enable after mock auth integration';
COMMENT ON TABLE public.template_usage_log IS 'RLS temporarily disabled for demo/development - re-enable after mock auth integration';