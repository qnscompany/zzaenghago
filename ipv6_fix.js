const { Client } = require('pg');

// Use IPv6 address directly as fallback
const hosts = [
    'db.ivoylfnuwnmwkpytmqxa.supabase.co',
    '2406:da18:243:7417:788a:4fce:1aac:7cc5'
];

async function fix() {
    for (const host of hosts) {
        console.log(`Connecting to host: ${host}...`);
        const isIpV6 = host.includes(':');
        const client = new Client({
            host: host,
            port: 5432,
            user: 'postgres',
            password: 'zho23233816!',
            database: 'postgres',
            connectionTimeoutMillis: 15000,
        });

        try {
            await client.connect();
            console.log(`Connected SUCCESS to ${host}!`);

            const sql = `
        CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ 
        BEGIN 
          RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'); 
        END; 
        $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
        
        DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
        DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
      `;
            await client.query(sql);
            console.log('RECOVERY SQL EXECUTED!');
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`Failed ${host}: ${err.message}`);
        }
    }
}

fix();
