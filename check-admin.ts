import { createClient } from './src/utils/supabase/server';

async function checkAdmin() {
    try {
        const supabase = await createClient();
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'qnscompany88@gmail.com');

        if (error) {
            console.error('Error fetching user:', error);
            return;
        }

        console.log('User found in public.users:', users);

        const { data: { user }, error: authError } = await supabase.auth.admin.getUserByEmail('qnscompany88@gmail.com');
        if (authError) {
            console.log('Auth check error (likely not service role):', authError.message);
        } else {
            console.log('User found in auth.users:', user?.id, user?.user_metadata);
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

checkAdmin();
