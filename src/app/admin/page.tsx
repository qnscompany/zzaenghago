import { getAdminStatus } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
    Users,
    Building2,
    ClipboardList,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    UserCog
} from 'lucide-react';
import AdminWorkQueue from '@/components/admin/AdminWorkQueue';

export default async function AdminDashboardPage() {
    const { isAdmin } = await getAdminStatus();
    if (!isAdmin) {
        redirect('/');
    }

    const supabase = await createClient();

    // Fetch quick stats
    const { count: pendingCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('match_status', 'pending');

    const { count: pendingUpdates } = await supabase
        .from('profile_updates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // KPI 카드 수정: 전체 견적 요청 -> 진행중 견적 (matching, collecting)
    const { count: activeLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('status', ['matching', 'collecting']);

    // 미답변 문의 수
    const { count: pendingInquiries } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">대시보드 홈</h1>
                    <p className="text-slate-400 mt-2">플랫폼의 주요 현황과 실시간 요청을 확인하세요.</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="가입 대기 시공사"
                    value={pendingCompanies || 0}
                    icon={<Building2 className="text-blue-500" />}
                    description="검토 필요한 신규 가입"
                />
                <StatCard
                    title="정보 변경 요청"
                    value={pendingUpdates || 0}
                    icon={<UserCog className="text-blue-500" size={24} />}
                    description="프로필 업데이트 대기"
                />
                <StatCard
                    title="진행중 견적"
                    value={activeLeads || 0}
                    icon={<ClipboardList className="text-blue-500" />}
                    description="견적 수집 중인 요청 건수"
                />
                <StatCard
                    title="미답변 문의"
                    value={pendingInquiries || 0}
                    icon={<MessageSquare className="text-blue-500" />}
                    description="빠른 응대가 필요합니다"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                {/* Real-time Work Queue */}
                <div className="lg:col-span-2">
                    <AdminWorkQueue />
                </div>

                {/* System Status */}
                <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-6">시스템 상태</h3>
                        <div className="space-y-4">
                            <StatusRow label="DB Connection" status="healthy" />
                            <StatusRow label="Auth Service" status="healthy" />
                            <StatusRow label="Real-time Engine" status="healthy" />
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">자동 리마인드 엔진</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400">마지막 실행</span>
                                    <span className="text-xs font-bold text-white">3분 전</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400">오늘 발송</span>
                                    <span className="text-xs font-bold text-green-500">12건</span>
                                </div>
                                {/* 실패 건수가 0이면 표시 안 함 (예시로 주석 처리 또는 조건부 렌더링 가능) */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, description }: { title: string, value: number, icon: React.ReactNode, description: string }) {
    return (
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[32px] hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight text-xs">{title}</h3>
            </div>
            <div className="flex items-end justify-between">
                <p className="text-4xl font-extrabold font-outfit text-white">{value}</p>
                <span className="text-[10px] text-slate-500 font-bold mb-1">{description}</span>
            </div>
        </div>
    );
}

function StatusRow({ label, status }: { label: string, status: 'healthy' | 'error' | 'warning' }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-slate-400">{label}</span>
            <div className="flex items-center gap-2">
                {status === 'healthy' && <CheckCircle2 size={14} className="text-green-500" />}
                {status === 'warning' && <Clock size={14} className="text-yellow-500" />}
                {status === 'error' && <XCircle size={14} className="text-red-500" />}
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">{status}</span>
            </div>
        </div>
    );
}
