'use client'

import { useState, useEffect } from 'react'
import { createLead } from '../actions'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
    MapPin,
    Maximize2,
    Zap,
    Building2,
    Calculator,
    Calendar,
    FileText,
    ShieldCheck,
    UserIcon,
    Briefcase,
    BadgeDollarSign,
    CheckCircle2,
    X
} from 'lucide-react'
import DaumPostcode from 'react-daum-postcode'

export default function NewLeadPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [address, setAddress] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }

            if (user.user_metadata.role !== 'customer') {
                // Technically anyone can be a customer, but let's stick to the prompt's role check if needed.
                // However, most platforms allow anyone to request a quote. 
                // Given the prompt "customer role 로그인 사용자만 접근 가능", we enforce it.
                if (user.user_metadata.role !== 'customer') {
                    router.push('/')
                    return
                }
            }

            setUser(user)
            setLoading(false)
        }
        checkUser()
    }, [router])

    const handleAddressComplete = (data: any) => {
        let fullAddress = data.address
        let extraAddress = ''

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname
            }
            if (data.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''
        }

        setAddress(fullAddress)
        setIsAddressModalOpen(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-accent font-bold">사용자 확인 중...</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen pt-24 pb-20 bg-background px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header & Intro */}
                <div className="mb-12 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold font-outfit text-white">부지 정보 등록</h1>
                    <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4">
                        <p className="text-lg font-medium text-white/90 leading-tight">
                            발전사업, 어디서부터 시작할지 막막하셨죠?
                        </p>
                        <p className="text-foreground/70 text-sm leading-relaxed">
                            부지 정보만 입력하시면, '쨍하고'에 등록된 검증된 시공업체들이 먼저 견적을 보내드립니다.
                            고객님은 받은 견적을 비교하고 마음에 드는 업체를 선택하기만 하면 됩니다.
                            이 모든 과정이 고객님께는 무료입니다.
                        </p>
                        <p className="text-foreground/70 text-sm leading-relaxed">
                            입력 정보가 자세할수록 정확한 견적을 받을 수 있습니다.
                            부지 위치, 면적, 희망 용량, 사업 유형 등을 빠짐없이 작성해 주세요.
                        </p>
                        <p className="text-xs font-semibold text-orange-400 leading-relaxed bg-orange-400/10 p-3 rounded-xl border border-orange-400/20">
                            ※ 실제 발전사업을 준비 중이신 분만 등록해 주세요. 시공업체는 유료로 견적을 발송하는 구조이므로,
                            진지하게 사업을 검토 중이신 분의 정보만 등록되어야 양측 모두 시간과 비용을 아낄 수 있습니다.
                        </p>
                    </div>
                </div>

                <form action={async (formData) => {
                    setSubmitting(true)
                    const result = await createLead(formData)
                    if (result?.error) {
                        alert(result.error)
                    }
                    setSubmitting(false)
                }} className="space-y-8">

                    {/* 1. 기본 정보 */}
                    <Section title="기본 부지 정보" icon={<MapPin size={20} />}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">부지 주소</label>
                                <div className="flex gap-2">
                                    <input
                                        name="address"
                                        value={address}
                                        readOnly
                                        required
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none cursor-not-allowed"
                                        placeholder="주소 검색 버튼을 눌러주세요"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold transition-all"
                                    >
                                        주소 검색
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Maximize2 size={16} className="text-accent" />
                                        부지 면적 (㎡)
                                    </label>
                                    <input
                                        name="area_sqm"
                                        type="number"
                                        required
                                        step="0.1"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all"
                                        placeholder="예: 500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Zap size={16} className="text-accent" />
                                        희망 용량 (kW) <span className="text-xs text-white/40">(선택)</span>
                                    </label>
                                    <input
                                        name="desired_capacity_kw"
                                        type="number"
                                        step="0.1"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all"
                                        placeholder="예: 100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                    <Building2 size={16} className="text-accent" />
                                    사업 유형
                                </label>
                                <select
                                    name="project_type"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="rooftop" className="bg-background">건물 위 (지붕)</option>
                                    <option value="ground" className="bg-background">노지 (땅)</option>
                                    <option value="agri" className="bg-background">영농형 (농지)</option>
                                </select>
                            </div>
                        </div>
                    </Section>

                    {/* 2. 사업자 상태 정보 */}
                    <Section title="사업자 상태" icon={<UserIcon size={20} />}>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">부지 소유주</label>
                                    <select
                                        name="ownership_type"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all appearance-none"
                                    >
                                        <option value="self" className="bg-background">본인 소유</option>
                                        <option value="family" className="bg-background">가족 소유</option>
                                        <option value="lease" className="bg-background">임차 부지</option>
                                        <option value="other" className="bg-background">기타</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">신청자 직업 유형</label>
                                    <select
                                        name="applicant_job_type"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all appearance-none"
                                    >
                                        <option value="employee" className="bg-background">직장인</option>
                                        <option value="business" className="bg-background">개인사업자</option>
                                        <option value="farmer" className="bg-background">농어업인</option>
                                        <option value="unemployed" className="bg-background">무직/기타</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 3. 인허가 및 추가 정보 */}
                    <Section title="인허가 현황 및 추가 정보" icon={<ShieldCheck size={20} />}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-4">인허가 완료 여부 <span className="text-xs text-white/40">(선택/복수선택)</span></label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <CheckboxItem label="전기사업허가" name="permit_electric" />
                                    <CheckboxItem label="개발행위허가" name="permit_development" />
                                    <CheckboxItem label="농지전용허가" name="permit_farmland" />
                                </div>
                                <div className="mt-4">
                                    <input
                                        name="permit_other_text"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all"
                                        placeholder="기타 인허가 사항 입력"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Calculator size={16} className="text-accent" />
                                        예상 예산
                                    </label>
                                    <input
                                        name="budget_range"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all"
                                        placeholder="예: 2억 내외"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Calendar size={16} className="text-accent" />
                                        희망 착공일
                                    </label>
                                    <input
                                        name="desired_start"
                                        type="date"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-2xl border border-accent/20">
                                <BadgeDollarSign className="text-accent" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">태양광 금융상품 안내 희망</p>
                                    <p className="text-xs text-foreground/60">발전소 대출 등 금융 관련 정보를 함께 안내해 드립니다.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="wants_financial_info"
                                    className="w-6 h-6 rounded-md accent-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                    <FileText size={16} className="text-accent" />
                                    추가 요청 사항 <span className="text-xs text-white/40">(선택)</span>
                                </label>
                                <textarea
                                    name="additional_notes"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all resize-none"
                                    placeholder="시공업체에게 전달할 추가 내용을 자유롭게 적어주세요."
                                />
                            </div>
                        </div>
                    </Section>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-accent text-white rounded-2xl font-bold text-xl hover:bg-orange-500 transition-all shadow-2xl shadow-accent/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? '등록 중...' : '견적 요청 등록하기'}
                        {!submitting && <ArrowRight size={24} />}
                    </button>
                </form>
            </div>

            {/* Address Search Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-background border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-lg font-bold">주소 검색</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-4 bg-white">
                            <DaumPostcode
                                onComplete={handleAddressComplete}
                                autoClose={false}
                                style={{ height: '450px' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="p-8 rounded-[40px] bg-white/2 border border-white/5 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="p-2 bg-accent/20 rounded-lg text-accent">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white/90">{title}</h3>
            </div>
            {children}
        </div>
    )
}

function CheckboxItem({ label, name }: { label: string, name: string }) {
    return (
        <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-accent/50 transition-all select-none group">
            <input
                type="checkbox"
                name={name}
                className="w-5 h-5 rounded-md accent-accent peer hidden"
            />
            <div className="w-5 h-5 rounded-md border border-white/20 flex items-center justify-center peer-checked:bg-accent peer-checked:border-accent transition-all">
                <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100" />
            </div>
            <span className="text-sm font-medium text-foreground/80 group-hover:text-white transition-colors">{label}</span>
        </label>
    )
}
