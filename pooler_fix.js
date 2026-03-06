const { Client } = require('pg');

// Trying Supabase Pooler IPs for Seoul (ap-northeast-2)
const pooledHosts = [
    '15.164.120.176',
    '13.124.111.232',
    '15.165.245.138'
];

const projectRef = 'ivoylfnuwnmwkpytmqxa';
const password = 'zho23233816!';

async function fix() {
    for (const host of pooledHosts) {
        console.log(`Trying connection via Pooler IP: ${host}...`);

        // Supabase Pooler needs username in format: postgres.project-ref
        const client = new Client({
            host: host,
            port: 5432, // Try direct port first, then 6543
            user: `postgres.${projectRef}`,
            password: password,
            database: 'postgres',
            connectionTimeoutMillis: 10000,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.log(`Connected SUCCESS to ${host} via Pooler!`);

            const sql = `
        CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ 
        BEGIN 
          RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'); 
        END; 
        $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
        
        DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
        DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
        
        -- Reset some basic policies to ensure they are clean
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
        CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
      `;
            await client.query(sql);
            console.log('RECOVERY SQL EXECUTED VIA POOLED IP!');
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`Failed ${host} (port 5432): ${err.message}`);

            // Try port 6543 if 5432 failed
            console.log(`Trying port 6543 on ${host}...`);
            const client2 = new Client({
                host: host,
                port: 6543,
                user: `postgres.${projectRef}`,
                password: password,
                database: 'postgres',
                connectionTimeoutMillis: 10000,
                ssl: { rejectUnauthorized: false }
            });
            try {
                await client2.connect();
                await client2.query(sql); // Same SQL
                console.log(`SUCCESS on port 6543! RECOVERY COMPLETE.`);
                await client2.end();
                process.exit(0);
            } catch (err2) {
                console.log(`Failed ${host} (port 6543): ${err2.message}`);
            }
        }
    }
    console.log('All IPv4 Pooler attempts failed.');
}

fix();
