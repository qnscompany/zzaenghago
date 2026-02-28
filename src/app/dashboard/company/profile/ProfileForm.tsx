'use client'

import { useActionState } from 'react'
import { submitProfileUpdate, type ActionState } from './actions'
import { Hourglass, CheckCircle2, AlertCircle } from 'lucide-react'

interface ProfileFormProps {
    companyName: string
    businessNumber: string
    isPending: boolean
}

export default function ProfileForm({ companyName, businessNumber, isPending: initialIsPending }: ProfileFormProps) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(submitProfileUpdate, null);

    const actualIsPending = initialIsPending || isPending;

    return (
        <form action={formAction} className="space-y-6">
            {state?.success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400 animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 size={18} />
                    <p className="text-sm font-bold">수정 요청이 전송되었습니다!</p>
                </div>
            )}

            {state?.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-in fade-in zoom-in duration-300">
                    <AlertCircle size={18} />
                    <p className="text-sm font-bold">{state.error}</p>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white/30 uppercase tracking-wider ml-1">업체명</label>
                <input
                    name="company_name"
                    defaultValue={companyName}
                    readOnly={actualIsPending}
                    placeholder="회사명을 입력하세요"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                />
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white/30 uppercase tracking-wider ml-1">사업자 등록 번호</label>
                <input
                    name="business_number"
                    defaultValue={businessNumber}
                    readOnly={actualIsPending}
                    placeholder="000-00-00000"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={actualIsPending}
                    className="w-full py-5 bg-accent text-white rounded-2xl font-bold hover:bg-orange-500 transition-all shadow-lg shadow-accent/20 disabled:bg-white/5 disabled:text-white/20 disabled:shadow-none disabled:cursor-not-allowed group"
                >
                    <span className="group-hover:scale-105 transition-transform inline-block">
                        {isPending ? '처리 중...' : '수정 요청 보내기'}
                    </span>
                </button>
                <p className="text-[11px] text-white/20 text-center mt-6 italic leading-relaxed">
                    ※ 쨍하고 플랫폼 정책에 따라 업체 정보 수정은 운영자의 승인 절차를 거칩니다.<br />
                    승인에는 영업일 기준 최대 24시간이 소요될 수 있습니다.
                </p>
            </div>
        </form>
    )
}
