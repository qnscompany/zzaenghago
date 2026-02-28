'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitProfileUpdate(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'company') {
        return { error: 'Unauthorized' };
    }

    const company_name = formData.get('company_name') as string;
    const business_number = formData.get('business_number') as string;

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
            status: 'pending'
        });

    if (error) {
        console.error('Error submitting profile update:', error);
        return { error: '수정 요청 중 오류가 발생했습니다.' };
    }

    revalidatePath('/dashboard/company/profile');
    return { success: true };
}
