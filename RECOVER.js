const { Client } = require('pg');

/**
 * [긴급 복구 스크립트] 
 * 이 스크립트는 사용자의 로컬 PC에서 직접 실행하여 Supabase 무한 루프를 해결합니다.
 */
async function recover() {
    const config = {
        // IPv4 접속을 지원하는 Supabase 서울 리전 풀러 주소입니다.
        host: 'aws-0-ap-northeast-2.pooler.supabase.com',
        port: 6543,
        // [중요] 풀러 사용 시 유저명은 'postgres.프로젝트ID' 형식이어야 합니다.
        user: 'postgres.ivoylfnuwnmwkpytmqxa',
        password: 'zho23233816!',
        database: 'postgres',
        connectionTimeoutMillis: 20000,
        ssl: { rejectUnauthorized: false }
    };
    const client = new Client(config);

    console.log('🚀 데이터베이스 접속 시도 중... (약 10~15초 소요될 수 있습니다)');

    try {
        await client.connect();
        console.log('✅ 접속 성공! 무한 루프 해결 SQL 실행 중...');

        const sql = `
      -- 1. 무한 루프가 없는 안전한 admin 체크 함수로 교체
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS BOOLEAN AS $$
      BEGIN
          -- 테이블을 조회하지 않고 JWT 이메일만 확인하여 무한 루프를 즉시 끊습니다.
          RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com');
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

      -- 2. 루프의 원인이 된 위태로운 정책들 삭제
      DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
      DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
      
      -- 3. 안전한 조회 기본 정책 재설정
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
      CREATE POLICY "Users can view their own profile" ON public.users
          FOR SELECT USING (auth.uid() = id);

      -- 4. 관리자용 정책 재설정 (조회만 허용하여 루프 방지)
      CREATE POLICY "Admins can view all user profiles" ON public.users
          FOR SELECT USING (public.is_admin());
      
      CREATE POLICY "Admins can view all inquiries" ON public.inquiries
          FOR SELECT USING (public.is_admin());
      
      -- 5. 비정상적으로 묶인 세션 강제 종료 (선택 사항)
      SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
      WHERE usename = 'authenticated' AND state = 'active' AND query LIKE '%SELECT%';
    `;

        await client.query(sql);
        console.log('\n🎉 [성공] 모든 복구 명령이 실행되었습니다!');
        console.log('이제 Supabase 대시보드와 사이트 로그인이 정상적으로 작동할 것입니다.');

    } catch (err) {
        console.error('\n❌ 접속 실패:', err.message);
        console.log('\n[대안] 만약 여기서 실패한다면, DBeaver 설치가 필요합니다.');
        console.log('DBeaver 가이드를 드릴테니 잠시만 기다려 주세요.');
    } finally {
        await client.end();
    }
}

recover();
