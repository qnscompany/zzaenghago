-- [긴급 복구] 순환 참조 함수 강제 삭제
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 안전한 버전으로 다시 생성
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
