-- [긴급 복구] 무한 루프를 유발하는 RLS 정책 및 함수 강제 삭제/수정
-- 이 스크립트는 대시보드가 느려지거나 멈췄을 때 SQL Editor에서 가장 먼저 실행해야 합니다.

-- 1. 무한 루프의 원인이 되는 함수를 즉시 0(성공) 또는 false로 리턴하도록 수정
-- (테이블 조회를 하지 않게 하여 루프를 끊음)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- 단순히 JWT 이메일 체크만 수행 (테이블 조회 X)
    RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. 혹은 문제가 되는 정책을 완전히 삭제 (확실한 방법)
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;

-- 3. 안전하게 본인 프로필만 볼 수 있는 정책 재설정
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- 4. (필요 시) 모든 RLS 일시 비활성화 (대시보드가 아예 안 뜰 경우 마지막 수단)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;
