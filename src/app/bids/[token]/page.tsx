import { createAdminClient } from "@/utils/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    Sun,
    Building2,
    Zap,
    BadgeDollarSign,
    ShieldCheck,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    FileText,
    Calculator,
    MapPin,
    Trophy
} from "lucide-react";
import ProfitabilityTable from "@/components/leads/ProfitabilityTable";

export default async function BidViewPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    // UUID validation to prevent Supabase error
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
        notFound();
    }

    const supabase = await createAdminClient();

    // Fetch bid with company and lead info using admin client (bypasses RLS)
    const { data: bid, error } = await supabase
        .from('bids')
        .select(`
            *,
            company:companies(*),
            lead:leads(*)
        `)
        .eq('view_token', token)
        .single();

    if (error || !bid || !bid.company || !bid.lead) {
        console.error("Bid load error:", error);
        notFound();
    }

    const company = bid.company;
    const lead = bid.lead;

    const formatWon = (val: number) => {
        return val.toLocaleString() + '원';
    };

    const formatManWon = (val: number) => {
        return Math.floor(val / 10000).toLocaleString() + '만원';
    };

    const getItemLabel = (id: string) => {
        const items: Record<string, string> = {
            'module': '모듈',
            'inverter': '인버터',
            'structure': '구조물',
            'electric': '전기공사',
            'civil': '토목공사',
            'permits': '계통연계 대행',
            'monitoring': '모니터링 시스템'
        };
        return items[id] || id;
    };

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background px-4">
            <div className="max-w-[1600px] mx-auto">
                {/* Header / Back Link */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/" className="flex items-center gap-2 text-accent font-bold text-xl font-outfit">
                        <Sun className="fill-accent" />
                        <span>쨍하고</span>
                    </Link>
                    <Link href="/leads" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold">
                        <ArrowLeft size={16} />
                        내 부지 목록으로
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left & Middle: Quote Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Title & Status */}
                        <div className="p-10 md:p-16 bg-white/2 border border-white/10 rounded-[48px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[120px] -mr-48 -mt-48 rounded-full"></div>

                            <div className="relative space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-1.5 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                        PROPOSAL
                                    </span>
                                    <span className="px-4 py-1.5 bg-white/5 text-white/60 rounded-full text-[10px] font-bold">
                                        발송일: {new Date(bid.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                    {company.company_name}의<br />
                                    <span className="text-accent underline decoration-8 decoration-accent/20 underline-offset-8">상세 견적서</span>입니다.
                                </h1>
                                <p className="text-white/40 text-lg max-w-xl leading-relaxed">
                                    "{lead.address}" 부지에 최적화된 시공 계획과 수익 분석 결과를 제안합니다.
                                </p>
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div className="grid sm:grid-cols-3 gap-6">
                            <DetailCard
                                icon={<Zap className="text-accent" />}
                                label="설치 예상 용량"
                                value={`${bid.capacity_kw} kW`}
                                sub={`유형: ${bid.project_type === 'rooftop' ? '지붕형' : bid.project_type === 'ground' ? '지상형' : '영농형'}`}
                            />
                            <DetailCard
                                icon={<BadgeDollarSign className="text-accent" />}
                                label="총 공사비 (VAT 포함)"
                                value={formatManWon(bid.total_amount)}
                                sub={`kW당 약 ${Math.floor(bid.total_amount / bid.capacity_kw / 10000).toLocaleString()}만원`}
                                highlight
                            />
                            <DetailCard
                                icon={<Calendar className="text-accent" />}
                                label="공사 기간 / 유효기간"
                                value={bid.construction_period || '협의 필요'}
                                sub={`유효기간: ${bid.valid_thru || '미지정'}`}
                            />
                        </div>

                        {/* Included Items */}
                        <div className="p-10 bg-white/2 border border-white/5 rounded-[40px] space-y-8">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <CheckCircle2 className="text-accent" />
                                견적 포함 내역
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {bid.included_items?.map((item: string) => (
                                    <div key={item} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-white/80 font-bold">
                                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                                        {getItemLabel(item)}
                                    </div>
                                ))}
                            </div>

                            {bid.exclusions && (
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">불포함 항목</h4>
                                    <p className="text-white/60 leading-relaxed bg-red-500/5 p-6 rounded-2xl border border-red-500/10 whitespace-pre-wrap">
                                        {bid.exclusions}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Warranty & AS */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-10 bg-white/2 border border-white/5 rounded-[40px] space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <ShieldCheck className="text-accent" />
                                    품질 보증 조건
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                                        <span className="text-white/40 italic">시공 하자 보증</span>
                                        <span className="text-white font-black">{bid.warranty_years_construction}년</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                                        <span className="text-white/40 italic">모듈 출력 보증</span>
                                        <span className="text-white font-black">{bid.warranty_years_module}년</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 bg-white/2 border border-white/5 rounded-[40px] space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Clock className="text-accent" />
                                    A/S 및 관리 정책
                                </h3>
                                <p className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap">
                                    {bid.as_policy || '상세 상담을 통해 확인 가능합니다.'}
                                </p>
                            </div>
                        </div>

                        {/* 20-Year Profit Table */}
                        <div className="p-10 bg-white/2 border border-white/5 rounded-[48px] space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Calculator className="text-accent" />
                                    20년 수익성 정밀 분석표
                                </h3>
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">SMP 189원 / O&M 10% 기준</span>
                            </div>
                            <ProfitabilityTable
                                capacityKw={bid.capacity_kw}
                                totalAmount={bid.total_amount}
                            />
                            <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-start gap-4">
                                <AlertCircle className="text-orange-500 shrink-0 mt-1" size={18} />
                                <p className="text-xs text-white/40 leading-relaxed">
                                    본 분석 데이터는 시공사에서 제공한 견적 내용을 바탕으로 한 시뮬레이션입니다. 실제 발전 시간과 한전 단가 변동에 따라 차이가 발생할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Company Sidebar */}
                    <div className="space-y-8">
                        <div className="sticky top-24">
                            <div className="p-10 bg-white/2 border border-white/10 rounded-[48px] space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-accent/10 rounded-[32px] mx-auto flex items-center justify-center text-accent">
                                        <Building2 size={40} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-white">{company.company_name}</h4>
                                        <p className="text-white/40 text-sm mt-1">인증 파트너 시공사</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 text-accent font-bold text-xs">
                                        <Trophy size={14} />
                                        <span>우수 시공 업체</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <InfoRow label="대표자/담당자" value={company.contact_name || '확인 필요'} />
                                    <InfoRow label="사업자 번호" value={company.business_number} />
                                    <InfoRow label="본사 소재지" value={company.head_office_address || '정보 미등록'} />
                                    <InfoRow label="시공 능력 평가" value={company.construction_eval_amount || '정보 미등록'} />
                                    <InfoRow label="보유 기술자" value={company.technician_count || '정보 미등록'} />
                                </div>

                                {bid.comment && (
                                    <div className="pt-8 border-t border-white/5">
                                        <h5 className="text-sm font-bold text-white mb-3">업체 한마디</h5>
                                        <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl text-sm italic text-white/80 leading-relaxed">
                                            "{bid.comment}"
                                        </div>
                                    </div>
                                )}

                                <button className="w-full py-6 bg-accent hover:bg-orange-500 text-white font-black rounded-[24px] shadow-2xl shadow-accent/20 transition-all flex items-center justify-center gap-3">
                                    <Zap size={20} />
                                    이 업체와 상담하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailCard({ icon, label, value, sub, highlight }: any) {
    return (
        <div className={`p-8 rounded-[40px] border transition-all ${highlight ? 'bg-accent/5 border-accent/20 ring-1 ring-accent/10' : 'bg-white/2 border-white/5'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white/5 rounded-2xl">{icon}</div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-xs font-bold text-white/40">{sub}</p>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-start gap-4 text-sm">
            <span className="text-white/20 shrink-0">{label}</span>
            <span className="text-white font-bold text-right">{value}</span>
        </div>
    );
}
