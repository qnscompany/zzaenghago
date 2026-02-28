const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ivoylfnuwnmwkpytmqxa.supabase.co";
const supabaseKey = "sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestLead() {
    // We need a user ID. Let's use the one we found.
    const userId = "20dcad7c-c2fa-49a5-b59d-be682d93d705"; // Admin/Company user

    const { data, error } = await supabase
        .from('leads')
        .insert({
            customer_id: userId,
            address: "서울특별시 중구 세종대로 110", // Seoul City Hall
            area_sqm: 100,
            project_type: "rooftop",
            status: "open",
            desired_completion_year: 2024,
            desired_completion_half: "H2"
        })
        .select();

    if (error) {
        console.error("Error creating test lead:", error);
    } else {
        console.log("Test lead created successfully:", data);
    }
}

createTestLead();
