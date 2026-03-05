'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, LogOut, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { signOut } from "@/app/auth/actions";

export default function AdminHeader() {
    const pathname = usePathname();

    const isCompanyDashboard = pathname.startsWith('/dashboard/company');
    const isAdminDashboard = pathname.startsWith('/admin');

    return (
        <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <nav className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/5">
                    <Link
                        href="/dashboard/company"
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            isCompanyDashboard
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Building2 size={16} />
                        시공사 대시보드
                    </Link>
                    <Link
                        href="/admin"
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            isAdminDashboard && !isCompanyDashboard
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <LayoutDashboard size={16} />
                        관리자 대시보드
                    </Link>
                </nav>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                    <div className="bg-blue-500/20 p-1.5 rounded-lg">
                        <User size={14} className="text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1 text-left">Internal Admin</span>
                        <span className="text-xs font-bold text-slate-200 leading-none">Administrator</span>
                    </div>
                </div>

                <form action={signOut}>
                    <button
                        type="submit"
                        className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                        title="로그아웃"
                    >
                        <LogOut size={20} />
                    </button>
                </form>
            </div>
        </header>
    );
}
