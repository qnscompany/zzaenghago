-- 1. Create inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
    answer TEXT,
    answered_at TIMESTAMPTZ,
    admin_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can create their own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;

-- Create policies
CREATE POLICY "Users can view their own inquiries" ON public.inquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updated Admin Policies using service_role or meta-data check if possible, 
-- but for standard Supabase JWT we can use the role from metadata if it's synced
CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR SELECT USING (
        (auth.jwt() ->> 'email') = 'qnscompany88@gmail.com' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admins can update inquiries" ON public.inquiries
    FOR UPDATE USING (
        (auth.jwt() ->> 'email') = 'qnscompany88@gmail.com' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
