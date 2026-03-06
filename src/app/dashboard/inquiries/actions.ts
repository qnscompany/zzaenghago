'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMyInquiries() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createInquiry(formData: {
    category: string;
    title: string;
    content: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('inquiries')
        .insert({
            user_id: user.id,
            category: formData.category,
            title: formData.title,
            content: formData.content,
            status: 'pending'
        });

    if (error) throw error;
    revalidatePath('/dashboard/inquiries');
}

export async function getUnreadInquiryCount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count, error } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'answered')
        .eq('is_read', false);

    if (error) return 0;
    return count || 0;
}

export async function markMyInquiriesAsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
        .from('inquiries')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('status', 'answered')
        .eq('is_read', false);

    if (error) console.error('Error marking inquiries as read:', error);
    revalidatePath('/dashboard/inquiries');
}
