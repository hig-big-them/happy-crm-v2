-- WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT UNIQUE NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_type TEXT NOT NULL, -- text, image, video, audio, document, location, template
  message_creation_type TEXT, -- user_initiated, created_by_1p_bot, etc.
  content JSONB, -- stores text body, media info, template data, etc.
  status TEXT, -- sent, delivered, read, failed, received
  is_incoming BOOLEAN DEFAULT false,
  platform TEXT DEFAULT 'whatsapp_cloud',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_details JSONB,
  conversation_id TEXT,
  pricing_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_number ON whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_to_number ON whatsapp_messages(to_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_message_id ON whatsapp_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);

-- Webhook Deduplication Table
CREATE TABLE IF NOT EXISTS webhook_dedup (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_webhook_dedup_expires_at ON webhook_dedup(expires_at);

-- Webhook Logs Table - Check if exists and add missing columns
DO $$ 
BEGIN
  -- Create table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_logs') THEN
    CREATE TABLE webhook_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      webhook_type TEXT NOT NULL, -- whatsapp_cloud, twilio, etc.
      event_type TEXT NOT NULL,
      data JSONB,
      processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status TEXT -- success, error, unknown
    );
  ELSE
    -- Add missing columns if table exists
    ALTER TABLE webhook_logs 
    ADD COLUMN IF NOT EXISTS webhook_type TEXT,
    ADD COLUMN IF NOT EXISTS event_type TEXT,
    ADD COLUMN IF NOT EXISTS data JSONB,
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS status TEXT;
  END IF;
END $$;

-- Index for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_type ON webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at ON webhook_logs(processed_at DESC);

-- Webhook Errors Table
CREATE TABLE IF NOT EXISTS webhook_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- whatsapp_cloud, twilio, etc.
  error_code INTEGER,
  error_title TEXT,
  error_message TEXT,
  error_details JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for webhook errors
CREATE INDEX IF NOT EXISTS idx_webhook_errors_platform ON webhook_errors(platform);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_occurred_at ON webhook_errors(occurred_at DESC);

-- Notifications Table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- WhatsApp Templates Table (optional)
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT UNIQUE,
  name TEXT NOT NULL,
  language TEXT,
  status TEXT, -- approved, rejected, paused, etc.
  category TEXT,
  components JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for templates
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_name ON whatsapp_templates(name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_templates(status);

-- RLS Policies (adjust based on your needs)
-- Only enable RLS if tables exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'whatsapp_messages') THEN
    ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_dedup') THEN
    ALTER TABLE webhook_dedup ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_logs') THEN
    ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_errors') THEN
    ALTER TABLE webhook_errors ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'whatsapp_templates') THEN
    ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if tables exist
DO $$ 
BEGIN
  -- WhatsApp Messages policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'whatsapp_messages') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_messages' AND policyname = 'Service role has full access to whatsapp_messages') THEN
      CREATE POLICY "Service role has full access to whatsapp_messages" ON whatsapp_messages
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;

  -- Webhook Dedup policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_dedup') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webhook_dedup' AND policyname = 'Service role has full access to webhook_dedup') THEN
      CREATE POLICY "Service role has full access to webhook_dedup" ON webhook_dedup
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;

  -- Webhook Logs policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webhook_logs' AND policyname = 'Service role has full access to webhook_logs') THEN
      CREATE POLICY "Service role has full access to webhook_logs" ON webhook_logs
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;

  -- Webhook Errors policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_errors') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webhook_errors' AND policyname = 'Service role has full access to webhook_errors') THEN
      CREATE POLICY "Service role has full access to webhook_errors" ON webhook_errors
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;

  -- Notifications policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can read their own notifications') THEN
      CREATE POLICY "Users can read their own notifications" ON notifications
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Service role can manage notifications') THEN
      CREATE POLICY "Service role can manage notifications" ON notifications
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;
END $$;