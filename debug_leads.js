const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    // Check if the current user (admin/company) can see leads
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*');

    if (error) {
        console.error("Error fetching leads:", error);
    } else {
        console.log(`Found ${leads.length} leads in the database.`);
        leads.forEach(l => console.log(`ID: ${l.id}, Address: ${l.address}, Status: ${l.status}`));
    }
}

checkLeads();
