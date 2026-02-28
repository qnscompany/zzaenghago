'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = {
    error?: string;
    success?: boolean;
} | null;

export async function submitProfileUpdate(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'company') {
        return { error: 'Unauthorized' };
    }

    const company_name = formData.get('company_name') as string;
    const business_number = formData.get('business_number') as string;
    const contact_name = formData.get('contact_name') as string;
    const contact_phone = formData.get('contact_phone') as string;
    const contact_email = formData.get('contact_email') as string;
    const homepage = formData.get('homepage') as string;
    const cumulative_capacity = formData.get('cumulative_capacity') as string;
    const construction_eval_amount = formData.get('construction_eval_amount') as string;
    const warranty_period = formData.get('warranty_period') as string;
    const technician_count = formData.get('technician_count') as string;
    const head_office_address = formData.get('head_office_address') as string;
    const branch_office_address = formData.get('branch_office_address') as string;

    // Get company id
    const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!company) return { error: 'Company not found' };

    const { error } = await supabase
        .from('profile_updates')
        .insert({
            company_id: company.id,
            new_company_name: company_name,
            new_business_number: business_number,
            new_contact_name: contact_name,
            new_contact_phone: contact_phone,
            new_contact_email: contact_email,
            new_homepage: homepage,
            new_cumulative_capacity: cumulative_capacity,
            new_construction_eval_amount: construction_eval_amount,
            new_warranty_period: warranty_period,
            new_technician_count: technician_count,
            new_head_office_address: head_office_address,
            new_branch_office_address: branch_office_address,
            status: 'pending'
        });

    if (error) {
        console.error('Error submitting profile update:', error);
        return { error: '수정 요청 중 오류가 발생했습니다.' };
    }

    revalidatePath('/dashboard/company/profile');
    return { success: true };
}
