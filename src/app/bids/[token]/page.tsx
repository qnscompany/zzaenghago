import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
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
    Maximize2,
    Trophy
} from "lucide-react";
import ProfitabilityTable from "@/components/leads/ProfitabilityTable";

export default async function BidViewPage({ params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;

        // UUID validation to prevent Supabase error
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(token)) {
            notFound();
        }

        const adminSupabase = createAdminClient();
        const supabase = adminSupabase || await createClient();

        // 1. Fetch bid info
        const { data: bid, error: bidError } = await supabase
            .from('bids')
            .select('*')
            .eq('view_token', token)
            .maybeSingle();

        if (bidError || !bid) {
            console.error("Bid not found or error:", bidError);
            notFound();
        }

        // 2. Fetch company & lead info separately to ensure RLS doesn't block the whole join
        // Using the same client (which might be adminSupabase if available)
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', bid.company_id)
            .single();

        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', bid.lead_id)
            .single();

        if (companyError || leadError || !company || !lead) {
            console.error("Related data load error:", { companyError, leadError });
            // Even if lead is missing, we might want to show company/bid? 
            // But usually all 3 are required for this page.
            notFound();
        }

        const formatWon = (val: number) => {
            return (val || 0).toLocaleString() + '원';
        };

        const formatManWon = (val: number) => {
            return Math.floor((val || 0) / 10000).toLocaleString() + '만원';
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
                            <div className="p-10 md:p-16 bg-white/2 border border-white/10 rounded-[48px] relative overflow-hidden group/header">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[120px] -mr-48 -mt-48 rounded-full group-hover/header:bg-accent/20 transition-colors duration-700"></div>

                                <div className="relative space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="px-5 py-2 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-accent/20">
                                            Premium Proposal
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-bold text-white/60">
                                            <Clock size={12} />
                                            제안일: {new Date(bid.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                                        {company.company_name}의<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">마스터 플랜</span>입니다.
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-6 pt-4 text-white/60">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} className="text-accent" />
                                            <span className="font-medium">{lead.address}</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 bg-white/10 rounded-full hidden md:block"></div>
                                        <div className="flex items-center gap-2">
                                            <Maximize2 size={18} className="text-accent" />
                                            <span className="font-medium">부지 면적: {lead.area_sqm.toLocaleString()}㎡</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Grid */}
                            <div className="grid sm:grid-cols-3 gap-6">
                                <DetailCard
                                    icon={<Zap className="text-accent" />}
                                    label="설치 예정 용량"
                                    value={`${bid.capacity_kw} kW`}
                                    sub={`유형: ${bid.project_type === 'rooftop' ? '지붕형' : bid.project_type === 'ground' ? '지상형' : '영농형'}`}
                                />
                                <DetailCard
                                    icon={<BadgeDollarSign className="text-accent" />}
                                    label="총 공사비 (VAT 포함)"
                                    value={formatManWon(bid.total_amount)}
                                    sub={`kW당 약 ${Math.floor(bid.total_amount / (bid.capacity_kw || 1) / 10000).toLocaleString()}만원`}
                                    highlight
                                />
                                <DetailCard
                                    icon={<Calendar className="text-accent" />}
                                    label="예상 공기 / 유효기간"
                                    value={bid.construction_period || '협의 필요'}
                                    sub={`견적 유효기간: ${bid.valid_thru || '미지정'}`}
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
                                        <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 text-center md:text-left">필독: 견적 제외 항목</h4>
                                        <div className="p-8 bg-red-500/5 rounded-[32px] border border-red-500/10 backdrop-blur-sm">
                                            <p className="text-white/70 leading-relaxed whitespace-pre-wrap text-sm">
                                                {bid.exclusions}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Equipment Specs Section */}
                            <div className="p-10 md:p-12 bg-white/2 border border-white/5 rounded-[48px] space-y-10">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Zap className="text-accent" />
                                        주요 기자재 및 사양
                                    </h3>
                                    <p className="text-white/30 text-sm">본 시공에 사용될 정품 인증 기자재 정보입니다.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <SpecCard
                                        label="태양광 모듈"
                                        value="1급 브랜드 정품 (n형 고효율)"
                                        desc="출력 효율 21.5% 이상, 하프컷 기술 적용"
                                    />
                                    <SpecCard
                                        label="인버터"
                                        value="LS/현대/한화 등 KS 인증 제품"
                                        desc="멀티 MPPT 적용으로 발전 효율 극대화"
                                    />
                                    <SpecCard
                                        label="구조물"
                                        value="용융아연도금 / 포스맥(PosMAC)"
                                        desc="내부식성 강화로 25년 이상 내구성 보장"
                                    />
                                    <SpecCard
                                        label="모니터링"
                                        value="실시간 RTU 원격 관리 시스템"
                                        desc="모바일 앱을 통한 실시간 발전량 확인"
                                    />
                                </div>
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
                                        "본 수익성 분석 수치는 시공사에서 제공한 견적 내용을 바탕으로 실시간 자동 계산된 참고용 시뮬레이션입니다. 실제 발전량 및 수익은 일조량, 한전 단가 변동 및 향후 시장 상황에 따라 차이가 발생할 수 있습니다."
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
    } catch (e) {
        console.error("Critical Page Error:", e);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-10 text-center space-y-6">
                <AlertCircle size={48} className="text-red-500" />
                <h1 className="text-2xl font-bold text-white">견적 정보를 불러오는 중 오류가 발생했습니다.</h1>
                <p className="text-white/40 max-w-md">화면을 새로고침하거나 잠시 후 다시 시도해 주세요. 문제가 지속되면 관리자에게 문의 바랍니다.</p>
                <Link href="/" className="px-8 py-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all">
                    홈으로 이동
                </Link>
            </div>
        );
    }
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

function SpecCard({ label, value, desc }: { label: string, value: string, desc?: string }) {
    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3 hover:border-accent/30 transition-all">
            <div className="text-[10px] font-black text-accent uppercase tracking-wider">{label}</div>
            <div className="text-lg font-bold text-white">{value}</div>
            <div className="text-xs text-white/40 leading-relaxed">{desc}</div>
        </div>
    );
}
