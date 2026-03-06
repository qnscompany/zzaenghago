import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // .env.local에 있을 경우

async function checkData() {
    if (!supabaseUrl || !serviceRoleKey) {
        console.log('URL 또는 SERVICE_ROLE_KEY가 설정되어 있지 않습니다.')
        return
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log('--- [데이터 최종 전수 조사] ---')

    // 1. Inquiries 직접 조회
    const { data: inq, error: inqErr } = await supabase.from('inquiries').select('*')
    if (inqErr) console.error('Inquiries 조회 에러:', inqErr.message)
    else console.log(`Inquiries 총 개수: ${inq.length}개`)

    // 2. 관리자 명단 확인
    const { data: admins, error: adminErr } = await supabase.from('users').select('email, role').eq('role', 'admin')
    if (adminErr) console.error('Users 조회 에러:', adminErr.message)
    else console.log('현재 관리자 명단:', admins.map(a => a.email))
}

checkData()
