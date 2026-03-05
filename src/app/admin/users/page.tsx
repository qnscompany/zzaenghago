import { getAdminStatus } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import {
    Users,
    MapPin,
    ClipboardList,
    CheckCircle2,
    Clock,
    Search,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default async function AdminUsersPage() {
    const { isAdmin } = await getAdminStatus();
    if (!isAdmin) {
        redirect('/');
    }

    // Admin client로 RLS 우회
    const adminClient = createAdminClient();
    const supabase = adminClient || await createClient();

    // 발전사업자(customer) 목록 조회
    const { data: customers } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

    // 각 고객의 leads 조회
    const { data: allLeads } = await supabase
        .from('leads')
        .select('id, customer_id, address, status, project_type, created_at, bid_count, matched_at');

    // customer_id 기준으로 leads 그룹핑
    const leadsMap: Record<string, typeof allLeads> = {};
    allLeads?.forEach((lead) => {
        if (!leadsMap[lead.customer_id]) {
            leadsMap[lead.customer_id] = [];
        }
        leadsMap[lead.customer_id]!.push(lead);
    });

    const totalCustomers = customers?.length || 0;
    const activeCustomers = customers?.filter(c => (leadsMap[c.id]?.length || 0) > 0).length || 0;
    const matchedCustomers = customers?.filter(c =>
        leadsMap[c.id]?.some(l => l.status === 'contract_pending' || l.matched_at)
    ).length || 0;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">발전사업자 관리</h1>
                    <p className="text-slate-400 mt-2">견적을 요청한 발전사업자(고객)의 현황을 확인합니다.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 text-sm font-bold uppercase tracking-widest">
                    <Users size={16} />
                    Customer Panel
                </div>
            </header>

            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-6">
                <SummaryCard title="전체 발전사업자" value={totalCustomers} sub="가입 고객 누적" color="blue" />
                <SummaryCard title="견적 요청 발전사업자" value={activeCustomers} sub="1개 이상 leads 등록" color="orange" />
                <SummaryCard title="매칭 완료 고객" value={matchedCustomers} sub="시공사 선정 완료" color="green" />
            </div>

            {/* 고객 목록 */}
            <div className="bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5 font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">이메일</th>
                                <th className="px-8 py-5">가입일</th>
                                <th className="px-8 py-5 text-center">등록 부지 수</th>
                                <th className="px-8 py-5">최근 프로젝트</th>
                                <th className="px-8 py-5 text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {customers && customers.length > 0 ? (
                                customers.map((customer: any) => {
                                    const leads = leadsMap[customer.id] || [];
                                    const latestLead = leads[0];
                                    const hasMatched = leads.some((l: any) => l.status === 'contract_pending');
                                    const hasBids = leads.some((l: any) => (l.bid_count || 0) > 0);

                                    return (
                                        <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">{customer.email}</div>
                                                <div className="text-[10px] text-slate-600 font-mono mt-1">{customer.id.slice(0, 8)}...</div>
                                            </td>
                                            <td className="px-8 py-6 text-slate-400 text-xs font-medium">
                                                {format(new Date(customer.created_at), 'yyyy.MM.dd', { locale: ko })}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`text-2xl font-extrabold ${leads.length > 0 ? 'text-white' : 'text-slate-700'}`}>
                                                    {leads.length}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {latestLead ? (
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                                                            <MapPin size={12} className="text-orange-400" />
                                                            <span className="line-clamp-1">{latestLead.address}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-600 mt-1">
                                                            {latestLead.project_type === 'rooftop' ? '지붕형' : latestLead.project_type === 'ground' ? '노지형' : '영농형'}
                                                            {' · '}
                                                            {format(new Date(latestLead.created_at), 'MM/dd', { locale: ko })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-700 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {hasMatched ? (
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full font-bold text-[10px] border border-green-500/20 uppercase tracking-widest whitespace-nowrap">
                                                        매칭 완료
                                                    </span>
                                                ) : hasBids ? (
                                                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full font-bold text-[10px] border border-orange-500/20 uppercase tracking-widest whitespace-nowrap">
                                                        견적 수신
                                                    </span>
                                                ) : leads.length > 0 ? (
                                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full font-bold text-[10px] border border-blue-500/20 uppercase tracking-widest whitespace-nowrap">
                                                        견적 대기
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-white/5 text-slate-600 rounded-full font-bold text-[10px] border border-white/5 uppercase tracking-widest whitespace-nowrap">
                                                        미활성
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users size={40} className="text-slate-700 mb-2" />
                                            <span className="font-bold">가입한 발전사업자가 없습니다.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 최근 등록된 프로젝트 */}
            {allLeads && allLeads.length > 0 && (
                <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <ClipboardList size={18} className="text-orange-400" />
                        최근 등록 프로젝트 (전체)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allLeads.slice(0, 6).map((lead: any) => (
                            <div key={lead.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${lead.status === 'contract_pending'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {lead.status === 'contract_pending' ? '매칭완료' : '진행중'}
                                    </span>
                                    <span className="text-[10px] text-slate-600">
                                        {format(new Date(lead.created_at), 'MM/dd', { locale: ko })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-white mb-1">
                                    <MapPin size={14} className="text-orange-400 shrink-0" />
                                    <span className="line-clamp-1">{lead.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2">
                                    <span className="flex items-center gap-1">
                                        <ClipboardList size={10} />
                                        견적 {lead.bid_count || 0}개
                                    </span>
                                    <span>{lead.project_type === 'rooftop' ? '지붕형' : lead.project_type === 'ground' ? '노지형' : '영농형'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ title, value, sub, color }: { title: string; value: number; sub: string; color: 'blue' | 'orange' | 'green' }) {
    const colorMap = {
        blue: 'text-blue-500 bg-blue-500/10',
        orange: 'text-orange-400 bg-orange-500/10',
        green: 'text-green-400 bg-green-500/10',
    };
    return (
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[28px] hover:border-blue-500/20 transition-all">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">{title}</p>
            <p className={`text-4xl font-extrabold font-outfit mb-1 ${colorMap[color].split(' ')[0]}`}>{value}</p>
            <p className="text-[10px] text-slate-600">{sub}</p>
        </div>
    );
}
