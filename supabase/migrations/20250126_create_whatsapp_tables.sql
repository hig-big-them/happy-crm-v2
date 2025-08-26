-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    business_code TEXT UNIQUE,
    phone TEXT,
    whatsapp_connected BOOLEAN DEFAULT FALSE,
    whatsapp_waba_id TEXT,
    whatsapp_phone_number_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create whatsapp_accounts table
CREATE TABLE IF NOT EXISTS public.whatsapp_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    waba_id TEXT NOT NULL,
    phone_number_id TEXT NOT NULL,
    verified_name TEXT,
    display_phone_number TEXT,
    status TEXT DEFAULT 'active',
    quality_rating TEXT,
    business_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(waba_id, phone_number_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_business_code ON public.profiles(business_code);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_connected ON public.profiles(whatsapp_connected);
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_user_id ON public.whatsapp_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_waba_id ON public.whatsapp_accounts(waba_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_phone_number_id ON public.whatsapp_accounts(phone_number_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for whatsapp_accounts
CREATE POLICY "Users can view own whatsapp accounts" ON public.whatsapp_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whatsapp accounts" ON public.whatsapp_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whatsapp accounts" ON public.whatsapp_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
