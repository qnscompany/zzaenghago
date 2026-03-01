'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getInquiries() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('inquiries')
        .select(`
            *,
            user:users (email)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function answerInquiry(id: string, answer: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('inquiries')
        .update({
            answer,
            status: 'answered',
            answered_at: new Date().toISOString(),
            admin_id: user.id
        })
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/inquiries');
}
