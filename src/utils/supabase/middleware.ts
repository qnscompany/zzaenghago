import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // getUser(). A simple mistake can make it very hard to debug
    // issues with users being logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/' &&
        request.nextUrl.pathname !== '/about' &&
        request.nextUrl.pathname !== '/terms' &&
        request.nextUrl.pathname !== '/privacy'
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // Admin redirection
    if (user && (user.user_metadata.role === 'admin' || user.email === 'qnscompany88@gmail.com')) {
        if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/auth/login') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }
    }

    // Role-based redirection for companies
    if (user && user.user_metadata.role === 'company' && user.email !== 'qnscompany88@gmail.com') {
        const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard/company')
        const isPendingPath = request.nextUrl.pathname === '/company/pending'

        if (isDashboardPath) {
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .select('match_status')
                .eq('user_id', user.id)
                .single()

            if (companyError || !company || company.match_status !== 'approved') {
                const url = request.nextUrl.clone()
                url.pathname = '/company/pending'
                return NextResponse.redirect(url)
            }
        } else if (isPendingPath) {
            const { data: company } = await supabase
                .from('companies')
                .select('match_status')
                .eq('user_id', user.id)
                .single()

            if (company?.match_status === 'approved') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard/company'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
