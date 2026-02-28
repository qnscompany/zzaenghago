-- Create roles enum
CREATE TYPE user_role AS ENUM ('customer', 'company', 'admin');

-- Create project types enum
CREATE TYPE project_type AS ENUM ('rooftop', 'ground', 'agri');

-- Create status enum for leads
CREATE TYPE lead_status AS ENUM ('open', 'in_progress', 'closed');

-- Create status enum for bids
CREATE TYPE bid_status AS ENUM ('sent', 'accepted', 'rejected');

-- Users table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_number TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  homepage TEXT,
  cumulative_capacity TEXT,
  construction_eval_amount TEXT,
  warranty_period TEXT,
  technician_count TEXT,
  head_office_address TEXT,
  branch_office_address TEXT,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  area_sqm NUMERIC NOT NULL,
  desired_capacity_kw NUMERIC, -- renamed and optional
  project_type project_type NOT NULL,
  budget_range TEXT,
  desired_completion_year INT, -- NEW
  desired_completion_half TEXT, -- NEW (H1/H2)
  ownership_type TEXT, -- NEW: self/family
  applicant_job_type TEXT, -- NEW: employee/business/farmer/unemployed
  wants_financial_info BOOLEAN DEFAULT FALSE, -- NEW
  permits_status JSONB, -- NEW: {electric: bool, development: bool, farmland: bool, other: string}
  additional_notes TEXT, -- NEW
  status lead_status DEFAULT 'open' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  material_cost NUMERIC NOT NULL,
  construction_cost NUMERIC NOT NULL,
  warranty_years INT NOT NULL,
  as_policy TEXT,
  exclusions TEXT,
  total_amount NUMERIC NOT NULL,
  status bid_status DEFAULT 'sent' NOT NULL,
  view_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  token_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Companies
CREATE POLICY "Anyone can view verified companies" ON public.companies
  FOR SELECT USING (is_verified = TRUE);

CREATE POLICY "Companies can manage their own profile" ON public.companies
  FOR ALL USING (auth.uid() = user_id);

-- Leads
CREATE POLICY "Customers can manage their own leads" ON public.leads
  FOR ALL USING (auth.uid() = customer_id);

-- Leads RLS: Strict access
DROP POLICY IF EXISTS "Companies can view lead basic info" ON public.leads;
CREATE POLICY "Company and Admin can view leads" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid() AND (public.users.role = 'company' OR public.users.role = 'admin')
    )
  );

-- Function to handle user creation with robust role casting and Admin check
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
BEGIN
  v_role := CASE 
    WHEN new.email = 'qnscompany88@gmail.com' THEN 'admin'::public.user_role
    WHEN (new.raw_user_meta_data->>'role') = 'company' THEN 'company'::public.user_role
    WHEN (new.raw_user_meta_data->>'role') = 'admin' THEN 'admin'::public.user_role
    ELSE 'customer'::public.user_role
  END;

  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, v_role);

  IF v_role = 'company' THEN
    INSERT INTO public.companies (user_id, company_name, business_number)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'company_name', '회사명 미등록'), 
      COALESCE(new.raw_user_meta_data->>'business_number', '000-00-00000')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set search path for security
ALTER FUNCTION public.handle_new_user() SET search_path = public;
 Jonah

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Profile Updates table for Admin Approval
CREATE TABLE public.profile_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  new_company_name TEXT,
  new_business_number TEXT,
  new_contact_name TEXT,
  new_contact_phone TEXT,
  new_contact_email TEXT,
  new_homepage TEXT,
  new_cumulative_capacity TEXT,
  new_construction_eval_amount TEXT,
  new_warranty_period TEXT,
  new_technician_count TEXT,
  new_head_office_address TEXT,
  new_branch_office_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  handled_at TIMESTAMPTZ,
  admin_comment TEXT
);

ALTER TABLE public.profile_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own updates" ON public.profile_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE public.companies.id = profile_updates.company_id AND public.companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can submit updates" ON public.profile_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE public.companies.id = company_id AND public.companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view and manage all updates" ON public.profile_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid() AND public.users.role = 'admin'
    )
  );
