const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    const { data, error, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' });

    if (error) {
        console.error("Error fetching leads:", error);
    } else {
        console.log(`Total leads in table: ${count}`);
        const openLeads = data.filter(l => l.status === 'open');
        console.log(`Open leads: ${openLeads.length}`);
        if (openLeads.length > 0) {
            openLeads.forEach((l, i) => {
                console.log(`Lead ${i + 1}: ${l.address}`);
            });
        }
    }
}

checkLeads();
