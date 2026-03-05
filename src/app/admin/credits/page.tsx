import { getAdminStatus } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { Coins, Building2, TrendingUp, Clock, CheckCircle2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import CreditsClient from './CreditsClient';
import { cn } from '@/utils/cn';

export default async function AdminCreditsPage() {
    const { isAdmin } = await getAdminStatus();
    if (!isAdmin) {
        redirect('/');
    }

    const adminClient = createAdminClient();
    const supabase = adminClient || await createClient();

    // 시공사 목록과 크레딧 잔액 조회
    const { data: companies } = await supabase
        .from('companies')
        .select(`
            id,
            company_name,
            business_number,
            match_status,
            created_at,
            credits (
                balance,
                updated_at
            )
        `)
        .order('created_at', { ascending: false });

    // 크레딧 이력 (최근 20건)
    const { data: recentHistory } = await supabase
        .from('credit_history')
        .select(`
            id,
            company_id,
            change_amount,
            reason,
            created_at,
            company:companies (company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

    // 통계
    const totalCompanies = companies?.length || 0;
    const totalCredits = companies?.reduce((sum, c) => {
        const balance = (c.credits as any)?.[0]?.balance ?? (c.credits as any)?.balance ?? 0;
        return sum + balance;
    }, 0) || 0;
    const zeroBalanceCount = companies?.filter(c => {
        const balance = (c.credits as any)?.[0]?.balance ?? (c.credits as any)?.balance ?? 0;
        return balance === 0;
    }).length || 0;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">크레딧 관리</h1>
                    <p className="text-slate-400 mt-2">시공사별 견적 발송 크레딧 잔액을 관제하고 충전합니다.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm font-bold uppercase tracking-widest">
                    <Coins size={16} />
                    Credit Panel
                </div>
            </header>

            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[28px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">전체 시공사</p>
                    <p className="text-4xl font-extrabold font-outfit mb-1 text-blue-500">{totalCompanies}</p>
                    <p className="text-[10px] text-slate-600">크레딧 보유 업체</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[28px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">전체 잔여 크레딧</p>
                    <p className="text-4xl font-extrabold font-outfit mb-1 text-amber-400">{totalCredits}</p>
                    <p className="text-[10px] text-slate-600">시스템 전체 합계</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[28px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">크레딧 소진 업체</p>
                    <p className="text-4xl font-extrabold font-outfit mb-1 text-red-400">{zeroBalanceCount}</p>
                    <p className="text-[10px] text-slate-600">잔액 0 — 충전 필요</p>
                </div>
            </div>

            {/* 업체별 크레딧 현황 */}
            <CreditsClient companies={companies || []} />

            {/* 최근 이력 */}
            {recentHistory && recentHistory.length > 0 && (
                <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-amber-400" />
                        최근 크레딧 이력
                    </h3>
                    <div className="space-y-3">
                        {recentHistory.map((h: any) => (
                            <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {(h.company as any)?.company_name || '알 수 없음'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{h.reason}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "text-lg font-extrabold",
                                        h.change_amount > 0 ? "text-green-400" : "text-red-400"
                                    )}>
                                        {h.change_amount > 0 ? '+' : ''}{h.change_amount}
                                    </span>
                                    <span className="text-[10px] text-slate-600 w-24 text-right">
                                        {format(new Date(h.created_at), 'MM/dd HH:mm', { locale: ko })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
