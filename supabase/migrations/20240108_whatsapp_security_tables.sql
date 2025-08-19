-- WhatsApp Security & Compliance Tables for Production
-- Run this migration before deploying to production

-- ============================================
-- Webhook Deduplication Table
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_dedup (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_webhook_dedup_expires_at ON webhook_dedup(expires_at);

-- Automatic cleanup of expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_webhook_dedup()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_dedup WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup every hour (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-webhook-dedup', '0 * * * *', 'SELECT cleanup_expired_webhook_dedup();');

-- ============================================
-- WhatsApp Conversations (24-Hour Session Management)
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  phone_number TEXT PRIMARY KEY,
  last_customer_message_at TIMESTAMPTZ,
  last_customer_message_id TEXT,
  last_business_message_at TIMESTAMPTZ,
  last_business_message_id TEXT,
  last_template_sent TIMESTAMPTZ,
  conversation_category TEXT CHECK (conversation_category IN ('business_initiated', 'customer_initiated', 'none')),
  session_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for session queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_updated_at ON whatsapp_conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_session_expires ON whatsapp_conversations(session_expires_at);

-- ============================================
-- WhatsApp Session Events (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_session_events (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_whatsapp_session_events_phone ON whatsapp_session_events(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_session_events_type ON whatsapp_session_events(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_session_events_created ON whatsapp_session_events(created_at);

-- ============================================
-- Webhook Security Logs
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_security_logs (
  id SERIAL PRIMARY KEY,
  webhook_type TEXT NOT NULL,
  event_id TEXT,
  signature_valid BOOLEAN,
  rate_limited BOOLEAN,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_webhook_security_logs_created ON webhook_security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_security_logs_signature ON webhook_security_logs(signature_valid);
CREATE INDEX IF NOT EXISTS idx_webhook_security_logs_rate_limited ON webhook_security_logs(rate_limited);

-- ============================================
-- Rate Limiting Store (if not using Redis)
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limit_store (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_end TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_end ON rate_limit_store(window_end);

-- Cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_store WHERE window_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- WhatsApp Configuration Store
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id TEXT UNIQUE NOT NULL,
  display_phone_number TEXT NOT NULL,
  verified_name TEXT,
  business_account_id TEXT,
  access_token_encrypted TEXT, -- Store encrypted
  api_version TEXT DEFAULT 'v21.0',
  webhook_url TEXT,
  webhook_verify_token_hash TEXT, -- Store as hash
  is_active BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  quality_rating TEXT CHECK (quality_rating IN ('GREEN', 'YELLOW', 'RED', 'UNKNOWN')),
  status TEXT CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'PENDING', 'ERROR')),
  messaging_limit_tier TEXT,
  namespace TEXT,
  certificate TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one primary number
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_configs_primary ON whatsapp_configs(is_primary) WHERE is_primary = true;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- Policy for whatsapp_configs (admin only)
CREATE POLICY whatsapp_configs_admin_only ON whatsapp_configs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policy for webhook_security_logs (read for authenticated, write for service)
CREATE POLICY webhook_security_logs_read ON webhook_security_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY webhook_security_logs_write ON webhook_security_logs
  FOR INSERT
  USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- Policy for whatsapp_conversations (authenticated users)
CREATE POLICY whatsapp_conversations_authenticated ON whatsapp_conversations
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- Functions for Secure Token Handling
-- ============================================

-- Function to securely store access token
CREATE OR REPLACE FUNCTION store_whatsapp_token(
  p_phone_number_id TEXT,
  p_access_token TEXT
) RETURNS void AS $$
DECLARE
  v_encrypted TEXT;
BEGIN
  -- In production, use pgcrypto extension for encryption
  -- v_encrypted := pgp_sym_encrypt(p_access_token, current_setting('app.encryption_key'));
  v_encrypted := p_access_token; -- Placeholder - implement encryption
  
  UPDATE whatsapp_configs 
  SET access_token_encrypted = v_encrypted,
      updated_at = NOW()
  WHERE phone_number_id = p_phone_number_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retrieve decrypted token (service role only)
CREATE OR REPLACE FUNCTION get_whatsapp_token(
  p_phone_number_id TEXT
) RETURNS TEXT AS $$
DECLARE
  v_encrypted TEXT;
  v_decrypted TEXT;
BEGIN
  -- Check if caller has service role
  IF auth.role() != 'service_role' AND (auth.jwt() ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized access to token';
  END IF;
  
  SELECT access_token_encrypted INTO v_encrypted
  FROM whatsapp_configs
  WHERE phone_number_id = p_phone_number_id;
  
  -- In production, use pgcrypto for decryption
  -- v_decrypted := pgp_sym_decrypt(v_encrypted::bytea, current_setting('app.encryption_key'));
  v_decrypted := v_encrypted; -- Placeholder - implement decryption
  
  RETURN v_decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers for Updated Timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_configs_updated_at
  BEFORE UPDATE ON whatsapp_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE webhook_dedup IS 'Prevents duplicate webhook event processing';
COMMENT ON TABLE whatsapp_conversations IS 'Tracks 24-hour session windows for WhatsApp conversations';
COMMENT ON TABLE whatsapp_session_events IS 'Audit trail for session management events';
COMMENT ON TABLE webhook_security_logs IS 'Security audit logs for webhook requests';
COMMENT ON TABLE rate_limit_store IS 'Fallback rate limiting storage when Redis is unavailable';
COMMENT ON TABLE whatsapp_configs IS 'WhatsApp Business API configuration for multiple phone numbers';

-- ============================================
-- Grant Permissions
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON whatsapp_conversations TO authenticated;
GRANT INSERT ON whatsapp_session_events TO authenticated;

-- Grant full permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- Initial Data (Optional)
-- ============================================

-- Insert default configuration template
-- INSERT INTO whatsapp_configs (
--   phone_number_id,
--   display_phone_number,
--   verified_name,
--   status,
--   quality_rating
-- ) VALUES (
--   'PLACEHOLDER',
--   '+90 XXX XXX XX XX',
--   'Your Business Name',
--   'PENDING',
--   'UNKNOWN'
-- ) ON CONFLICT DO NOTHING;