'use client'

import { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Building2,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/utils/cn';
import { approveProfileUpdate, rejectProfileUpdate } from './actions';

export default function ProfileUpdatesClient({ initialUpdates }: { initialUpdates: any[] }) {
    const [updates, setUpdates] = useState(initialUpdates);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedUpdate, setSelectedUpdate] = useState<any>(null);

    const handleApprove = async (update: any) => {
        if (!confirm('변경 사항을 승인하시겠습니까? 시공사 프로필에 즉시 반영됩니다.')) return;
        setIsProcessing(true);
        try {
            // Filter out null values and unchanged values
            const changedData: any = {};
            const fields = [
                'company_name', 'business_number', 'contact_name', 'contact_phone',
                'contact_email', 'homepage', 'cumulative_capacity',
                'construction_eval_amount', 'warranty_period', 'technician_count',
                'head_office_address', 'branch_office_address'
            ];

            fields.forEach(field => {
                const newValue = update[`new_${field}`];
                if (newValue !== null && newValue !== undefined) {
                    changedData[field] = newValue;
                }
            });

            await approveProfileUpdate(update.id, update.company_id, changedData);
            setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, status: 'approved' } : u));
            setExpandedId(null);
            alert('승인되었습니다.');
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectClick = (update: any) => {
        setSelectedUpdate(update);
        setRejectionReason('');
        setIsRejectModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedUpdate || !rejectionReason.trim()) return;
        setIsProcessing(true);
        try {
            await rejectProfileUpdate(selectedUpdate.id, rejectionReason);
            setUpdates(prev => prev.map(u => u.id === selectedUpdate.id ? { ...u, status: 'rejected', admin_comment: rejectionReason } : u));
            setIsRejectModalOpen(false);
            setExpandedId(null);
            alert('반려 처리되었습니다.');
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const getDiffFields = (update: any) => {
        const fields = [
            { key: 'company_name', label: '업체명' },
            { key: 'business_number', label: '사업자번호' },
            { key: 'contact_name', label: '담당자명' },
            { key: 'contact_phone', label: '담당자 연락처' },
            { key: 'contact_email', label: '담당자 이메일' },
            { key: 'homepage', label: '홈페이지' },
            { key: 'cumulative_capacity', label: '누적 설치 용량' },
            { key: 'construction_eval_amount', label: '시공능력평가액' },
            { key: 'warranty_period', label: '하자보증기간' },
            { key: 'technician_count', label: '기술자 보유수' },
            { key: 'head_office_address', label: '본사 주소' },
            { key: 'branch_office_address', label: '지사 주소' }
        ];

        return fields.filter(f => {
            const newVal = update[`new_${f.key}`];
            return newVal !== null && newVal !== undefined && newVal !== update.company?.[f.key];
        }).map(f => ({
            label: f.label,
            old: update.company?.[f.key] || '미등록',
            new: update[`new_${f.key}`]
        }));
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {updates.length > 0 ? (
                    updates.map((update) => {
                        const diffs = getDiffFields(update);
                        return (
                            <div
                                key={update.id}
                                className={cn(
                                    "bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden transition-all",
                                    expandedId === update.id ? "border-blue-500/30 ring-1 ring-blue-500/10 shadow-2xl" : "hover:border-white/10"
                                )}
                            >
                                <button
                                    onClick={() => setExpandedId(expandedId === update.id ? null : update.id)}
                                    className="w-full p-8 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "p-4 rounded-2xl",
                                            update.status === 'approved' ? "bg-green-500/10 text-green-400" :
                                                update.status === 'rejected' ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                                        )}>
                                            <Building2 size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-xl">{update.company?.company_name}</h3>
                                            <p className="text-sm text-slate-500">
                                                변경 요청일: {format(new Date(update.created_at), 'yyyy-MM-dd HH:mm')}
                                                • <span className="text-blue-400 font-bold">{diffs.length}개 항목 변경</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {update.status === 'pending' ? (
                                            <span className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-blue-500/30 flex items-center gap-2">
                                                <Clock size={14} />
                                                Review Pending
                                            </span>
                                        ) : update.status === 'approved' ? (
                                            <span className="px-4 py-2 bg-green-500/10 text-green-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-green-500/20">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-500/20">
                                                Rejected
                                            </span>
                                        )}
                                        {expandedId === update.id ? <ChevronUp size={24} className="text-slate-600" /> : <ChevronDown size={24} className="text-slate-600" />}
                                    </div>
                                </button>

                                {expandedId === update.id && (
                                    <div className="px-8 pb-10 pt-2 space-y-8 animate-in slide-in-from-top-4 duration-500">
                                        {/* Comparison Grid */}
                                        <div className="grid grid-cols-1 gap-4">
                                            {diffs.map((diff, idx) => (
                                                <div key={idx} className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-white/10 transition-colors">
                                                    <div className="md:w-32">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{diff.label}</span>
                                                    </div>
                                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                                        <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-white/5 text-sm text-slate-500 italic">
                                                            {diff.old}
                                                        </div>
                                                        <ArrowRight className="hidden md:block text-blue-500/50" size={20} />
                                                        <div className="flex-1 bg-blue-600/10 p-3 rounded-xl border border-blue-500/20 text-sm font-bold text-blue-100">
                                                            {diff.new}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {update.status === 'pending' && (
                                            <div className="flex justify-end gap-4 pt-6">
                                                <button
                                                    onClick={() => handleRejectClick(update)}
                                                    disabled={isProcessing}
                                                    className="px-8 py-4 bg-white/5 text-slate-400 rounded-2xl hover:bg-red-500/20 hover:text-red-400 font-bold transition-all border border-white/10"
                                                >
                                                    반려 처리
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(update)}
                                                    disabled={isProcessing}
                                                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 font-bold transition-all shadow-xl shadow-blue-600/20"
                                                >
                                                    {isProcessing ? '처리 중...' : '변경 사항 승인'}
                                                </button>
                                            </div>
                                        )}

                                        {update.status === 'rejected' && (
                                            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
                                                <p className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2">
                                                    <AlertCircle size={16} />
                                                    반려 사유
                                                </p>
                                                <p className="text-slate-300 italic">{update.admin_comment}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="py-32 text-center bg-slate-900/50 rounded-[40px] border border-white/5 opacity-30">
                        <UserCog className="mx-auto mb-4" size={48} />
                        <h4 className="text-lg font-bold">진행 중인 정보 변경 요청이 없습니다.</h4>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl max-w-md w-full p-10 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 text-red-400 mb-6 font-extrabold text-2xl tracking-tighter">
                            <XCircle size={32} />
                            변경 요청 반려
                        </div>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                            시공사에게 전달될 반려 사유를 입력해주세요. <br />
                            잘못된 정보이거나 증빙이 부족한 경우 상세히 기술해주시기 바랍니다.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="예: 첨부하신 사업자등록증과 입력하신 업체명이 일치하지 않습니다."
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
