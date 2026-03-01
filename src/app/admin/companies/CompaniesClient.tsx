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
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'pending' && '승인 대기'}
                            {tab === 'approved' && '승인 완료'}
                            {tab === 'rejected' && '반려됨'}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="업체명 또는 사업자번호 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 font-medium text-gray-600 text-sm">
                            <tr>
                                <th className="px-6 py-4">업체 정보</th>
                                <th className="px-6 py-4">대표자 / 연락처</th>
                                <th className="px-6 py-4">가입일</th>
                                <th className="px-6 py-4 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        해당하는 업체가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{company.company_name}</div>
                                            <div className="text-gray-500 text-xs">{company.business_number}</div>
                                            <div className="text-gray-400 text-xs mt-1">{company.head_office_address}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div>{company.rep_name || '-'}</div>
                                            <div className="text-xs">{company.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {company.registered_at
                                                ? format(new Date(company.registered_at), 'yyyy.MM.dd HH:mm', { locale: ko })
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {activeTab === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(company.id)}
                                                        disabled={isProcessing}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        승인
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(company.id)}
                                                        disabled={isProcessing}
                                                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors font-medium flex items-center gap-1"
                                                    >
                                                        <XCircle size={14} />
                                                        반려
                                                    </button>
                                                </div>
                                            )}
                                            {activeTab === 'rejected' && (
                                                <div className="text-red-600 text-xs italic">
                                                    사유: {company.rejection_reason}
                                                </div>
                                            )}
                                            {activeTab === 'approved' && (
                                                <span className="text-green-600 font-medium text-xs">승인 완료</span>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-2 text-red-600 mb-4 font-bold text-lg">
                            <AlertCircle size={24} />
                            가입 반려 사유 입력
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            업체에게 전달될 가입 반려 사유를 입력해주세요.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="예: 사업자등록번호가 일치하지 않습니다."
                            className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none mb-6"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="flex-1 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                disabled={!rejectionReason.trim() || isProcessing}
                                className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isProcessing ? '처리 중...' : '반려 처리'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
