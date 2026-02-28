'use client'

import Link from 'next/link'
import { login } from '../actions'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 p-8 bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-outfit tracking-tight">로그인</h2>
                    <p className="mt-2 text-foreground/60">쨍하고에 오신 것을 환영합니다.</p>
                </div>

                <form className="mt-8 space-y-6" action={login}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">이메일</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                placeholder="example@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">비밀번호</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 text-sm bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-center">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 bg-accent text-white rounded-xl font-bold hover:bg-solar-blue transition-all shadow-lg shadow-accent/20"
                    >
                        로그인
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-foreground/60">계정이 없으신가요? </span>
                    <Link href="/auth/signup" className="text-accent font-bold hover:underline">
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    )
}
