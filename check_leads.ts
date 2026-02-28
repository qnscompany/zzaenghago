import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    const { data, error, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('status', 'open');

    if (error) {
        console.error("Error fetching leads:", error);
    } else {
        console.log(`Found ${count} open leads.`);
        if (data && data.length > 0) {
            console.log("Sample lead address:", data[0].address);
        }
    }
}

checkLeads();
