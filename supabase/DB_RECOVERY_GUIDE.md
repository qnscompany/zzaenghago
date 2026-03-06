# Supabase 긴급 DB 복구 가이드 (DBeaver용)

대시보드 로그인이 되지 않을 때, 외부 DB 관리 도구(DBeaver)를 사용하여 직접 문제를 해결하는 방법입니다.

## 1. DBeaver 설치
- [dbeaver.io/download](https://dbeaver.io/download/)에서 본인의 OS(Windows)에 맞는 설치 파일을 다운로드하여 설치하세요.

## 2. 데이터베이스 연결 설정
1. DBeaver 실행 후 좌측 상단의 **[새 데이터베이스 연결]** (플러그 아이콘) 클릭
2. **PostgreSQL** 선택 후 [Next]
3. **Main** 탭에 아래 정보 입력:
   - **Host**: `aws-0-ap-northeast-2.pooler.supabase.com`
   - **Database**: `postgres`
   - **Port**: `6543` 
   - **User**: `postgres.ivoylfnuwnmwkpytmqxa` (반드시 뒤에 점(.)과 ID를 붙여야 합니다)
   - **Password**: `zho23233816!`
4. 좌측 하단 **[Test Connection]** 클릭
   - 드라이버를 다운로드하라는 창이 뜨면 **[Download]** 클릭
   - `Connected` 메시지가 뜨면 성공입니다.

## 3. 복구 SQL 실행
1. 연결된 데이터베이스 우클릭 -> **[SQL Editor]** -> **[Open SQL console]** 선택
2. 아래 쿼리를 전체 복사해서 붙여넣고 **[Alt + X]** (또는 실행 버튼) 클릭:

```sql
-- [긴급 복구] 순환 참조 제거
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;

CREATE POLICY "Admins can view all user profiles" ON public.users
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR SELECT USING (public.is_admin());
```

3. 실행 완료 후 Supabase 대시보드 새로고침을 시도해 보세요!
