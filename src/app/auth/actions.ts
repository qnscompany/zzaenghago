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
                company_name: role === 'company' ? company_name : undefined,
                business_number: role === 'company' ? business_number : undefined,
            },
        },
    })

    if (error) {
        redirect('/auth/signup?error=' + encodeURIComponent(error.message))
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
