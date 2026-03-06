const { Client } = require('pg');

const projectRef = 'ivoylfnuwnmwkpytmqxa';
const password = 'zho23233816!';

const hosts = [
    `db.${projectRef}.supabase.co`,
    `db.${projectRef}.supabase.com`,
    `${projectRef}.supabase.co`,
    `aws-0-ap-northeast-2.pooler.supabase.com`, // Common for Seoul region
    `db.ivoylfnuwnmwkpytmqxa.supabase.co`
];

async function tryHosts() {
    for (const host of hosts) {
        console.log(`Trying host: ${host}...`);
        const client = new Client({
            host: host,
            port: 5432,
            user: 'postgres',
            password: password,
            database: 'postgres',
            connectionTimeoutMillis: 5000,
        });

        try {
            await client.connect();
            console.log(`SUCCESS connected to ${host}!`);

            const sql = `
        CREATE OR REPLACE FUNCTION public.is_admin()
        RETURNS BOOLEAN AS $$
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
    console.log('All hosts failed.');
}

tryHosts();
