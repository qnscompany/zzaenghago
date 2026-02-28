'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type BidActionState = {
    error?: string;
    success?: boolean;
} | null;

export async function submitBid(prevState: BidActionState, formData: FormData): Promise<BidActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || (user.user_metadata.role !== 'company' && user.user_metadata.role !== 'admin')) {
        return { error: 'Unauthorized' };
    }

    const lead_id = formData.get('lead_id') as string;
    const capacity_kw = parseFloat(formData.get('capacity_kw') as string);
    const project_type = formData.get('project_type') as string;
    const total_amount = parseFloat(formData.get('total_amount') as string);
    const construction_period = formData.get('construction_period') as string;
    const valid_thru = formData.get('valid_thru') as string;
    const warranty_years_construction = parseInt(formData.get('warranty_years_construction') as string);
    const warranty_years_module = parseInt(formData.get('warranty_years_module') as string);
    const as_policy = formData.get('as_policy') as string;
    const exclusions = formData.get('exclusions') as string;
    const comment = formData.get('comment') as string;

    // Extract included items from checkboxes
    const included_items: string[] = [];
    const possibleItems = ['module', 'inverter', 'structure', 'electric', 'civil', 'permits', 'monitoring'];
    possibleItems.forEach(item => {
        if (formData.get(`item_${item}`) === 'on') {
            included_items.push(item);
        }
    });

    if (included_items.length < 3) {
        return { error: '포함 항목을 최소 3개 이상 선택해주세요.' };
    }

    // Get company id
    const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!company) return { error: '시공사 정보를 찾을 수 없습니다.' };

    // Check for existing bid
    const { data: existingBid } = await supabase
        .from('bids')
        .select('id')
        .eq('lead_id', lead_id)
        .eq('company_id', company.id)
        .maybeSingle();

    if (existingBid) {
        return { error: '이미 견적을 발송한 고객입니다.' };
    }

    const { error } = await supabase
        .from('bids')
        .insert({
            lead_id,
            company_id: company.id,
            capacity_kw,
            project_type,
            total_amount,
            construction_period,
            valid_thru: valid_thru || null,
            included_items,
            warranty_years_construction,
            warranty_years_module,
            as_policy,
            exclusions,
            comment,
            status: 'sent'
        });

    if (error) {
        console.error('Error submitting bid:', error);
        return { error: '견적 제출 중 오류가 발생했습니다.' };
    }

    revalidatePath('/dashboard/company');
    return { success: true };
}
