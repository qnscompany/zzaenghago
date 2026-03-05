const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    const email = "qnscompany88@gmail.com";

    // Check profiles table (some schemas use email, some use id)
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*'); // Get some samples if ilike fails

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
    } else {
        console.log("Profiles Sample:", JSON.stringify(profiles?.slice(0, 5), null, 2));
    }

    // Try finding by email in profiles
    const { data: foundProfiles, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', `%${email}%`);

    console.log("Found in profiles by email:", JSON.stringify(foundProfiles, null, 2));
}

checkProfiles();
