'use client'

import { useActionState } from 'react'
import { submitProfileUpdate, type ActionState } from './actions'
import { Hourglass, CheckCircle2, AlertCircle } from 'lucide-react'

interface ProfileFormProps {
    initialData: {
        company_name: string
        business_number: string
        contact_name?: string
        contact_phone?: string
        contact_email?: string
        homepage?: string
        cumulative_capacity?: string
        construction_eval_amount?: string
        warranty_period?: string
        technician_count?: string
    }
    isPending: boolean
}

export default function ProfileForm({ initialData, isPending: initialIsPending }: ProfileFormProps) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(submitProfileUpdate, null);

    const actualIsPending = initialIsPending || isPending;

    return (
        <form action={formAction} className="space-y-10">
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

            {/* Basic Info Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-accent rounded-full" />
                    기본 정보
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="업체명" name="company_name" defaultValue={initialData.company_name} isPending={actualIsPending} />
                    <FormField label="사업자 등록 번호" name="business_number" defaultValue={initialData.business_number} isPending={actualIsPending} placeholder="000-00-00000" />
                </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-accent rounded-full" />
                    담당자 정보
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="이름" name="contact_name" defaultValue={initialData.contact_name} isPending={actualIsPending} />
                    <FormField label="연락처" name="contact_phone" defaultValue={initialData.contact_phone} isPending={actualIsPending} />
                    <FormField label="이메일" name="contact_email" defaultValue={initialData.contact_email} isPending={actualIsPending} />
                    <FormField label="홈페이지" name="homepage" defaultValue={initialData.homepage} isPending={actualIsPending} />
                </div>
            </div>

            {/* Performance Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-accent rounded-full" />
                    시공실적 및 역량
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="누적 설치 용량" name="cumulative_capacity" defaultValue={initialData.cumulative_capacity} isPending={actualIsPending} placeholder="예: 20MW" />
                    <FormField label="시공능력평가액" name="construction_eval_amount" defaultValue={initialData.construction_eval_amount} isPending={actualIsPending} placeholder="예: 50억원" />
                </div>
            </div>

            {/* Technical Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-accent rounded-full" />
                    보증 및 전문인력
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="하자보증기간" name="warranty_period" defaultValue={initialData.warranty_period} isPending={actualIsPending} placeholder="예: 5년" />
                    <FormField label="보유 기술자 수" name="technician_count" defaultValue={initialData.technician_count} isPending={actualIsPending} placeholder="예: 12명" />
                </div>
            </div>

            <div className="pt-6 border-top border-white/5">
                <button
                    type="submit"
                    disabled={actualIsPending}
                    className="w-full py-5 bg-accent text-white rounded-3xl font-bold hover:bg-orange-500 transition-all shadow-xl shadow-accent/20 disabled:bg-white/5 disabled:text-white/20 disabled:shadow-none disabled:cursor-not-allowed group"
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

function FormField({ label, name, defaultValue, isPending, placeholder }: { label: string, name: string, defaultValue?: string, isPending: boolean, placeholder?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">{label}</label>
            <input
                name={name}
                defaultValue={defaultValue}
                readOnly={isPending}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50 text-sm font-medium placeholder:text-white/10"
            />
        </div>
    )
}
