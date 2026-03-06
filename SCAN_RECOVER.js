const { Client } = require('pg');

/**
 * [최종 통합 복구 스크립트]
 * 가능한 모든 리전의 풀러 주소를 테스트합니다.
 */
const projectRef = 'ivoylfnuwnmwkpytmqxa';
const password = 'zho23233816!';

const regions = [
    'ap-northeast-2', // 서울 (가장 유력)
    'ap-northeast-1', // 도쿄
    'ap-southeast-1', // 싱가포르
    'us-east-1',      // 버지니아
    'eu-west-1'       // 아일랜드
];

async function scan() {
    console.log('🔍 가능한 모든 리전의 접속 통로를 스캔합니다...');

    for (const region of regions) {
        const host = `aws-0-${region}.pooler.supabase.com`;
        console.log(`\n--- [테스트 리전: ${region}] ---`);

        // 포트 6543 (Transaction)과 5432 (Session) 모두 시도
        for (const port of [6543, 5432]) {
            console.log(`📡 접속 시도: ${host}:${port}...`);

            const client = new Client({
                host: host,
                port: port,
                user: `postgres.${projectRef}`,
                password: password,
                database: 'postgres',
                connectionTimeoutMillis: 5000,
                ssl: { rejectUnauthorized: false }
            });

            try {
                await client.connect();
                console.log(`✅ [성공] ${region} 리전 포트 ${port}로 접속되었습니다!`);

                const sql = `
          CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ 
          BEGIN RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'); END; 
          $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
          DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
          DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
        `;
                await client.query(sql);
                console.log('🎉 복구 SQL 실행 완료! 이제 정상적으로 이용 가능합니다.');
                await client.end();
                process.exit(0);
            } catch (err) {
                if (err.message.includes('Tenant or user not found')) {
                    console.log(`   ❌ 실패: 이 리전(${region})에 해당 프로젝트가 없습니다.`);
                } else if (err.message.includes('timeout')) {
                    console.log(`   ❌ 실패: 응답 시간이 초과되었습니다.`);
                } else {
                    console.log(`   ❌ 실패: ${err.message}`);
                }
            } finally {
                try { await client.end(); } catch (e) { }
            }
        }
    }

    console.log('\n❌ 모든 리전 접속 시도가 실패했습니다.');
    console.log('비밀번호가 맞는지 다시 한 번 확인해 주시고, 에러 메시지를 알려주세요.');
}

scan();
