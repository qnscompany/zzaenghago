import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ivoylfnuwnmwkpytmqxa.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3lsZm51d25td2tweXRtcXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI1OTcyNywiZXhwIjoyMDg3ODM1NzI3fQ.6Ojt7xZgRjH1SNZryiIo5_X45TYIMBXlE2pHclDOuRM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testConnection() {
    console.log('Testing connection with Service Role Key...')

    // Service role should bypass RLS, so this should NOT trigger the loop
    const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(1)

    if (error) {
        console.error('Connection failed (even with Service Role):', error)
        if (error.message.includes('timeout')) {
            console.error('SERVER IS TOTALLY HANGING DUE TO RLS LOOP')
        }
    } else {
        console.log('Connection SUCCESS! Service Role bypasses the loop.')
        console.log('User found:', data)
    }
}

testConnection()
