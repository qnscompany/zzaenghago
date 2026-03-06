import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('--- [연결 테스트 시작] ---')
console.log('URL:', supabaseUrl)
console.log('ANON_KEY (앞 10자):', supabaseAnonKey?.substring(0, 10) + '...')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ .env.local 파일에 URL 또는 ANON_KEY가 없습니다.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log('\n데이터베이스 조회를 시도합니다...')
    const { data, error } = await supabase.from('inquiries').select('count').limit(1)

    if (error) {
        console.error('❌ 연결 실패!')
        console.error('에러 코드:', error.code)
        console.error('에러 메시지:', error.message)

        if (error.message.includes('JWT')) {
            console.log('\n💡 힌트: 보안 키(Rotation) 이후 키가 바뀌었지만, .env.local에 예전 키가 남아있는 것 같습니다.')
        }
    } else {
        console.log('✅ 연결 성공! 프로젝트와 키가 서로 일치합니다.')
    }
}

test()
