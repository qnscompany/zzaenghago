-- [진단용 SQL] 현재 데이터베이스의 권한 상태를 확인합니다.

-- 1. 사용자 테이블의 역할 확인
SELECT id, email, role, created_at FROM public.users;

-- 2. 문의 내역 테이블의 데이터 유무 확인
SELECT count(*) as inquiry_count FROM public.inquiries;

-- 3. 현재 브라우저(대시보드) 로그인 정보 확인 (SQL Editor에서 실행 시)
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() ->> 'email' as current_user_email;

-- 4. 관리자 판별 함수 내용 확인
SELECT 
    proname, 
    prosrc 
FROM pg_proc 
WHERE proname = 'is_admin';
