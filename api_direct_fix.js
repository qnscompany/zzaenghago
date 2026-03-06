const { Client } = require('pg');

const host = 'ivoylfnuwnmwkpytmqxa.supabase.co';
const password = 'zho23233816!';

async function tryDirect() {
    const ports = [5432, 6543];
    for (const port of ports) {
        console.log(`Trying ${host}:${port}...`);
        const client = new Client({
            host: host,
            port: port,
            user: 'postgres',
            password: password,
            database: 'postgres',
            connectionTimeoutMillis: 20000, // Long timeout
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.log(`CONNECTED SUCCESS to ${host}:${port}!`);
            const sql = `
        CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN (auth.jwt() ->> 'email' = 'qnscompany88@gmail.com'); END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
        DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
        DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
      `;
            await client.query(sql);
            console.log('RECOVERY SQL EXECUTED!');
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`Failed ${port}: ${err.message}`);
        }
    }
    console.log('Direct API domain DB access failed.');
}

tryDirect();
