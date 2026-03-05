const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(10);

    if (error) {
        console.error("Error damping users table:", error.message);
    } else {
        console.log("Users Data Dump:", JSON.stringify(data, null, 2));
    }
}

dumpUsers();
