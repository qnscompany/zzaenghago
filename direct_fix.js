const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:zho23233816!@db.ivoylfnuwnmwkpytmqxa.supabase.co:5432/postgres",
    connectionTimeoutMillis: 10000,
});

async function fix() {
    console.log('Connecting to Postgres directly...');
    try {
        await client.connect();
        console.log('Connected successfully!');

        console.log('Executing recovery SQL...');
        const sql = `
      -- 1. is_admin 함수를 순환 참조가 없는 버전으로 교체
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS BOOLEAN AS $$
      BEGIN
          RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com');
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

      -- 2. 문제가 된 정책 삭제 및 재설정
      DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
      DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
      
      -- 3. 안전한 기본 정책 확인
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
      CREATE POLICY "Users can view their own profile" ON public.users
          FOR SELECT USING (auth.uid() = id);

      -- 4. 관리자 전용 정책 (한 방향으로만)
      CREATE POLICY "Admins can view all user profiles" ON public.users
          FOR SELECT USING (public.is_admin());
      
      CREATE POLICY "Admins can view all inquiries" ON public.inquiries
          FOR SELECT USING (public.is_admin());
    `;

        await client.query(sql);
        console.log('RECOVERY SQL EXECUTED SUCCESSFULLY!');
        console.log('Dashboard and Login should be restored now.');

    } catch (err) {
        console.error('FAILED TO CONNECT OR EXECUTE:', err.message);
    } finally {
        await client.end();
    }
}

fix();
