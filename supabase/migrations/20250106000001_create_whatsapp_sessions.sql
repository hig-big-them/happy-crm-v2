-- Create WhatsApp Sessions table for tracking 24-hour conversation windows
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_inbound_message_at TIMESTAMPTZ,
    last_outbound_message_at TIMESTAMPTZ,
    template_initiated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_lead_phone 
ON whatsapp_sessions(lead_id, phone_number);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_active 
ON whatsapp_sessions(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_session_end 
ON whatsapp_sessions(session_end) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone 
ON whatsapp_sessions(phone_number);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_whatsapp_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_sessions_updated_at
    BEFORE UPDATE ON whatsapp_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_sessions_updated_at();

-- Enable RLS
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view whatsapp_sessions for their leads" ON whatsapp_sessions
    FOR SELECT USING (
        lead_id IN (
            SELECT id FROM leads 
            WHERE created_by = auth.uid() 
            OR assigned_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert whatsapp_sessions for their leads" ON whatsapp_sessions
    FOR INSERT WITH CHECK (
        lead_id IN (
            SELECT id FROM leads 
            WHERE created_by = auth.uid() 
            OR assigned_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update whatsapp_sessions for their leads" ON whatsapp_sessions
    FOR UPDATE USING (
        lead_id IN (
            SELECT id FROM leads 
            WHERE created_by = auth.uid() 
            OR assigned_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete whatsapp_sessions for their leads" ON whatsapp_sessions
    FOR DELETE USING (
        lead_id IN (
            SELECT id FROM leads 
            WHERE created_by = auth.uid() 
            OR assigned_user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT ALL ON whatsapp_sessions TO authenticated;