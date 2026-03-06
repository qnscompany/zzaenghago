import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ivoylfnuwnmwkpytmqxa.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3lsZm51d25td2tweXRtcXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI1OTcyNywiZXhwIjoyMDg3ODM1NzI3fQ.6Ojt7xZgRjH1SNZryiIo5_X45TYIMBXlE2pHclDOuRM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function listRpc() {
    console.log('Searching for available RPC functions...')

    // Query information_schema to find functions (if we have access)
    const { data, error } = await supabase
        .from('_rpc_list' as any) // Dummy name to see if we can get a list or use another trick
        .select('*')

    // Real way: try common RPC names
    const testRpcs = ['exec_sql', 'execute_sql', 'sql', 'run_sql']
    for (const name of testRpcs) {
        const { error: rpcErr } = await supabase.rpc(name, { sql: 'SELECT 1' })
        if (rpcErr && rpcErr.message.includes('not found')) {
            console.log(`RPC '${name}' not found.`)
        } else {
            console.log(`RPC '${name}' MIGHT EXIST or returned different error:`, rpcErr?.message)
        }
    }
}

listRpc()
