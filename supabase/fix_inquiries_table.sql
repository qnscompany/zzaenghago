-- 1.-- 1. Ensure the inquiries table exists with correct schema
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
    answer TEXT,
    answered_at TIMESTAMPTZ,
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Force admin role for the known admin email
UPDATE public.users SET role = 'admin' WHERE email = 'qnscompany88@gmail.com';

-- 3. Enable RLS on inquiries (if not already)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Inquiries Policies
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.inquiries;
CREATE POLICY "Users can view their own inquiries" ON public.inquiries
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own inquiries" ON public.inquiries;
CREATE POLICY "Users can create their own inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR SELECT USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR 
        auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'
    );

DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries" ON public.inquiries
    FOR UPDATE USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR 
        auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'
    );

-- 5. IMPORTANT: Add policy to users table so admins can see emails of people who inquired
-- Without this, the join in the admin inquiry page might fail or hide records
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
CREATE POLICY "Admins can view all user profiles" ON public.users
    FOR SELECT USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR 
        auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'
    );
