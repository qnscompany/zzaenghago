-- 1. 확장 기능 활성화 (UUID 생성 및 비밀번호 암호화용)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    -- 시공사 5명 UUID
    company_1_id UUID := gen_random_uuid();
    company_2_id UUID := gen_random_uuid();
    company_3_id UUID := gen_random_uuid();
    company_4_id UUID := gen_random_uuid();
    company_5_id UUID := gen_random_uuid();
    -- 발전사업자 3명 UUID
    customer_1_id UUID := gen_random_uuid();
    customer_2_id UUID := gen_random_uuid();
    customer_3_id UUID := gen_random_uuid();
    
    -- 생성된 부지 ID
    lead_1_id UUID;
    lead_2_id UUID;
    lead_3_id UUID;
    lead_4_id UUID;
    lead_5_id UUID;
    lead_6_id UUID;
    
    comp1_id UUID;
    comp2_id UUID;
    comp3_id UUID;
    comp4_id UUID;
    comp5_id UUID;
    
    default_password TEXT := crypt('1234567890', gen_salt('bf'));
    now_ts TIMESTAMP WITH TIME ZONE := now();
BEGIN
    RAISE NOTICE '🌱 시뮬레이션 데이터 시딩 시작...';

    -- [1] auth.users 및 public.users 가입 처리 로직 우회 삽입
    -- (auth.users 삽입을 생략하고 public.users에만 넣거나, 실제 로그인을 위해선 auth.users가 필수)
    -- 보안상 supabase dashboard SQL Editor 에서는 auth 스키마 직접 조작이 가능합니다.
    
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES
    ('00000000-0000-0000-0000-000000000000', company_1_id, 'authenticated', 'authenticated', 'company1@sim.com', default_password, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"company"}', now_ts, now_ts),
    ('00000000-0000-0000-0000-000000000000', company_2_id, 'authenticated', 'authenticated', 'company2@sim.com', default_password, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"company"}', now_ts, now_ts),
    ('00000000-0000-0000-0000-000000000000', company_3_id, 'authenticated', 'authenticated', 'company3@sim.com', default_password, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"company"}', now_ts, now_ts),
    ('00000000-0000-0000-0000-000000000000', company_4_id, 'authenticated', 'authenticated', 'company4@sim.com', default_password, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"company"}', now_ts, now_ts),
    ('00000000-0000-0000-0000-000000000000', company_5_id, 'authenticated', 'authenticated', 'company5@sim.com', default_password, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"company"}', now_ts, now_ts),
    
    ('00000000-0000-0000-0000-000000000000', customer_1_id, 'authenticated', 'authenticated', 'customer1@sim.com', default_password, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"customer"}', now_ts, now_ts),
    ('00000000-0000-0000-0000-000000000000', customer_2_id, 'authenticated', 'authenticated', 'customer2@sim.com', default_password, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"customer"}', now_ts, now_ts),
    ('00000000-0000-0000-0000-000000000000', customer_3_id, 'authenticated', 'authenticated', 'customer3@sim.com', default_password, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"customer"}', now_ts, now_ts);

    -- [2] public.users 정보 갱신 (트리거로 생성되었을 수 있으므로 upsert 혹은 update 처리)
    UPDATE public.users SET role = 'company' WHERE id IN (company_1_id, company_2_id, company_3_id, company_4_id, company_5_id);
    UPDATE public.users SET role = 'customer' WHERE id IN (customer_1_id, customer_2_id, customer_3_id);

    -- [3] 시공사(companies) 승인 완료 처리 및 초기 크레딧 부여
    UPDATE public.companies SET company_name = '시뮬레이션 시공사 1', match_status = 'approved', is_verified = true WHERE user_id = company_1_id RETURNING id INTO comp1_id;
    UPDATE public.companies SET company_name = '시뮬레이션 시공사 2', match_status = 'approved', is_verified = true WHERE user_id = company_2_id RETURNING id INTO comp2_id;
    UPDATE public.companies SET company_name = '시뮬레이션 시공사 3', match_status = 'approved', is_verified = true WHERE user_id = company_3_id RETURNING id INTO comp3_id;
    UPDATE public.companies SET company_name = '시뮬레이션 시공사 4', match_status = 'approved', is_verified = true WHERE user_id = company_4_id RETURNING id INTO comp4_id;
    UPDATE public.companies SET company_name = '시뮬레이션 시공사 5', match_status = 'approved', is_verified = true WHERE user_id = company_5_id RETURNING id INTO comp5_id;

    -- 크레딧 3개씩 부여
    UPDATE public.credits SET balance = 3 WHERE company_id IN (comp1_id, comp2_id, comp3_id, comp4_id, comp5_id);

    -- [4] 부지(leads) 6개 생성 (고객 1명당 2개)
    INSERT INTO public.leads (customer_id, address, area_sqm, desired_capacity_kw, project_type, status, budget_range) VALUES
    (customer_1_id, '서울특별시 강남구 테헤란로 111 (고객1-부지A)', 1000, 100, 'rooftop', 'open', '1억~3억') RETURNING id INTO lead_1_id;
    INSERT INTO public.leads (customer_id, address, area_sqm, desired_capacity_kw, project_type, status, budget_range) VALUES
    (customer_1_id, '서울특별시 강남구 테헤란로 112 (고객1-부지B)', 2000, 200, 'ground', 'open', '3억~5억') RETURNING id INTO lead_2_id;
    
    INSERT INTO public.leads (customer_id, address, area_sqm, desired_capacity_kw, project_type, status, budget_range) VALUES
    (customer_2_id, '부산광역시 해운대구 센텀중앙로 21 (고객2-부지A)', 1500, 150, 'rooftop', 'open', '1억~3억') RETURNING id INTO lead_3_id;
    INSERT INTO public.leads (customer_id, address, area_sqm, desired_capacity_kw, project_type, status, budget_range) VALUES
    (customer_2_id, '부산광역시 해운대구 센텀중앙로 22 (고객2-부지B)', 2500, 250, 'ground', 'open', '5억 이상') RETURNING id INTO lead_4_id;
    
    INSERT INTO public.leads (customer_id, address, area_sqm, desired_capacity_kw, project_type, status, budget_range) VALUES
    (customer_3_id, '제주특별자치도 제주시 첨단로 31 (고객3-부지A)', 1200, 120, 'rooftop', 'open', '1억 미만') RETURNING id INTO lead_5_id;
    INSERT INTO public.leads (customer_id, address, area_sqm, desired_capacity_kw, project_type, status, budget_range) VALUES
    (customer_3_id, '제주특별자치도 제주시 첨단로 32 (고객3-부지B)', 3000, 300, 'ground', 'open', '5억 이상') RETURNING id INTO lead_6_id;

    -- [5] 견적 발송 (bids) - 시공사별 3개 부지 입찰
    -- 시공사1 -> 부지 1, 2, 3
    PERFORM public.send_bid_with_credits(lead_1_id, comp1_id, 99.9, 'rooftop', 140000000, '시공사1의 최고 견적입니다.', 3, 12);
    PERFORM public.send_bid_with_credits(lead_2_id, comp1_id, 199.9, 'ground', 280000000, '시공사1의 2번지 견적입니다.', 3, 12);
    PERFORM public.send_bid_with_credits(lead_3_id, comp1_id, 149.9, 'rooftop', 210000000, '시공사1의 센텀 견적입니다.', 3, 12);
    
    -- 시공사2 -> 부지 2, 3, 4
    PERFORM public.send_bid_with_credits(lead_2_id, comp2_id, 199.9, 'ground', 285000000, '시공사2의 2번지 견적입니다.', 5, 20);
    PERFORM public.send_bid_with_credits(lead_3_id, comp2_id, 149.9, 'rooftop', 215000000, '시공사2의 센텀 견적입니다.', 5, 20);
    PERFORM public.send_bid_with_credits(lead_4_id, comp2_id, 249.9, 'ground', 350000000, '시공사2의 대형 부지 견적입니다.', 5, 20);

    -- 시공사3 -> 부지 3, 4, 5
    PERFORM public.send_bid_with_credits(lead_3_id, comp3_id, 149.9, 'rooftop', 205000000, '합리적인 시공사3 견적.', 3, 10);
    PERFORM public.send_bid_with_credits(lead_4_id, comp3_id, 249.9, 'ground', 345000000, '시공사3: 품질 보장합니다.', 3, 10);
    PERFORM public.send_bid_with_credits(lead_5_id, comp3_id, 119.9, 'rooftop', 160000000, '제주 부지 최적화 제안.', 3, 10);

    -- 시공사4 -> 부지 4, 5, 6
    PERFORM public.send_bid_with_credits(lead_4_id, comp4_id, 249.9, 'ground', 340000000, '가장 저렴한 시공사4.', 2, 12);
    PERFORM public.send_bid_with_credits(lead_5_id, comp4_id, 119.9, 'rooftop', 155000000, '제주 소과금 시공.', 2, 12);
    PERFORM public.send_bid_with_credits(lead_6_id, comp4_id, 299.9, 'ground', 420000000, '제주 대형 부지 최저가.', 2, 12);

    -- 시공사5 -> 부지 5, 6, 1
    PERFORM public.send_bid_with_credits(lead_5_id, comp5_id, 119.9, 'rooftop', 170000000, '시공사5: 프리미엄 시공 진행.', 5, 15);
    PERFORM public.send_bid_with_credits(lead_6_id, comp5_id, 299.9, 'ground', 440000000, 'AS 보장 프리미엄.', 5, 15);
    PERFORM public.send_bid_with_credits(lead_1_id, comp5_id, 99.9, 'rooftop', 145000000, '테헤란로 특별 프로모션.', 5, 15);

    RAISE NOTICE '✅ 시뮬레이션 데이터 세팅오나료!!';
END $$;
