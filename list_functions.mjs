import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ivoylfnuwnmwkpytmqxa.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3lsZm51d25td2tweXRtcXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI1OTcyNywiZXhwIjoyMDg3ODM1NzI3fQ.6Ojt7xZgRjH1SNZryiIo5_X45TYIMBXlE2pHclDOuRM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function listFunctions() {
    console.log('--- Listing available RPC functions ---')

    // Directly query the postgres catalog via PostgREST if permitted (unlikely)
    // Or try to guess common internal functions
    const { data, error } = await supabase.rpc('get_size_by_bucket') // Example existing function

    // Actually, we can't easily list functions via PostgREST without a custom RPC.
    // But we can try to see if there's any table we can modify that triggers something.

    console.log('Testing if we can reach the API...')
    const { data: test, error: err } = await supabase.from('users').select('count')
    if (err) console.error('API Error:', err.message)
    else console.log('API is alive. Connection possible.')
}

listFunctions()
