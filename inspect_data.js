const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
    // Check all users
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*');

    if (userError) return console.error(userError);

    // Check all companies
    const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('*');

    if (compError) return console.error(compError);

    console.log("--- USERS ---");
    users.forEach(u => console.log(`${u.email} [${u.role}] (ID: ${u.id})`));

    console.log("\n--- COMPANIES ---");
    companies.forEach(c => console.log(`User ID: ${c.user_id}, Name: ${c.company_name}`));

    const missingCompanies = users.filter(u => u.role === 'company' && !companies.find(c => c.user_id === u.id));
    console.log("\n--- MISSING COMPANIES ---");
    missingCompanies.forEach(u => console.log(`Missing: ${u.email}`));
}

inspectData();
