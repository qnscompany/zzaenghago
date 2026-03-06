import { createClient } from '@/utils/supabase/server';

export async function getUserRole(userId: string): Promise<'admin' | 'company' | 'customer' | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) return null;
    return data.role;
}

export async function getAdminStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { user: null, role: null, isAdmin: false };

    const role = await getUserRole(user.id);
    return {
        user,
        role,
        isAdmin: role === 'admin' || user.email === 'qnscompany88@gmail.com'
    };
}
