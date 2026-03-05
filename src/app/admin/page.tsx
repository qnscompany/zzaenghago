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
    UserCog,
    Coins,
    Sun
} from 'lucide-react';

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

    const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

    const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

    const { count: approvedCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('match_status', 'approved');

    // Mock inquiry count until table is fully populated
    // const { count: pendingInquiries } = await supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">대시보드 홈</h1>
                <p className="text-slate-400 mt-2">플랫폼의 주요 현황과 실시간 요청을 확인하세요.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard
                    title="가입 대기 시공사"
                    value={pendingCompanies || 0}
                    icon={<Building2 className="text-blue-500" />}
                    description="검토 필요한 신규 가입"
                />
                <StatCard
                    title="정보 변경 요청"
                    value={pendingUpdates || 0}
                    icon={<UserCog className="text-blue-500" size={24} />} // Using raw icon since imported
                    description="프로필 업데이트 대기"
                />
                <StatCard
                    title="전체 견적 요청"
                    value={totalLeads || 0}
                    icon={<ClipboardList className="text-blue-500" />}
                    description="누적 리드 생성 건수"
                />
                <StatCard
                    title="미답변 문의"
                    value={0}
                    icon={<MessageSquare className="text-blue-500" />}
                    description="빠른 응대가 필요합니다"
                />
                <StatCard
                    title="발전사업자"
                    value={totalCustomers || 0}
                    icon={<Sun className="text-orange-400" />}
                    description="가입 고객 누적"
                />
                <StatCard
                    title="승인 시공사"
                    value={approvedCompanies || 0}
                    icon={<Coins className="text-amber-400" />}
                    description="활성 시공 파트너"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                {/* Recent Activity / Quick Links */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            업무 가이드 및 현황
                        </h3>
                        <div className="space-y-4 text-slate-300">
                            <p className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                💡 <strong>시공사 가입 승인</strong>: 사업자등록번호 매칭 여부를 먼저 확인해 주세요.
                            </p>
                            <p className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                ✅ <strong>정보 변경 승인</strong>: 변경 전/후 데이터를 꼼꼼히 대조하여 승인 처리 바랍니다.
                            </p>
                            <p className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                📩 <strong>문의 응대</strong>: 24시간 이내 답변을 권장합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-6">시스템 상태</h3>
                        <div className="space-y-4">
                            <StatusRow label="DB Connection" status="healthy" />
                            <StatusRow label="Auth Service" status="healthy" />
                            <StatusRow label="Real-time Engine" status="healthy" />
                            <StatusRow label="Storage (S3)" status="healthy" />
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
