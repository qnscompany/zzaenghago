'use client'

import { useState } from 'react';
import { addCredits } from './actions';
import { Coins, Plus, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Company {
    id: string;
    company_name: string;
    business_number: string;
    match_status: string;
    created_at: string;
    credits: { balance: number; updated_at: string } | { balance: number; updated_at: string }[] | null;
}

interface CreditsClientProps {
    companies: Company[];
}

export default function CreditsClient({ companies }: CreditsClientProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const getBalance = (credits: Company['credits']) => {
        if (!credits) return 0;
        if (Array.isArray(credits)) return credits[0]?.balance ?? 0;
        return (credits as any).balance ?? 0;
    };

    const getUpdatedAt = (credits: Company['credits']) => {
        if (!credits) return null;
        if (Array.isArray(credits)) return credits[0]?.updated_at ?? null;
        return (credits as any).updated_at ?? null;
    };

    const handleCharge = async (companyId: string, amount: number) => {
        if (!confirm(`크레딧 ${amount}개를 충전하시겠습니까?`)) return;
        setLoading(companyId);
        try {
            await addCredits(companyId, amount);
            alert(`크레딧 ${amount}개가 충전되었습니다.`);
        } catch (e: any) {
            alert('오류: ' + e.message);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5 font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5">시공사</th>
                            <th className="px-8 py-5">가입 상태</th>
                            <th className="px-8 py-5 text-center">잔여 크레딧</th>
                            <th className="px-8 py-5">최근 업데이트</th>
                            <th className="px-8 py-5 text-right">충전</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {companies.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Building2 size={40} className="text-slate-700 mb-2" />
                                        <span className="font-bold">등록된 시공사가 없습니다.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            companies.map((company) => {
                                const balance = getBalance(company.credits);
                                const updatedAt = getUpdatedAt(company.credits);
                                const isLow = balance <= 1;
                                const isZero = balance === 0;
                                const isApproved = company.match_status === 'approved';

                                return (
                                    <tr key={company.id} className={cn(
                                        "hover:bg-white/5 transition-colors group",
                                        isZero && "bg-red-500/5"
                                    )}>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors">{company.company_name}</div>
                                            <div className="text-[10px] text-slate-600 font-mono mt-1">{company.business_number}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {isApproved ? (
                                                <span className="flex items-center gap-1.5 text-green-400 font-bold text-[10px] uppercase tracking-widest">
                                                    <CheckCircle2 size={12} />
                                                    승인 완료
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                                                    {company.match_status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {isZero && <AlertTriangle size={14} className="text-red-400" />}
                                                <span className={cn(
                                                    "text-3xl font-extrabold font-outfit",
                                                    isZero ? "text-red-400" : isLow ? "text-amber-400" : "text-white"
                                                )}>
                                                    {balance}
                                                </span>
                                                <Coins size={14} className={isZero ? "text-red-400" : isLow ? "text-amber-400" : "text-slate-600"} />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400 text-xs font-medium">
                                            {updatedAt
                                                ? format(new Date(updatedAt), 'yyyy.MM.dd HH:mm', { locale: ko })
                                                : '-'}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-2">
                                                {[1, 3, 5].map(amount => (
                                                    <button
                                                        key={amount}
                                                        onClick={() => handleCharge(company.id, amount)}
                                                        disabled={loading === company.id}
                                                        className={cn(
                                                            "flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-[11px] transition-all border",
                                                            amount === 1
                                                                ? "bg-white/5 text-slate-400 border-white/10 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30"
                                                                : amount === 3
                                                                    ? "bg-white/5 text-slate-400 border-white/10 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30"
                                                                    : "bg-amber-600 text-white border-amber-500 hover:bg-amber-500 shadow-lg shadow-amber-500/20",
                                                            "disabled:opacity-50"
                                                        )}
                                                    >
                                                        <Plus size={10} />
                                                        {amount}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
