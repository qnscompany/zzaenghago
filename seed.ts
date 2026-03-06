import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🌱 시뮬레이션 데이터 시딩을 시작합니다...');

    // 1. 기존 데이터에서 시공사 5곳 이름 가져오기 (임의 추출)
    const { data: existingCompanies } = await supabase
        .from('companies')
        .select('company_name, business_number')
        .limit(5);

    const companyNames = existingCompanies?.map(c => c.company_name) || [];
    for (let i = companyNames.length; i < 5; i++) {
        companyNames.push(`테스트 시공사 ${i + 1}`);
    }

    // 2. 시공사 5곳 가입 (임의 아이디, 비번 1234567890)
    const companyIds: string[] = [];
    for (let i = 0; i < 5; i++) {
        const email = `company${i + 1}@test.com`;
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: '1234567890',
            email_confirm: true,
            user_metadata: { role: 'company', company_name: companyNames[i] }
        });

        let uid;
        if (authErr) {
            console.log(`[시공사] ${email} 이미 존재함. 기존 계정 사용.`);
            const { data: ex } = await supabase.from('users').select('id').eq('email', email).single();
            if (ex) uid = ex.id;
        } else {
            console.log(`[시공사] ${email} (${companyNames[i]}) 가입 완료.`);
            uid = authData.user.id;
        }

        await sleep(500); // Trigger가 company와 credit을 생성할 시간을 약간 줍니다.

        // 해당 시공사의 companies.id 가져오기 및 승인 처리
        if (uid) {
            const { data: comp } = await supabase.from('companies').select('id').eq('user_id', uid).single();
            if (comp) {
                await supabase.from('companies').update({ match_status: 'approved', is_verified: true }).eq('id', comp.id);
                companyIds.push(comp.id);
            }
        }
    }

    // 3. 고객 3명 가입
    const customerIds: string[] = [];
    for (let i = 0; i < 3; i++) {
        const email = `customer${i + 1}@test.com`;
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: '1234567890',
            email_confirm: true,
            user_metadata: { role: 'customer' }
        });

        if (authErr) {
            console.log(`[고객] ${email} 이미 존재함. 기존 계정 사용.`);
            const { data: ex } = await supabase.from('users').select('id').eq('email', email).single();
            if (ex) customerIds.push(ex.id);
        } else {
            console.log(`[고객] ${email} 가입 완료.`);
            customerIds.push(authData.user.id);
        }
    }

    // 4. 각 고객당 2개씩 부지 등록 (총 6개)
    const leadIds: string[] = [];
    let leadCount = 1;
    for (const cid of customerIds) {
        for (let j = 0; j < 2; j++) {
            const { data: lead, error: leadErr } = await supabase.from('leads').insert({
                customer_id: cid,
                address: `서울특별시 강남구 테헤란로 ${leadCount}1 번지`,
                area_sqm: 1000 + (leadCount * 200),
                desired_capacity_kw: 100 + (leadCount * 20),
                project_type: leadCount % 2 === 0 ? 'rooftop' : 'ground',
                status: 'open',
                budget_range: '1억~3억',
            }).select('id').single();

            if (leadErr) {
                console.error(`[부지 오류]`, leadErr.message);
            } else if (lead) {
                console.log(`[부지] 고객 ${cid.substring(0, 6)}의 ${leadCount}번째 부지 등록 완료.`);
                leadIds.push(lead.id);
                leadCount++;
            }
        }
    }

    // 5. 시공사 5곳이 각각 3개의 크레딧을 사용하여 6개 부지에 골고루 견적(bids) 발송
    // 시공사 1: 부지 1, 2, 3
    // 시공사 2: 부지 2, 3, 4
    // 시공사 3: 부지 3, 4, 5
    // 시공사 4: 부지 4, 5, 6
    // 시공사 5: 부지 5, 6, 1
    const bidDistribution = [
        [0, 1, 2],
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
        [4, 5, 0]
    ];

    console.log(`\n🚀 시공사 견적(Bid) 발송 시뮬레이션 시작...`);
    for (let c = 0; c < 5; c++) {
        const cId = companyIds[c];
        if (!cId) continue;

        const assignedLeads = bidDistribution[c];
        for (const lIdx of assignedLeads) {
            const lId = leadIds[lIdx];
            if (!lId) continue;

            // RPC 호출 (크레딧 차감 + 견적 생성 + 히스토리 기록이 한 번에 트랜잭션으로 처리됨)
            const { error: bidErr } = await supabase.rpc('send_bid_with_credits', {
                p_lead_id: lId,
                p_company_id: cId,
                p_capacity_kw: 99.9,
                p_project_type: 'rooftop',
                p_total_amount: 140000000 + (c * 5000000), // 금액을 다르게 설정
                p_comment: `안녕하세요, 시공사 ${c + 1}입니다. 최고의 품질로 시공해드리겠습니다.`,
                p_warranty_years_construction: 3,
                p_warranty_years_module: 12
            });

            if (bidErr) {
                console.error(`[견적 오류] 시공사 ${c + 1} -> 부지 ${lIdx + 1}:`, bidErr.message);
            } else {
                console.log(`[견적 발송] 시공사 ${c + 1} -> 부지 ${lIdx + 1} 견적 발송 완료 (크레딧 -1)`);
            }
        }
    }

    console.log('\n✅ 쨍하고 시뮬레이션 데이터 구축이 모두 완료되었습니다!');
}

main().catch(console.error);
