-- Create user_consents table for WhatsApp opt-in tracking
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL, -- 'whatsapp_marketing', 'whatsapp_transactional', 'email_marketing', etc.
  status BOOLEAN DEFAULT false,
  opted_in_at TIMESTAMP WITH TIME ZONE,
  opted_out_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  consent_text TEXT, -- The exact text shown to user when they consented
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_customer_id ON public.user_consents(customer_id);
CREATE INDEX idx_user_consents_type_status ON public.user_consents(consent_type, status);

-- Create message_templates table for WhatsApp template management
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'MARKETING', 'TRANSACTIONAL', 'OTP'
  language VARCHAR(10) DEFAULT 'tr',
  header_type VARCHAR(20), -- 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'
  header_text TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable definitions
  buttons JSONB DEFAULT '[]'::jsonb, -- Array of button configurations
  status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED'
  meta_template_id VARCHAR(255), -- ID from Meta after submission
  meta_status VARCHAR(50), -- Status from Meta
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for template lookups
CREATE INDEX idx_message_templates_status ON public.message_templates(status);
CREATE INDEX idx_message_templates_name ON public.message_templates(name);

-- Create template_usage_log for tracking template usage
CREATE TABLE IF NOT EXISTS public.template_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.message_templates(id),
  customer_id UUID REFERENCES public.customers(id),
  phone_number VARCHAR(50),
  variables_used JSONB,
  message_id VARCHAR(255), -- WhatsApp message ID
  status VARCHAR(50), -- 'sent', 'delivered', 'read', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create index for usage tracking
CREATE INDEX idx_template_usage_log_template ON public.template_usage_log(template_id);
CREATE INDEX idx_template_usage_log_customer ON public.template_usage_log(customer_id);

-- RLS policies
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_log ENABLE ROW LEVEL SECURITY;

-- Policies for user_consents
CREATE POLICY "Users can view their own consents" ON public.user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents" ON public.user_consents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Policies for message_templates
CREATE POLICY "Users can view approved templates" ON public.message_templates
  FOR SELECT USING (status = 'APPROVED');

CREATE POLICY "Admins can manage all templates" ON public.message_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Policies for template_usage_log
CREATE POLICY "Admins can view all usage logs" ON public.template_usage_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Add consent check function
CREATE OR REPLACE FUNCTION check_whatsapp_consent(
  p_customer_id UUID,
  p_consent_type VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_consents
    WHERE customer_id = p_customer_id
    AND consent_type = p_consent_type
    AND status = true
    AND opted_out_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to record consent
CREATE OR REPLACE FUNCTION record_consent(
  p_customer_id UUID,
  p_consent_type VARCHAR,
  p_status BOOLEAN,
  p_consent_text TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  -- Check if consent already exists
  SELECT id INTO v_consent_id
  FROM public.user_consents
  WHERE customer_id = p_customer_id
  AND consent_type = p_consent_type
  LIMIT 1;
  
  IF v_consent_id IS NOT NULL THEN
    -- Update existing consent
    UPDATE public.user_consents
    SET 
      status = p_status,
      opted_in_at = CASE WHEN p_status = true THEN NOW() ELSE opted_in_at END,
      opted_out_at = CASE WHEN p_status = false THEN NOW() ELSE NULL END,
      ip_address = COALESCE(p_ip_address, ip_address),
      user_agent = COALESCE(p_user_agent, user_agent),
      consent_text = COALESCE(p_consent_text, consent_text),
      updated_at = NOW()
    WHERE id = v_consent_id;
  ELSE
    -- Create new consent record
    INSERT INTO public.user_consents (
      customer_id,
      consent_type,
      status,
      opted_in_at,
      opted_out_at,
      ip_address,
      user_agent,
      consent_text
    ) VALUES (
      p_customer_id,
      p_consent_type,
      p_status,
      CASE WHEN p_status = true THEN NOW() ELSE NULL END,
      CASE WHEN p_status = false THEN NOW() ELSE NULL END,
      p_ip_address,
      p_user_agent,
      p_consent_text
    ) RETURNING id INTO v_consent_id;
  END IF;
  
  RETURN v_consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;