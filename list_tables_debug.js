const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    // Supabase JS doesn't have a direct "list tables" for public keys easily if not allowed by RLS
    // But we can check some common names
    const tables = ['users', 'profiles', 'companies', 'leads', 'inquiries'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table '${table}' error:`, error.message);
        } else {
            console.log(`Table '${table}' exists. Count estimation possible.`);
        }
    }
}

listTables();
