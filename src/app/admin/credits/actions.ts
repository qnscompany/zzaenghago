'use server'

import { getAdminStatus } from '@/utils/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function addCredits(companyId: string, amount: number) {
    const { isAdmin } = await getAdminStatus();
    if (!isAdmin) {
        throw new Error('권한이 없습니다.');
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
        throw new Error('관리자 클라이언트를 초기화할 수 없습니다.');
    }

    // 현재 잔액 조회
    const { data: current } = await adminClient
        .from('credits')
        .select('balance')
        .eq('company_id', companyId)
        .single();

    const newBalance = (current?.balance || 0) + amount;

    // 잔액 업데이트
    const { error } = await adminClient
        .from('credits')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('company_id', companyId);

    if (error) {
        throw new Error('크레딧 충전에 실패했습니다: ' + error.message);
    }

    // 이력 기록
    await adminClient
        .from('credit_history')
        .insert({
            company_id: companyId,
            change_amount: amount,
            reason: `관리자 수동 충전 (+${amount})`,
        });

    revalidatePath('/admin/credits');
}
