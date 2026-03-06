const { Client } = require('pg');
const dns = require('dns').promises;

const projectRef = 'ivoylfnuwnmwkpytmqxa';
const password = 'zho23233816!';

const regions = ['ap-northeast-2', 'ap-northeast-1', 'us-east-1', 'eu-west-1'];
const domains = ['supabase.co', 'supabase.com', 'supabase.net'];

async function scan() {
    const hosts = [
        `db.${projectRef}.supabase.co`,
        `db.${projectRef}.supabase.com`,
        `db.${projectRef}.supabase.net`,
        `${projectRef}.supabase.co`,
        `${projectRef}.supabase.com`
    ];

    for (const r of regions) {
        hosts.push(`aws-0-${r}.pooler.supabase.com`);
        hosts.push(`db.${projectRef}.${r}.supabase.co`);
    }

    for (const host of hosts) {
        console.log(`Checking host: ${host}`);
        try {
            // First check if DNS resolves to avoid long timeouts
            const addr = await dns.lookup(host).catch(() => null);
            if (!addr) {
                console.log(`  DNS NOT FOUND: ${host}`);
                continue;
            }
            console.log(`  DNS OK: ${host} -> ${addr.address}`);

            const client = new Client({
                host: host,
                port: 5432,
                user: 'postgres',
                password: password,
                database: 'postgres',
                connectionTimeoutMillis: 5000,
            });

            await client.connect();
            console.log(`  CONNECTED SUCCESS to ${host}!`);

            const sql = `
        CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'); END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
        DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
        DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
      `;
            await client.query(sql);
            console.log('  RECOVERY SQL RUN SUCCESSFULLY!');
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`  FAILED ${host}: ${err.message}`);
        }
    }
}

scan();
