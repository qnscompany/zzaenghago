const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ivoylfnuwnmwkpytmqxa.supabase.co';
const anonKey = 'sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH';

const supabase = createClient(supabaseUrl, anonKey);

async function checkRLS() {
    const token = '2bbc86d5-a35e-4405-9a0c-420e6baca5bc';
    console.log(`Testing RLS for token: ${token}`);

    // 1. Fetch Bid (Should work)
    const { data: bid, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('view_token', token)
        .maybeSingle();

    console.log("Bid access:", bid ? "SUCCESS" : "FAILED", bidError?.message || "");

    if (bid) {
        // 2. Fetch Company (Does RLS allow this?)
        const { data: company, error: compError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', bid.company_id)
            .maybeSingle();
        console.log("Company access:", company ? "SUCCESS" : "FAILED", compError?.message || "");

        // 3. Fetch Lead (Does RLS allow this?)
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', bid.lead_id)
            .maybeSingle();
        console.log("Lead access:", lead ? "SUCCESS" : "FAILED", leadError?.message || "");
    }
}

checkRLS();
