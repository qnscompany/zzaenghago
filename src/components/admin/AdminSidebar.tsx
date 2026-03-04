'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    LayoutDashboard,
    Building2,
    UserCog,
    MessageSquare,
    GitMerge,
    Settings,
    ChevronRight,
    Sun
} from 'lucide-react';
import { cn } from '@/utils/cn';

const menuItems = [
    { name: '대시보드 홈', href: '/admin', icon: LayoutDashboard },
    { name: '시공사 가입 승인', href: '/admin/companies', icon: Building2 },
    { name: '정보 변경 승인', href: '/admin/profile-updates', icon: UserCog },
    { name: '고객 문의 응대', href: '/admin/inquiries', icon: MessageSquare },
    { name: '견적 매칭 관제', href: '/admin/matching', icon: GitMerge },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const supabase = createClient();

    const fetchCounts = useCallback(async () => {
        try {
            const [
                { count: pendingCompanies },
                { count: pendingUpdates },
                { count: pendingInquiries },
                { count: matchingNeeded }
            ] = await Promise.all([
                supabase.from('companies').select('*', { count: 'exact', head: true }).eq('match_status', 'pending'),
                supabase.from('profile_updates').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'open').eq('bid_count', 0)
            ]);

            setCounts({
                '/admin/companies': pendingCompanies || 0,
                '/admin/profile-updates': pendingUpdates || 0,
                '/admin/inquiries': pendingInquiries || 0,
                '/admin/matching': matchingNeeded || 0
            });
        } catch (error) {
            console.error('Error fetching sidebar counts:', error);
        }
    }, [supabase]);

    useEffect(() => {
        fetchCounts();
        // Optional: Real-time subscription could be added here
        const interval = setInterval(fetchCounts, 60000); // 1 minute refresh
        return () => clearInterval(interval);
    }, [fetchCounts]);

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-white/5 h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <Sun size={20} className="fill-white" />
                </div>
                <div>
                    <h2 className="font-bold text-lg font-outfit uppercase tracking-tighter">쨍하고</h2>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const count = counts[item.href] || 0;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
                                <span className="text-sm font-semibold">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {count > 0 && (
                                    <span className={cn(
                                        "w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full",
                                        isActive ? "bg-white text-blue-600" : "bg-red-500 text-white"
                                    )}>
                                        {count > 99 ? '99+' : count}
                                    </span>
                                )}
                                {isActive && <ChevronRight size={14} className="text-white/50" />}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                    <Settings size={18} />
                    서비스 홈으로
                </Link>
            </div>
        </aside>
    );
}
