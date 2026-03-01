import { createClient } from '@supabase/supabase-js';

// Absolute paths for env vars if needed, but here we expect them from shell
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkToken(token: string) {
    console.log(`Checking bid with view_token: ${token}...`);

    // 1. Check Bid
    const { data: bid, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('view_token', token)
        .maybeSingle();

    if (bidError) {
        console.error("Bid query failed:", bidError);
        return;
    }

    if (!bid) {
        console.error("Bid NOT found in database.");

        // Let's list some bids to see if tokens exist
        const { data: someBids } = await supabase.from('bids').select('id, view_token, company_id, lead_id').limit(5);
        console.log("Existing Bids (first 5):", JSON.stringify(someBids, null, 2));
        return;
    }

    console.log("Bid found:", JSON.stringify(bid, null, 2));

    // 2. Check Company
    const { data: comp, error: compEr } = await supabase.from('companies').select('*').eq('id', bid.company_id).single();
    console.log("Company lookup:", comp ? `Found: ${comp.company_name}` : `Failed: ${compEr?.message}`);

    // 3. Check Lead
    const { data: lead, error: leadEr } = await supabase.from('leads').select('*').eq('id', bid.lead_id).single();
    console.log("Lead lookup:", lead ? `Found: ${lead.address}` : `Failed: ${leadEr?.message}`);
}

const tokenFromUrl = '2bbc86d5-a35e-4405-9a0c-420e6baca5bc';
checkToken(tokenFromUrl);
