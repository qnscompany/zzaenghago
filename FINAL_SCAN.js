const { Client } = require('pg');

const projectRef = 'ivoylfnuwnmwkpytmqxa';
const password = 'zho23233816!'; // 사용자가 주신 비밀번호

// Supabase가 사용하는 전 세계 모든 리전 목록
const regions = [
    'ap-northeast-2', 'ap-northeast-1', 'ap-southeast-1', 'ap-southeast-2',
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
    'ca-central-1', 'sa-east-1'
];

async function scanAll() {
    console.log('🌐 전 세계 Supabase 리전 정밀 스캔을 시작합니다...');

    for (const region of regions) {
        const host = `aws-0-${region}.pooler.supabase.com`;
        console.log(`\n🔍 [${region}] 체크 중...`);

        for (const port of [6543, 5432]) {
            const client = new Client({
                host: host,
                port: port,
                user: `postgres.${projectRef}`,
                password: password,
                database: 'postgres',
                connectionTimeoutMillis: 4000,
                ssl: { rejectUnauthorized: false }
            });

            try {
                await client.connect();
                console.log(`✅ [성공!] 리전: ${region}, 포트: ${port}`);

                const sql = `
          CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ 
          BEGIN RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'); END; 
          $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
          DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
          DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
        `;
                await client.query(sql);
                console.log('🚀 복구 SQL 실행 성공!');
                await client.end();
                process.exit(0);
            } catch (err) {
                if (err.message.includes('password authentication failed')) {
                    console.log(`   🔸 리전은 맞으나 [비밀번호 틀림]: ${region}`);
                } else if (err.message.includes('Tenant or user not found')) {
                    // 리전이 아님
                } else {
                    console.log(`   ❌ 에러 (${port}): ${err.message}`);
                }
            } finally {
                try { await client.end(); } catch (e) { }
            }
        }
    }
    console.log('\n❌ 모든 시도가 실패했습니다. 비밀번호가 정말 맞는지 확인이 필요합니다.');
}

scanAll();
