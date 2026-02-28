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
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  area_sqm NUMERIC NOT NULL,
  expected_capacity_kw NUMERIC NOT NULL,
  project_type project_type NOT NULL,
  budget_range TEXT,
  desired_start DATE,
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

CREATE POLICY "Companies can view lead basic info" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid() AND public.users.role = 'company'
    )
  );

-- Bids (The most specific one)
CREATE POLICY "Customer can view bids for their leads" ON public.bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE public.leads.id = public.bids.lead_id AND public.leads.customer_id = auth.uid()
    )
  );

CREATE POLICY "Company can view their own bids" ON public.bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE public.companies.id = public.bids.company_id AND public.companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Company can insert bids" ON public.bids
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE public.companies.id = public.bids.company_id AND public.companies.user_id = auth.uid()
    )
  );

-- View Token Policy: Allow anyone with a valid unused token to view the bid
CREATE POLICY "View bid via one-time token" ON public.bids
  FOR SELECT USING (token_used = FALSE);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
