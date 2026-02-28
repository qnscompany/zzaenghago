import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
    MapPin,
    Maximize2,
    Zap,
    Calendar,
    Building2,
    Calculator,
    ShieldCheck,
    UserIcon,
    Briefcase,
    BadgeDollarSign,
    FileText,
    ChevronLeft,
    Clock,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !lead) {
        notFound();
    }

    // Role check: Only the owner or an admin/company can view this (RLS handles this but let's be safe)
    if (lead.customer_id !== user.id && user.user_metadata.role === 'customer') {
        redirect('/leads');
    }

    const permits = lead.permits_status || {};

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background px-4">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <Link href="/leads" className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors mb-8 group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    목록으로 돌아가기
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Lead Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Section */}
                        <div className="p-8 md:p-12 bg-white/2 border border-white/10 rounded-[40px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                            <div className="relative">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <span className="px-4 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                                        {lead.project_type === 'rooftop' ? '지붕 (건물)' : lead.project_type === 'ground' ? '노지 (땅)' : '영농형 (농지)'}
                                    </span>
                                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lead.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-accent/20 text-accent'}`}>
                                        {lead.status === 'open' ? '견적 대기중' : lead.status === 'in_progress' ? '상담 중' : '계약 완료'}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{lead.address}</h1>
                                <div className="flex items-center gap-4 text-foreground/40 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} />
                                        등록일: {new Date(lead.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <InfoCard
                                icon={<Maximize2 className="text-accent" />}
                                label="부지 면적"
                                value={`${lead.area_sqm.toLocaleString()} ㎡`}
                            />
                            <InfoCard
                                icon={<Zap className="text-accent" />}
                                label="희망 용량"
                                value={lead.desired_capacity_kw ? `${lead.desired_capacity_kw} kW` : '미지정'}
                            />
                            <InfoCard
                                icon={<Calendar className="text-accent" />}
                                label="희망 준공 시기"
                                value={lead.desired_completion_year ? `${lead.desired_completion_year}년 ${lead.desired_completion_half === 'H1' ? '상반기' : '하반기'}` : '미지정'}
                            />
                            <InfoCard
                                icon={<Calculator className="text-accent" />}
                                label="예상 예산"
                                value={lead.budget_range || '미지정'}
                            />
                        </div>

                        {/* Additional Sections */}
                        <div className="p-8 bg-white/2 border border-white/5 rounded-[40px] space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <UserIcon size={20} className="text-accent" />
                                    사업자 정보
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-xs text-foreground/40 mb-1">부지 소유주</p>
                                        <p className="font-bold text-white">{lead.ownership_type === 'self' ? '본인' : lead.ownership_type === 'family' ? '가족' : lead.ownership_type === 'lease' ? '임차' : '기타'}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-xs text-foreground/40 mb-1">신청자 직업</p>
                                        <p className="font-bold text-white">{lead.applicant_job_type === 'employee' ? '직장인' : lead.applicant_job_type === 'business' ? '사업자' : lead.applicant_job_type === 'farmer' ? '농업인' : '무직/기타'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-accent" />
                                    인허가 및 특이사항
                                </h3>
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <StatusBadge label="전기사업허가" active={permits.electric} />
                                    <StatusBadge label="개발행위허가" active={permits.development} />
                                    <StatusBadge label="농지전용허가" active={permits.farmland} />
                                </div>
                                {permits.other && (
                                    <div className="p-4 bg-white/5 rounded-2xl mb-6">
                                        <p className="text-xs text-foreground/40 mb-1">기타 허가 사항</p>
                                        <p className="text-white">{permits.other}</p>
                                    </div>
                                )}
                                <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl flex items-center gap-3">
                                    <BadgeDollarSign className="text-accent" />
                                    <p className="text-sm">
                                        태양광 금융상품 안내 <span className="font-bold text-accent">{lead.wants_financial_info ? '희망함' : '희망하지 않음'}</span>
                                    </p>
                                </div>
                            </div>

                            {lead.additional_notes && (
                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-accent" />
                                        추가 요청 사항
                                    </h3>
                                    <div className="p-6 bg-white/5 rounded-2xl text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                        {lead.additional_notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Bids Summary */}
                    <div className="space-y-6">
                        <div className="sticky top-24">
                            <div className="p-8 bg-white/2 border border-white/10 rounded-[40px] space-y-6">
                                <h3 className="text-2xl font-bold text-white">받은 견적</h3>
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Search size={24} className="text-foreground/20" />
                                    </div>
                                    <p className="text-foreground/40 text-sm">
                                        아직 도착한 견적이 없습니다.<br />
                                        시공업체들이 검토 중입니다.
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-orange-400/80 leading-relaxed">
                                            견적은 보통 3~7일 내에 도착합니다. 알림 설정을 확인해 주세요.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="p-6 bg-white/2 border border-white/5 rounded-[32px] hover:border-accent/30 transition-all group">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/5 rounded-xl group-hover:bg-accent/10 transition-colors">
                    {icon}
                </div>
                <span className="text-sm text-foreground/40">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

function StatusBadge({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${active
                ? 'bg-accent/20 border-accent/40 text-white'
                : 'bg-white/2 border-white/5 text-foreground/30'
            }`}>
            {active && <CheckCircle2 size={14} className="text-accent" />}
            {label}
        </div>
    );
}
