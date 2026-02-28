'use client'

import { useActionState, useState } from 'react'
import { submitProfileUpdate, type ActionState } from './actions'
import { Hourglass, CheckCircle2, AlertCircle, Search, FileUp, ShieldCheck, FileText, Upload } from 'lucide-react'
import DaumPostcodeEmbed from 'react-daum-postcode'

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
        head_office_address?: string
        branch_office_address?: string
    }
    isPending: boolean
}

export default function ProfileForm({ initialData, isPending: initialIsPending }: ProfileFormProps) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(submitProfileUpdate, null);
    const [isHeadAddrOpen, setIsHeadAddrOpen] = useState(false);
    const [isBranchAddrOpen, setIsBranchAddrOpen] = useState(false);
    const [headAddr, setHeadAddr] = useState(initialData.head_office_address || '');
    const [branchAddr, setBranchAddr] = useState(initialData.branch_office_address || '');

    const actualIsPending = initialIsPending || isPending;

    const handleCompleteHead = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        setHeadAddr(fullAddress);
        setIsHeadAddrOpen(false);
    };

    const handleCompleteBranch = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        setBranchAddr(fullAddress);
        setIsBranchAddrOpen(false);
    };

    return (
        <form action={formAction} className="space-y-12">
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

                {/* Address Fields */}
                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">본사 주소</label>
                        <div className="flex gap-2">
                            <input
                                name="head_office_address"
                                value={headAddr}
                                onChange={(e) => setHeadAddr(e.target.value)}
                                readOnly={actualIsPending}
                                className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setIsHeadAddrOpen(!isHeadAddrOpen)}
                                disabled={actualIsPending}
                                className="px-5 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-accent hover:border-accent/40 transition-all"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                        {isHeadAddrOpen && (
                            <div className="mt-4 border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                <DaumPostcodeEmbed onComplete={handleCompleteHead} />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">지사 주소 (선택)</label>
                        <div className="flex gap-2">
                            <input
                                name="branch_office_address"
                                value={branchAddr}
                                onChange={(e) => setBranchAddr(e.target.value)}
                                readOnly={actualIsPending}
                                className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setIsBranchAddrOpen(!isBranchAddrOpen)}
                                disabled={actualIsPending}
                                className="px-5 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-accent hover:border-accent/40 transition-all"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                        {isBranchAddrOpen && (
                            <div className="mt-4 border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                <DaumPostcodeEmbed onComplete={handleCompleteBranch} />
                            </div>
                        )}
                    </div>
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

            {/* File Upload Section (Mockup UI) */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-accent rounded-full" />
                    관련 자료 첨부 (증빙자료)
                </h3>
                <div className="p-8 bg-white/2 border border-dashed border-white/10 rounded-[32px] text-center space-y-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent mb-4">
                        <FileUp size={32} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-white font-bold">파일을 이곳에 드래그하거나 클릭하여 업로드</p>
                        <p className="text-white/20 text-xs">PDF, JPG, PNG 형식 지원 (최대 10MB)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {[
                        '사업자등록증 (사본)',
                        '전기공사업등록증 (사본)',
                        '전년도 시공능력평가액 증빙',
                        '하자보증보험증권',
                        '보유기술자수 관련 증빙'
                    ].map((doc, i) => (
                        <div key={i} className="px-5 py-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-3 text-white/60">
                                <FileText size={16} />
                                <span className="text-xs font-medium">{doc}</span>
                            </div>
                            <button type="button" className="text-accent opacity-30 group-hover:opacity-100 transition-opacity">
                                <Upload size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex items-start gap-2 p-4 bg-blue-500/5 rounded-2xl">
                    <ShieldCheck size={16} className="text-blue-400 mt-0.5" />
                    <p className="text-[11px] text-white/40 leading-relaxed">
                        위 자료들은 운영팀의 전문 심사를 위해서만 사용되며, 다른 업체나 외부에는 절대 공개되지 않습니다.
                    </p>
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
