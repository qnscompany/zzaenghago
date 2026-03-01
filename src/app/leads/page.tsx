import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import {
    PlusCircle,
    Search,
    MapPin,
    Maximize2,
    Zap,
    Clock,
    ChevronRight,
    AlertCircle,
    Building2,
    CheckCircle2,
    Calendar
} from "lucide-react";

export default async function LeadsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Role check: Only customers can see their leads
    const userRole = user.user_metadata.role;
    if (userRole !== 'customer' && userRole !== 'admin') {
        redirect('/');
    }

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch bid counts using admin client to ensure accuracy if available
    const adminSupabase = createAdminClient();
    const bidCountingClient = adminSupabase || supabase;
    const { data: allBids } = await bidCountingClient
        .from('bids')
        .select('lead_id');

    // Count bids per lead
    const bidCountsMap: Record<string, number> = {};
    allBids?.forEach(b => {
        bidCountsMap[b.lead_id] = (bidCountsMap[b.lead_id] || 0) + 1;
    });

    const enhancedLeads = leads?.map(lead => ({
        ...lead,
        bid_count: bidCountsMap[lead.id] || 0
    })) || [];

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-accent font-bold mb-2">
                            <span className="w-8 h-[2px] bg-accent"></span>
                            MY PROJECT
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-outfit text-white">내 부지 목록</h1>
                        <p className="mt-4 text-foreground/60 text-lg">등록하신 태양광 부지 정보와 실시간 견적 현황을 확인하세요.</p>
                    </div>
                    <Link href="/leads/new" className="group flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-500 transition-all shadow-2xl shadow-accent/20">
                        <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
                        새 프로젝트 등록
                    </Link>
                </div>

                {/* Leads List */}
                {enhancedLeads && enhancedLeads.length > 0 ? (
                    <div className="grid gap-6">
                        {enhancedLeads.map((lead: any) => (
                            <Link
                                href={`/leads/${lead.id}`}
                                key={lead.id}
                                className="group block p-8 bg-white/2 border border-white/10 rounded-[40px] hover:bg-white/5 transition-all hover:border-accent/40 relative overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-accent/10 transition-colors"></div>

                                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="px-4 py-1.5 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                                                {lead.project_type === 'rooftop' ? '지붕 (건물)' : lead.project_type === 'ground' ? '노지 (땅)' : '영농형 (농지)'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-white/40">
                                                <Clock size={14} />
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={22} className="text-accent mt-1 shrink-0" />
                                                <h3 className="text-2xl md:text-3xl font-bold text-white line-clamp-1 group-hover:text-accent transition-colors">{lead.address}</h3>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                                            <div className="flex items-center gap-2.5">
                                                <Maximize2 size={18} className="text-foreground/40" />
                                                <span className="text-white font-medium">{lead.area_sqm.toLocaleString()} ㎡</span>
                                            </div>
                                            {lead.desired_capacity_kw && (
                                                <div className="flex items-center gap-2.5">
                                                    <Zap size={18} className="text-foreground/40" />
                                                    <span className="text-white font-medium">{lead.desired_capacity_kw} kW</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2.5">
                                                <Calendar size={18} className="text-foreground/40" />
                                                <span className="text-white font-medium">
                                                    {lead.desired_completion_year ? `${lead.desired_completion_year}년 ${lead.desired_completion_half === 'H1' ? '상반기' : '하반기'}` : '준공일 미정'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                                        <div className="flex-1 md:flex-none text-right">
                                            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Status</div>
                                            <div className={`text-lg font-bold ${lead.status === 'open' ? (lead.bid_count > 0 ? 'text-accent' : 'text-green-400') : 'text-accent'}`}>
                                                {lead.status === 'open'
                                                    ? (lead.bid_count > 0 ? `견적 ${lead.bid_count}개 검토 요청` : '견적 대기중')
                                                    : lead.status === 'in_progress' ? '상담 중' : '계약 완료'}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/2 border border-white/5 rounded-[60px] text-center px-6">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
                            <Search size={40} className="text-foreground/20" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">등록하신 부지가 없습니다</h2>
                        <p className="text-foreground/50 max-w-sm mb-12">
                            지금 바로 첫 번째 부지를 등록하고,<br />
                            검증된 시공업체들로부터 최적의 견적을 받아보세요.
                        </p>
                        <Link href="/leads/new" className="flex items-center gap-3 bg-accent text-white px-10 py-5 rounded-[24px] font-bold hover:bg-orange-500 transition-all shadow-2xl shadow-accent/40">
                            <PlusCircle size={24} />
                            프로젝트 시작하기
                        </Link>
                    </div>
                )}

                {/* Info Card */}
                <div className="mt-20 p-8 bg-orange-500/10 border border-orange-500/20 rounded-[40px] flex items-start gap-6">
                    <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-400 shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">꼭 확인해 주세요!</h4>
                        <ul className="text-foreground/60 text-sm space-y-2 list-disc list-inside leading-relaxed">
                            <li>업체는 고객님이 등록하신 정보를 바탕으로 유료로 견적을 발송합니다.</li>
                            <li>실제 사업 의사가 없거나 허위 정보를 등록할 경우 서비스 이용이 제한될 수 있습니다.</li>
                            <li>등록 후 3~7일 내에 시공업체로부터 연락이 오거나 견적이 도착할 예정입니다.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
