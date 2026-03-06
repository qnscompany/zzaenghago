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

    const { data: { user } } = await supabase.auth.getUser()

    if (user?.user_metadata?.role === 'admin' || user?.email === 'qnscompany88@gmail.com') {
        revalidatePath('/admin', 'layout')
        redirect('/admin')
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

    if (role === 'company') {
        if (!business_number) {
            redirect('/auth/signup?error=' + encodeURIComponent('사업자등록번호를 입력해주세요.'))
        }

        const { data: existingCompany, error: checkError } = await supabase
            .from('companies')
            .select('user_id')
            .eq('business_number', business_number)
            .maybeSingle()

        if (checkError) {
            redirect('/auth/signup?error=' + encodeURIComponent('사업자번호 확인 중 오류가 발생했습니다.'))
        }

        if (!existingCompany) {
            redirect('/auth/signup?error=' + encodeURIComponent('한국에너지공단 등록 업체만 가입 가능합니다.'))
        }

        if (existingCompany.user_id) {
            redirect('/auth/signup?error=' + encodeURIComponent('이미 가입된 사업자등록번호입니다.'))
        }
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
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
