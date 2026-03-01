'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProfileUpdates() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profile_updates')
        .select(`
            *,
            company:companies (*)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function approveProfileUpdate(id: string, companyId: string, updates: any) {
    const supabase = await createClient();

    // 1. Update the actual company table
    const { error: companyError } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId);

    if (companyError) throw companyError;

    // 2. Mark the update request as approved
    const { error: updateError } = await supabase
        .from('profile_updates')
        .update({
            status: 'approved',
            handled_at: new Date().toISOString()
        })
        .eq('id', id);

    if (updateError) throw updateError;

    revalidatePath('/admin/profile-updates');
    revalidatePath('/admin');
}

export async function rejectProfileUpdate(id: string, reason: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profile_updates')
        .update({
            status: 'rejected',
            admin_comment: reason,
            handled_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/profile-updates');
}
