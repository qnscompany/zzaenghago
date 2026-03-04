'use client'

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    Clock,
    Building2,
    UserCog,
    MessageSquare,
    AlertCircle,
    RefreshCcw,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/utils/cn';

type QueueItem = {
    id: string;
    type: 'A' | 'B' | 'C1' | 'C2' | 'C3' | 'D1' | 'D2';
    priority: number;
    label: string;
    icon: string;
    targetName: string;
    createdAt: string;
    status: string;
    actionUrl: string;
    actionLabel: string;
};

export default function AdminWorkQueue() {
    const [items, setItems] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const supabase = createClient();

    const fetchQueue = useCallback(async () => {
        try {
            setLoading(true);
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

            // Fetch data from multiple sources
            const [
                { data: companies },
                { data: updates },
                { data: leads },
                { data: inquiries }
            ] = await Promise.all([
                supabase.from('companies').select('id, company_name, registered_at').eq('match_status', 'pending'),
                supabase.from('profile_updates').select('id, company_id, created_at, companies(company_name)').eq('status', 'pending'),
                supabase.from('leads').select('id, address, bid_count, created_at, status'),
                supabase.from('inquiries').select('id, title, status, created_at, category')
            ]);

            const queue: QueueItem[] = [];

            // [A] 가입승인 대기
            companies?.forEach(c => {
                queue.push({
                    id: c.id,
                    type: 'A',
                    priority: 4,
                    label: '시공사 가입 승인 대기',
                    icon: '🏢',
                    targetName: c.company_name,
                    createdAt: c.registered_at || new Date().toISOString(),
                    status: 'pending',
                    actionUrl: `/admin/companies`,
                    actionLabel: '검토하기'
                });
            });

            // [B] 정보변경 대기
            updates?.forEach(u => {
                queue.push({
                    id: u.id,
                    type: 'B',
                    priority: 5,
                    label: '정보 변경 승인 대기',
                    icon: '✏️',
                    targetName: (u.companies as unknown as { company_name: string })?.company_name || '알 수 없는 업체',
                    createdAt: u.created_at,
                    status: 'pending',
                    actionUrl: `/admin/profile-updates`,
                    actionLabel: '검토하기'
                });
            });

            // [C] 견적요청 이상
            leads?.forEach(l => {
                // C-1: 매칭 필요 (시공사 미배정)
                if (l.status === 'open' && l.bid_count === 0) {
                    queue.push({
                        id: l.id,
                        type: 'C1',
                        priority: 1,
                        label: '견적 매칭 필요 (시공사 미배정)',
                        icon: '🔴',
                        targetName: l.address,
                        createdAt: l.created_at,
                        status: 'urgent',
                        actionUrl: `/admin/matching#${l.id}`,
                        actionLabel: '매칭하기'
                    });
                }
                // C-2: 견적 정체 (7일 무활동)
                else if (new Date(l.created_at) < new Date(sevenDaysAgo) && l.status !== 'contract_pending') {
                    queue.push({
                        id: l.id,
                        type: 'C2',
                        priority: 7,
                        label: '견적 정체 (7일 무활동)',
                        icon: '⏰',
                        targetName: l.address,
                        createdAt: l.created_at,
                        status: 'stale',
                        actionUrl: `/admin/matching#${l.id}`,
                        actionLabel: '확인하기'
                    });
                }
            });

            // [D] 문의 티켓 이상
            inquiries?.forEach(i => {
                if (i.status === 'pending') {
                    queue.push({
                        id: i.id,
                        type: 'D1',
                        priority: 3,
                        label: '신규 문의 (미확인)',
                        icon: '💬',
                        targetName: i.title,
                        createdAt: i.created_at,
                        status: 'new',
                        actionUrl: `/admin/inquiries`,
                        actionLabel: '답변하기'
                    });
                }
            });

            // Sort by priority (ASC), then by createdAt (ASC)
            queue.sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            setItems(queue.slice(0, 20));
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching work queue:', error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [fetchQueue]);

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-xl">
                        <AlertCircle size={20} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold">실시간 작업 큐</h3>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Last update: {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: ko })}
                    </span>
                    <button
                        onClick={() => fetchQueue()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                        disabled={loading}
                    >
                        <RefreshCcw size={16} className={cn("text-slate-400 group-hover:text-white", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <th className="px-6 py-4">유형</th>
                            <th className="px-6 py-4">대상</th>
                            <th className="px-6 py-4">경과 시간</th>
                            <th className="px-6 py-4">상태</th>
                            <th className="px-6 py-4 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading && items.length === 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-6 py-4">
                                        <div className="h-12 bg-white/5 rounded-2xl w-full" />
                                    </td>
                                </tr>
                            ))
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="text-sm font-semibold text-slate-200">{item.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-48 xl:w-64">
                                            <p className="text-sm font-bold text-white truncate">{item.targetName}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest",
                                            item.status === 'urgent' ? "bg-red-500/20 text-red-500 border border-red-500/20" :
                                                item.status === 'new' ? "bg-blue-500/20 text-blue-500 border border-blue-500/20" :
                                                    item.status === 'stale' ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20" :
                                                        "bg-slate-500/20 text-slate-500 border border-slate-500/20"
                                        )}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={item.actionUrl}
                                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                        >
                                            {item.actionLabel}
                                            <ArrowRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <CheckCircle2 size={48} className="text-green-500" />
                                        <p className="text-lg font-bold text-slate-300">✅ 처리할 작업이 없습니다</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {items.length >= 20 && (
                <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">최대 20개 항목만 표시됩니다. 상세 페이지를 확인하세요.</p>
                </div>
            )}
        </div>
    );
}

function CheckCircle2({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
