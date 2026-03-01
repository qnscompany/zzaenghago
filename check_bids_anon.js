const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ivoylfnuwnmwkpytmqxa.supabase.co';
const anonKey = 'sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH';

const supabase = createClient(supabaseUrl, anonKey);

async function checkBids() {
    console.log("Fetching bids with tokens...");
    const { data, error } = await supabase
        .from('bids')
        .select('id, view_token, lead_id, company_id');

    if (error) {
        console.error("Query Error:", error);
        return;
    }

    console.log("Found Bids Count:", data.length);
    console.log(JSON.stringify(data, null, 2));
}

checkBids();
