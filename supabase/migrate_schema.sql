-- 1. Create match_status enum
DO $$ BEGIN
    CREATE TYPE public.match_status AS ENUM ('pre_registered', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Modify companies table
ALTER TABLE public.companies 
    ADD COLUMN IF NOT EXISTS rep_name TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS zipcode TEXT,
    ADD COLUMN IF NOT EXISTS match_status public.match_status DEFAULT 'pre_registered',
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 3. Make user_id nullable for pre-registered data
ALTER TABLE public.companies ALTER COLUMN user_id DROP NOT NULL;

-- 4. Create index for business number lookups
CREATE INDEX IF NOT EXISTS idx_companies_business_number ON public.companies(business_number);

-- 5. Update handle_new_user function to link existing companies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_company_id UUID;
BEGIN
  -- 1. Determine role
  v_role := CASE 
    WHEN new.email = 'qnscompany88@gmail.com' THEN 'admin'::public.user_role
    WHEN (new.raw_user_meta_data->>'role') = 'company' THEN 'company'::public.user_role
    WHEN (new.raw_user_meta_data->>'role') = 'admin' THEN 'admin'::public.user_role
    ELSE 'customer'::public.user_role
  END;

  -- 2. Insert into public.users
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, v_role);

  -- 3. Handle company linkage
  IF v_role = 'company' THEN
    -- Check if business number exists in pre-registered data
    SELECT id INTO v_company_id 
    FROM public.companies 
    WHERE business_number = (new.raw_user_meta_data->>'business_number')
    AND user_id IS NULL;

    IF v_company_id IS NOT NULL THEN
      -- Link existing record
      UPDATE public.companies
      SET 
        user_id = new.id,
        match_status = 'pending',
        registered_at = NOW()
      WHERE id = v_company_id;
    ELSE
      -- Optional: Fallback insertion or error
      -- Since we validate in the server action, this is a safeguard
      INSERT INTO public.companies (user_id, company_name, business_number, match_status, registered_at)
      VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'company_name', '회사명 미등록'), 
        COALESCE(new.raw_user_meta_data->>'business_number', '000-00-00000'),
        'pending',
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure search path
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 6. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);
