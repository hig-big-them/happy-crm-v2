-- 📱 Ana Messages Tablosu
-- Tüm mesaj türlerini (WhatsApp, SMS, Email, Not) tek tabloda saklar

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- İlişkiler
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  
  -- Mesaj bilgileri
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'note')),
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  
  -- Durum bilgileri
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'pending')),
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_starred_by UUID REFERENCES auth.users(id),
  starred_at TIMESTAMP WITH TIME ZONE,
  
  -- Zaman damgaları
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- Channel-specific metadata (JSONB)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- WhatsApp specific fields (metadata içinde saklanacak)
  -- message_id, from_number, to_number, template_name, etc.
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_is_starred ON messages(is_starred) WHERE is_starred = TRUE;
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their leads
CREATE POLICY "Users can view messages for their leads" ON messages
  FOR SELECT USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE created_by = auth.uid() 
      OR assigned_user_id = auth.uid()
    )
  );

-- Users can insert messages for their leads
CREATE POLICY "Users can insert messages for their leads" ON messages
  FOR INSERT WITH CHECK (
    lead_id IN (
      SELECT id FROM leads 
      WHERE created_by = auth.uid() 
      OR assigned_user_id = auth.uid()
    )
  );

-- Users can update messages for their leads
CREATE POLICY "Users can update messages for their leads" ON messages
  FOR UPDATE USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE created_by = auth.uid() 
      OR assigned_user_id = auth.uid()
    )
  );

-- Superusers have full access
CREATE POLICY "Superusers have full access to messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'superuser'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Mevcut whatsapp_messages verilerini messages tablosuna migrate et
INSERT INTO messages (
  lead_id,
  channel,
  direction,
  content,
  status,
  sent_at,
  delivered_at,
  read_at,
  failed_at,
  metadata,
  created_at,
  updated_at
)
SELECT 
  lead_id,
  'whatsapp' as channel,
  CASE WHEN is_incoming THEN 'incoming' ELSE 'outgoing' END as direction,
  content->>'text' as content,
  status,
  sent_at,
  delivered_at,
  read_at,
  failed_at,
  jsonb_build_object(
    'message_id', message_id,
    'from_number', from_number,
    'to_number', to_number,
    'message_type', message_type,
    'pricing_info', pricing_info,
    'template_name', template_name,
    'template_language', template_language,
    'template_variables', template_variables,
    'conversation_id', conversation_id,
    'context_message_id', context_message_id,
    'media_id', media_id,
    'media_url', media_url,
    'media_mime_type', media_mime_type,
    'media_sha256', media_sha256,
    'media_file_size', media_file_size,
    'webhook_data', webhook_data
  ) as metadata,
  created_at,
  updated_at
FROM whatsapp_messages
WHERE lead_id IS NOT NULL
ON CONFLICT DO NOTHING;
