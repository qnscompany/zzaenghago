-- Mock Matching Data for Admin Control View

DO $$
DECLARE
    v_customer_id UUID;
    v_company1_id UUID;
    v_company2_id UUID;
    v_lead1_id UUID;
    v_lead2_id UUID;
BEGIN
    -- 1. Get existing data or create
    SELECT id INTO v_customer_id FROM public.users WHERE role = 'customer' LIMIT 1;
    SELECT id INTO v_company1_id FROM public.companies LIMIT 1;
    SELECT id INTO v_company2_id FROM public.companies OFFSET 1 LIMIT 1;

    -- 2. Create Sample Leads
    INSERT INTO public.leads (customer_id, address, area_sqm, desired_capacity_kw, project_type, status)
    VALUES 
    (v_customer_id, '경기도 성남시 분당구 판교역로 166', 330, 50, 'rooftop', 'open')
    RETURNING id INTO v_lead1_id;

    INSERT INTO public.leads (customer_id, address, area_sqm, desired_capacity_kw, project_type, status)
    VALUES 
    (v_customer_id, '경상북도 안동시 풍천면 도청대로 455', 1500, 200, 'ground', 'open')
    RETURNING id INTO v_lead2_id;

    -- 3. Create Sample Bids for Lead 1
    INSERT INTO public.bids (lead_id, company_id, capacity_kw, project_type, total_amount, status)
    VALUES (v_lead1_id, v_company1_id, 50, 'rooftop', 65000000, 'sent');

    INSERT INTO public.bids (lead_id, company_id, capacity_kw, project_type, total_amount, status, is_selected, customer_info_unlocked)
    VALUES (v_lead1_id, v_company2_id, 52, 'rooftop', 63000000, 'sent', true, true);

    -- 4. Create Sample Bids for Lead 2
    INSERT INTO public.bids (lead_id, company_id, capacity_kw, project_type, total_amount, status)
    VALUES (v_lead2_id, v_company1_id, 200, 'ground', 280000000, 'sent');

    -- Update Lead 1 status as matched
    UPDATE public.leads SET status = 'contract_pending', matched_at = NOW() WHERE id = v_lead1_id;

END $$;
