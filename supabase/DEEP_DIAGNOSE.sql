-- [심층 진단 SQL] 데이터가 안 보이는 이유를 100% 파악합니다.

-- 1. 현재 대시보드 로그인 사용자의 '진짜' 정보를 확인합니다.
-- (여기서 나오는 email이 qnscompany88@gmail.com과 정확히 일치하는지 대소문자까지 확인하세요)
SELECT 
    auth.uid() as 내_아이디,
    auth.jwt() ->> 'email' as 내_이메일,
    (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com') as 이메일_일치_여부;

-- 2. RLS 정책을 일시적으로 '완전히 개방'하여 데이터가 존재하는지 확인합니다.
-- (이걸 실행하고 웹사이트를 새로고침했을 때 데이터가 보인다면 RLS 정책 문제인 것이 확실해집니다)
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
CREATE POLICY "TEMP_OPEN_ACCESS" ON public.inquiries FOR SELECT USING (true);

-- 3. 유저 테이블도 조인 에러 방지를 위해 일시 개방합니다.
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
CREATE POLICY "TEMP_OPEN_USERS" ON public.users FOR SELECT USING (true);

-- 4. 실제 데이터의 user_id가 존재하는지도 체크
SELECT 
    i.id, 
    i.title, 
    i.user_id,
    u.email as 작성자_이메일
FROM public.inquiries i
LEFT JOIN public.users u ON i.user_id = u.id;
