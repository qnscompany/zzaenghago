const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserRole() {
    const email = "qnscompany88@gmail.com";

    // Check users table
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', `%${email}%`);

    if (userError) {
        console.error("Error fetching user from users table:", userError);
    } else {
        console.log("Users found:", JSON.stringify(users, null, 2));
    }
}

checkUserRole();
