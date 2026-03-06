-- 1. 관리자 여부를 확인하는 보안 함수 생성 (SECURITY DEFINER로 순환 참조 방지)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT (role = 'admin')
        FROM public.users
        WHERE id = auth.uid()
    ) OR (
        auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. public.users 테이블 정책 수정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;

-- 새 정책 적용
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all user profiles" ON public.users
    FOR SELECT USING (public.is_admin());

-- 3. public.inquiries 테이블 정책 수정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can submit inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can create their own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;

-- 새 정책 적용 (is_admin() 함수 사용)
CREATE POLICY "Users can view their own inquiries" ON public.inquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update inquiries" ON public.inquiries
    FOR UPDATE USING (public.is_admin());

-- 4. 추가 보안: 관리자가 답변 시 admin_id가 자동으로 설정되도록 권한 정책 보완
CREATE POLICY "Admins can delete inquiries" ON public.inquiries
    FOR DELETE USING (public.is_admin());
