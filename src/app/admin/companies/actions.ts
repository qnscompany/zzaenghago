'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveCompany(companyId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('companies')
        .update({
            match_status: 'approved',
        })
        .eq('id', companyId);

    if (error) {
        throw new Error(error.message);
    }

    // Get the user_id for notification
    const { data: company } = await supabase
        .from('companies')
        .select('user_id')
        .eq('id', companyId)
        .single();

    if (company?.user_id) {
        await supabase.from('notifications').insert({
            user_id: company.user_id,
            title: '가입 승인 완료',
            content: '가입이 승인되었습니다. 지금 바로 서비스를 이용하실 수 있습니다.'
        });
    }

    revalidatePath('/admin/companies');
    revalidatePath('/company/pending');
}

export async function rejectCompany(companyId: string, reason: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('companies')
        .update({
            match_status: 'rejected',
            rejection_reason: reason
        })
        .eq('id', companyId);

    if (error) {
        throw new Error(error.message);
    }

    // Get the user_id for notification
    const { data: company } = await supabase
        .from('companies')
        .select('user_id')
        .eq('id', companyId)
        .single();

    if (company?.user_id) {
        await supabase.from('notifications').insert({
            user_id: company.user_id,
            title: '가입 신청 반려',
            content: `가입이 반려되었습니다. 사유: ${reason}`
        });
    }

    revalidatePath('/admin/companies');
    revalidatePath('/company/pending');
}
