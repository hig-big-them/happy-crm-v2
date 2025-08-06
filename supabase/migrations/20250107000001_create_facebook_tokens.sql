-- Create Facebook tokens table for storing OAuth access tokens
CREATE TABLE IF NOT EXISTS facebook_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    token_type VARCHAR(50) DEFAULT 'bearer',
    expires_at TIMESTAMPTZ,
    business_id VARCHAR(255),
    scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facebook_tokens_user_id ON facebook_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_tokens_business_id ON facebook_tokens(business_id);
CREATE INDEX IF NOT EXISTS idx_facebook_tokens_expires_at ON facebook_tokens(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE facebook_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own Facebook tokens" ON facebook_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Facebook tokens" ON facebook_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Facebook tokens" ON facebook_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Facebook tokens" ON facebook_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Create activity logs table if not exists
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Enable RLS for activity logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activity logs
CREATE POLICY "Users can view their own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for facebook_tokens
DROP TRIGGER IF EXISTS update_facebook_tokens_updated_at ON facebook_tokens;
CREATE TRIGGER update_facebook_tokens_updated_at
    BEFORE UPDATE ON facebook_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON facebook_tokens TO authenticated;
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;