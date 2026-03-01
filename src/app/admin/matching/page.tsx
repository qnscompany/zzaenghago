import { getAdminStatus } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { GitMerge, Clock, CheckCircle2, Building2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/utils/cn';

export default async function AdminMatchingFlowPage() {
    const { isAdmin } = await getAdminStatus();
    if (!isAdmin) {
        redirect('/');
    }

    const supabase = await createClient();

    // Fetch leads with their bids and matched company
    const { data: leads, error } = await supabase
        .from('leads')
        .select(`
            *,
            customer:users!customer_id (email),
            bids (
                *,
                company:companies (company_name)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching leads for flow:', error);
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">견적 매칭 관제</h1>
                    <p className="text-slate-400 mt-2">플랫폼 전체의 견적 요청 및 매칭 진행 상황을 실시간으로 추적합니다.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-bold uppercase tracking-widest">
                    <GitMerge size={16} />
                    Matching Flow
                </div>
            </header>

            <div className="space-y-6">
                {leads && leads.length > 0 ? (
                    leads.map((lead) => (
                        <div key={lead.id} className="bg-slate-900/50 border border-white/5 rounded-[40px] p-10 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
                            <div className="flex flex-col md:flex-row gap-12">
                                {/* Lead Info */}
                                <div className="md:w-1/3 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                                            <User size={12} />
                                            Customer Request
                                        </div>
                                        <h3 className="text-xl font-bold line-clamp-2">{lead.address}</h3>
                                        <p className="text-sm text-slate-500">{lead.customer?.email} • {format(new Date(lead.created_at), 'yyyy-MM-dd')}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                                        <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-full border border-white/5 uppercase">
                                            {lead.project_type}
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-full border border-white/5">
                                            {lead.area_sqm.toLocaleString()}㎡
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-full border border-white/5">
                                            {lead.desired_capacity_kw || '??'}kW
                                        </span>
                                    </div>
                                </div>

                                {/* Flow Visualization */}
                                <div className="md:w-2/3 flex items-center">
                                    <div className="w-full flex justify-between items-center relative">
                                        {/* Connector Line */}
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10" />

                                        {/* Step 1: Request */}
                                        <FlowStep
                                            icon={<Clock className="text-slate-400" size={20} />}
                                            label="요청 등록"
                                            active={true}
                                            date={format(new Date(lead.created_at), 'MM/dd')}
                                        />

                                        {/* Step 2: Bidding */}
                                        <FlowStep
                                            icon={<Building2 className={lead.bids?.length > 0 ? "text-blue-500" : "text-slate-700"} size={20} />}
                                            label={`견적 제출 (${lead.bids?.length || 0})`}
                                            active={lead.bids?.length > 0}
                                        />

                                        {/* Step 3: Matching */}
                                        <FlowStep
                                            icon={<CheckCircle2 className={lead.status === 'contract_pending' || lead.matched_at ? "text-green-500" : "text-slate-700"} size={20} />}
                                            label="매칭 완료"
                                            active={lead.status === 'contract_pending' || !!lead.matched_at}
                                            success={lead.status === 'contract_pending' || !!lead.matched_at}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bids Breakdown if exists */}
                            {lead.bids && lead.bids.length > 0 && (
                                <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {lead.bids.map((bid: any) => (
                                        <div key={bid.id} className={cn(
                                            "p-4 rounded-3xl border transition-all flex flex-col justify-between",
                                            bid.is_selected
                                                ? "bg-green-500/10 border-green-500/30 ring-1 ring-green-500/20"
                                                : "bg-white/2 border-white/5 hover:border-white/10"
                                        )}>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                        {bid.company?.company_name}
                                                    </span>
                                                    {bid.is_selected && (
                                                        <CheckCircle2 size={12} className="text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-white">{(bid.total_amount / 10000).toLocaleString()}만원</p>
                                            </div>
                                            <p className="text-[10px] text-slate-600 mt-2">
                                                {format(new Date(bid.created_at), 'MM/dd HH:mm')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-slate-900/50 rounded-[40px] border border-white/5 opacity-30">
                        <GitMerge className="mx-auto mb-4" size={48} />
                        <h4 className="text-lg font-bold">진행 중인 매칭 정보가 없습니다.</h4>
                    </div>
                )}
            </div>
        </div>
    );
}

function FlowStep({ icon, label, active, success, date }: { icon: React.ReactNode, label: string, active: boolean, success?: boolean, date?: string }) {
    return (
        <div className="flex flex-col items-center gap-2 relative bg-slate-950 p-2 rounded-full">
            <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500",
                success ? "bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]" :
                    active ? "bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-900 border-white/5"
            )}>
                {icon}
            </div>
            <div className="absolute -bottom-8 whitespace-nowrap text-center">
                <p className={cn("text-[10px] font-bold uppercase tracking-widest", active ? "text-white" : "text-slate-600")}>{label}</p>
                {date && <p className="text-[8px] text-slate-500 mt-0.5">{date}</p>}
            </div>
        </div>
    );
}
