'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { signup } from '../actions'
import { useSearchParams } from 'next/navigation'
import { User, Building2, CheckCircle2 } from 'lucide-react'

function SignupContent() {
    const [role, setRole] = useState<'customer' | 'company'>('customer')
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-2xl space-y-8 p-8 bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-outfit tracking-tight">회원가입</h2>
                    <p className="mt-2 text-foreground/60">역할을 선택하고 가입을 진행해 주세요.</p>
                </div>

                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button
                        onClick={() => setRole('customer')}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'customer'
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-white/10 bg-white/2 hover:border-white/20'
                            }`}
                    >
                        <User size={32} />
                        <div className="text-center">
                            <p className="font-bold">사업자</p>
                            <p className="text-xs opacity-60">부지 등록 및 견적 비교</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setRole('company')}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'company'
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-white/10 bg-white/2 hover:border-white/20'
                            }`}
                    >
                        <Building2 size={32} />
                        <div className="text-center">
                            <p className="font-bold">시공업체</p>
                            <p className="text-xs opacity-60">리드 탐색 및 견적 발송</p>
                        </div>
                    </button>
                </div>

                <form className="mt-8 space-y-6" action={signup}>
                    <input type="hidden" name="role" value={role} />

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">이메일</label>
                                <input
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
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                    placeholder="8자 이상 입력"
                                />
                            </div>
                        </div>

                        {role === 'company' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">업체명</label>
                                        <input
                                            name="company_name"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">사업자등록번호</label>
                                        <input
                                            name="business_number"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                            placeholder="000-00-00000"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 bg-accent text-white rounded-xl font-bold hover:bg-solar-blue transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                    >
                        가입하기
                        <CheckCircle2 size={20} />
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-foreground/60">이미 계정이 있으신가요? </span>
                    <Link href="/auth/login" className="text-accent font-bold hover:underline">
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
                <div className="animate-pulse text-accent font-bold font-outfit">로딩 중...</div>
            </div>
        }>
            <SignupContent />
        </Suspense>
    )
}
