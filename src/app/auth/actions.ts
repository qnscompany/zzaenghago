'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/auth/login?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string // 'customer' or 'company'

    // For company role, additional data
    const company_name = formData.get('company_name') as string
    const business_number = formData.get('business_number') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: role,
            },
        },
    })

    if (error) {
        redirect('/auth/signup?error=' + encodeURIComponent(error.message))
    }

    // If role is company, we need to insert into companies table
    // This is handled by a combination of the user trigger (public.users) 
    // and manual insertion for company-specific fields if needed, 
    // but since we want to be atomic, we'll do it here or via a webhook.
    // For MVP, we'll do it here if sign up was successful.
    if (data.user && role === 'company') {
        const { error: companyError } = await supabase
            .from('companies')
            .insert({
                user_id: data.user.id,
                company_name,
                business_number,
                is_verified: false,
            })

        if (companyError) {
            // In a real app, you'd want to rollback or handle this better
            console.error('Error creating company profile:', companyError)
        }
    }

    revalidatePath('/', 'layout')
    redirect('/auth/login?message=Check your email to confirm your account.')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}
