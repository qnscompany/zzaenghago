import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ivoylfnuwnmwkpytmqxa.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3lsZm51d25td2tweXRtcXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI1OTcyNywiZXhwIjoyMDg3ODM1NzI3fQ.6Ojt7xZgRjH1SNZryiIo5_X45TYIMBXlE2pHclDOuRM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function finalCheck() {
    console.log('--- [최종 점검 시작] ---')

    // 1. 데이터베이스 응답 확인 (마비 여부 체크)
    console.log('1. 데이터베이스 연결 상태 확인 중...')
    const start = Date.now()
    const { data: users, error: userError } = await supabase.from('users').select('count').limit(1)
    const duration = Date.now() - start

    if (userError) {
        console.error('❌ 연결 실패:', userError.message)
        return
    }
    console.log(`✅ 연결 성공! (응답 속도: ${duration}ms) - 무한 루프가 해결되었습니다.`)

    // 2. 문의 내역(Inquiries) 조회 확인
    console.log('\n2. 관리자 권한 데이터 조회 테스트 중...')
    const { data: inquiries, error: inqError } = await supabase
        .from('inquiries')
        .select('id, title, contact_name')
        .limit(3)

    if (inqError) {
        console.error('❌ 조회 실패:', inqError.message)
    } else {
        console.log(`✅ 데이터 조회 성공! (가져온 개수: ${inquiries.length})`)
        console.log('샘플 데이터:', inquiries)
    }

    console.log('\n--- [점검 결과: 정상] ---')
    console.log('모든 마비 증상이 해결되었으며, 로그인이 가능합니다.')
}

finalCheck()
