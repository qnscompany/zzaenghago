'use client'

import { useState } from 'react';
import { approveCompany, rejectCompany } from './actions';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Building2,
    Search,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/utils/cn';

interface Company {
    id: string;
    company_name: string;
    business_number: string;
    rep_name: string | null;
    head_office_address: string | null;
    phone: string | null;
    match_status: 'pre_registered' | 'pending' | 'approved' | 'rejected';
    registered_at: string | null;
    rejection_reason: string | null;
}

interface CompaniesClientProps {
    initialCompanies: Company[];
}

export default function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const filteredCompanies = initialCompanies.filter(company =>
        company.match_status === activeTab &&
        (company.company_name.includes(searchTerm) ||
            company.business_number.includes(searchTerm))
    );

    const handleApprove = async (id: string) => {
        if (!confirm('해당 업체의 가입을 승인하시겠습니까?')) return;
        setIsProcessing(true);
        try {
            await approveCompany(id);
            alert('승인되었습니다.');
        } catch (error) {
            alert('오류가 발생했습니다: ' + error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectClick = (id: string) => {
        setSelectedCompanyId(id);
        setRejectionReason('');
        setIsRejectModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedCompanyId || !rejectionReason.trim()) return;
        setIsProcessing(true);
        try {
            await rejectCompany(selectedCompanyId, rejectionReason);
            setIsRejectModalOpen(false);
            alert('반려 처리되었습니다.');
        } catch (error) {
            alert('오류가 발생했습니다: ' + error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
                    {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                activeTab === tab
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            {tab === 'pending' && '승인 대기'}
                            {tab === 'approved' && '승인 완료'}
                            {tab === 'rejected' && '반려됨'}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 w-4 h-4 transition-colors" />
                    <input
                        type="text"
                        placeholder="업체명 또는 사업자번호 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 pr-6 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-sm focus:border-blue-500/50 outline-none w-full md:w-80 backdrop-blur-sm transition-all text-white placeholder:text-slate-600"
                    />
                </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5 font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">업체 정보</th>
                                <th className="px-8 py-5">대표자 / 연락처</th>
                                <th className="px-8 py-5">가입일</th>
                                <th className="px-8 py-5 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Building2 size={40} className="text-slate-700 mb-2" />
                                            <span className="font-bold">해당하는 업체가 없습니다.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{company.company_name}</div>
                                            <div className="text-slate-400 text-xs mt-1 font-mono">{company.business_number}</div>
                                            <div className="text-slate-500 text-[10px] mt-1 line-clamp-1">{company.head_office_address}</div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-300">
                                            <div className="font-semibold">{company.rep_name || '-'}</div>
                                            <div className="text-xs text-slate-500 mt-1">{company.phone || '-'}</div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400 text-xs font-medium">
                                            {company.registered_at
                                                ? format(new Date(company.registered_at), 'yyyy.MM.dd HH:mm', { locale: ko })
                                                : '-'}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {activeTab === 'pending' && (
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleApprove(company.id)}
                                                        disabled={isProcessing}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        승인
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(company.id)}
                                                        disabled={isProcessing}
                                                        className="px-4 py-2 bg-white/5 text-slate-400 border border-white/10 rounded-xl hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all font-bold text-xs flex items-center gap-2"
                                                    >
                                                        <XCircle size={14} />
                                                        반려
                                                    </button>
                                                </div>
                                            )}
                                            {activeTab === 'rejected' && (
                                                <div className="flex items-center justify-end gap-2 text-red-500 text-xs font-bold italic">
                                                    <AlertCircle size={12} />
                                                    사유: {company.rejection_reason}
                                                </div>
                                            )}
                                            {activeTab === 'approved' && (
                                                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full font-bold text-[10px] border border-green-500/20 uppercase tracking-widest">
                                                    승인 완료
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl max-w-md w-full p-10 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 text-red-400 mb-6 font-extrabold text-2xl tracking-tighter">
                            <XCircle size={32} />
                            가입 반려 사유
                        </div>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                            업체에게 전달될 가입 반려 사유를 입력해주세요. <br />
                            이 사유는 시공사 대기 화면에 실시간으로 노출됩니다.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="예: 사업자등록번호가 일치하지 않습니다. 고객센터로 문의 바랍니다."
                            className="w-full h-32 p-4 bg-slate-950 border border-white/10 rounded-2xl text-sm focus:border-red-500 outline-none mb-8 text-white transition-all"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="flex-1 py-4 text-slate-500 font-bold hover:text-white transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                disabled={!rejectionReason.trim() || isProcessing}
                                className="flex-1 py-4 bg-red-600 text-white font-extrabold rounded-2xl hover:bg-red-500 transition-all disabled:opacity-50 shadow-xl shadow-red-500/20"
                            >
                                {isProcessing ? '처리 중...' : '반려 처리 완료'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
