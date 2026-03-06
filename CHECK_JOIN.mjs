import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function checkJoin() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.log('URL 또는 ANON_KEY가 설정되어 있지 않습니다.')
        return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('--- [Anon 키 조인 쿼리 테스트] ---')

    const { data, error } = await supabase
        .from('inquiries')
        .select(`
            *,
            user:users!user_id (email)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ 조회 실패!')
        console.error('에러 코드:', error.code)
        console.error('에러 메시지:', error.message)
        console.error('상세 설명:', error.details)
    } else {
        console.log(`✅ 조회 성공! 가져온 개수: ${data.length}개`)
        if (data.length > 0) {
            console.log('첫 번째 데이터 샘플:', {
                id: data[0].id,
                title: data[0].title,
                user_email: data[0].user?.email
            })
        }
    }
}

checkJoin()
