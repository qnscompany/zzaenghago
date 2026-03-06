const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3lsZm51d25td2tweXRtcXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI1OTcyNywiZXhwIjoyMDg3ODM1NzI3fQ.6Ojt7xZgRjH1SNZryiIo5_X45TYIMBXlE2pHclDOuRM";

async function deepCheck() {
    console.log("--- Checking with Anon Key ---");
    const anonClient = createClient(supabaseUrl, supabaseKey);
    const { data: d1, error: e1 } = await anonClient.from('inquiries').select('*').limit(1);
    if (e1) console.log("Anon Error:", e1);
    else console.log("Anon Data:", d1);

    console.log("\n--- Checking with Service Role Key ---");
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: d2, error: e2 } = await adminClient.from('inquiries').select('*').limit(1);
    if (e2) console.log("Admin Error:", e2);
    else console.log("Admin Data:", d2);

    console.log("\n--- Checking Column List via RPC if exists (exploratory) ---");
    // This is a long shot
}

deepCheck();
