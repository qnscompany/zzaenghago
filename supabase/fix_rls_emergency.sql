-- 1. [긴급] 순환 참조 해결을 위해 공식 관리자 이메일 기반으로 함수 단순화
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- 테이블을 직접 조회하지 않고 JWT 토큰 정보만 사용하여 순환 참조(무한 루프) 방지
    RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. 정책 재확인 및 설정
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
CREATE POLICY "Admins can view all user profiles" ON public.users
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries" ON public.inquiries
    FOR UPDATE USING (public.is_admin());

-- 사용자 본인이 자신의 프로필을 보는 것은 항상 허용 (순환 참조 없음)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
