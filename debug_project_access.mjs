import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ivoylfnuwnmwkpytmqxa.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3lsZm51d25td2tweXRtcXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI1OTcyNywiZXhwIjoyMDg3ODM1NzI3fQ.6Ojt7xZgRjH1SNZryiIo5_X45TYIMBXlE2pHclDOuRM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function debugProject() {
    console.log('--- Project Debugging using Service Role ---')

    // 1. Check if we can reach auth settings or any metadata
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, role')
        .limit(5)

    if (userError) {
        console.error('Data Error:', userError.message)
    } else {
        console.log('Project is reachable. Users found:', userData)
    }

    // 2. Try to see if there are any specific settings we can read via RPC (unlikely but worth a shot)
    console.log('Project ID (from URL): ivoylfnuwnmwkpytmqxa')
}

debugProject()
