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

CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  capacity_kw NUMERIC NOT NULL,
  project_type project_type NOT NULL,
  total_amount NUMERIC NOT NULL,
  construction_period TEXT,
  valid_thru DATE,
  included_items TEXT[], -- ['module', 'inverter', 'structure', 'electric', 'civil', 'permits', 'monitoring']
  warranty_years_construction INT,
  warranty_years_module INT,
  as_policy TEXT,
  exclusions TEXT,
  comment TEXT,
  status bid_status DEFAULT 'sent' NOT NULL,
  view_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  UNIQUE(lead_id, company_id),
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

CREATE POLICY "Public view company info via bid" ON public.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bids
      WHERE public.bids.company_id = companies.id AND public.bids.view_token IS NOT NULL
    )
  );

-- Leads
CREATE POLICY "Customers can manage their own leads" ON public.leads
  FOR ALL USING (auth.uid() = customer_id);

-- Bids
CREATE POLICY "Anyone can view a bid with valid token" ON public.bids
  FOR SELECT USING (view_token IS NOT NULL);

CREATE POLICY "Customers can view bids for their own leads" ON public.bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE public.leads.id = bids.lead_id AND public.leads.customer_id = auth.uid()
    )
  );

CREATE POLICY "Companies can manage their own bids" ON public.bids
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE public.companies.id = bids.company_id AND public.companies.user_id = auth.uid()
    )
  );

-- Leads RLS: Allow viewing if part of a bid they own or via token?
-- For now, let's keep it simple: allow viewing lead if linked to a bid.
-- More robust policy:
CREATE POLICY "Public can view lead info via bid token" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bids
      WHERE public.bids.lead_id = leads.id AND public.bids.view_token IS NOT NULL
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
