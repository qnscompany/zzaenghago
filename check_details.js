const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ivoylfnuwnmwkpytmqxa.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDetails() {
    const compId = '1e2b594f-f459-4071-974e-7e2dec1f6445';
    const leadId = '8bd9a72b-369c-4c68-9526-20129a8eea21';

    const { data: comp } = await supabase.from('companies').select('*').eq('id', compId).single();
    console.log("Company:", JSON.stringify(comp, null, 2));

    const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
    console.log("Lead:", JSON.stringify(lead, null, 2));
}

checkDetails();
