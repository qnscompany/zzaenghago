'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createLead(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    const permitsStatus = {
        electric: formData.get('permit_electric') === 'on',
        development: formData.get('permit_development') === 'on',
        farmland: formData.get('permit_farmland') === 'on',
        other: formData.get('permit_other_text') as string,
    }

    const leadData = {
        customer_id: user.id,
        address: formData.get('address') as string,
        area_sqm: parseFloat(formData.get('area_sqm') as string),
        desired_capacity_kw: formData.get('desired_capacity_kw') ? parseFloat(formData.get('desired_capacity_kw') as string) : null,
        project_type: formData.get('project_type') as any,
        budget_range: formData.get('budget_range') as string,
        desired_start: formData.get('desired_start') || null,
        ownership_type: formData.get('ownership_type') as string,
        applicant_job_type: formData.get('applicant_job_type') as string,
        wants_financial_info: formData.get('wants_financial_info') === 'on',
        permits_status: permitsStatus,
        additional_notes: formData.get('additional_notes') as string,
        status: 'open'
    }

    const { error } = await supabase.from('leads').insert(leadData)

    if (error) {
        console.error('Error creating lead:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/customer')
    revalidatePath('/leads')
    redirect('/leads?success=true')
}
