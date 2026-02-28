'use client'

import { useState } from 'react'
import {
    MapPin,
    Maximize2,
    Zap,
    Calendar,
    Clock,
    ChevronRight,
    AlertCircle,
    X,
    BadgeDollarSign,
    ClipboardCheck
} from 'lucide-react'

export default function ClientDashboard({ leads }: { leads: any[] }) {
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openBidModal = (lead: any) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    return (
        <>
            {leads.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {leads.map((lead) => (
                        <div
                            key={lead.id}
                            className="group p-8 bg-white/2 border border-white/10 rounded-[40px] hover:bg-white/5 transition-all hover:border-accent/40 relative overflow-hidden"
                        >
                            <div className="relative space-y-6">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="px-4 py-1.5 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                                            {lead.project_type === 'rooftop' ? '지붕 (건물)' : lead.project_type === 'ground' ? '노지 (땅)' : '영농형 (농지)'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-white/40">
                                            <Clock size={14} />
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Address (Masked or Partial if needed, but per prompt "주소" is requested) */}
                                <div className="flex items-start gap-3">
                                    <MapPin size={24} className="text-accent mt-1 shrink-0" />
                                    <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors leading-tight">
                                        {lead.address}
                                    </h3>
                                </div>

                                {/* Specs */}
                                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                                    <div className="flex items-center gap-2.5">
                                        <Maximize2 size={18} className="text-foreground/40" />
                                        <span className="text-white font-medium">{lead.area_sqm.toLocaleString()} ㎡</span>
                                    </div>
                                    {lead.desired_capacity_kw && (
                                        <div className="flex items-center gap-2.5">
                                            <Zap size={18} className="text-foreground/40" />
                                            <span className="text-white font-medium">{lead.desired_capacity_kw} kW</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2.5">
                                        <Calendar size={18} className="text-foreground/40" />
                                        <span className="text-white font-medium">
                                            {lead.desired_completion_year ? `${lead.desired_completion_year}년 ${lead.desired_completion_half === 'H1' ? '상반기' : '하반기'}` : '미정'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="pt-4">
                                    <button
                                        onClick={() => openBidModal(lead)}
                                        className="w-full py-4 bg-white/5 hover:bg-accent text-white rounded-[24px] font-bold transition-all flex items-center justify-center gap-2 group/btn border border-white/5 hover:border-accent"
                                    >
                                        <BadgeDollarSign size={20} className="group-hover/btn:scale-110 transition-transform" />
                                        견적 보내기
                                        <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white/2 border border-white/5 rounded-[60px] text-center px-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
                        <AlertCircle size={40} className="text-foreground/20" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">대기 중인 리드가 없습니다</h2>
                    <p className="text-foreground/50 max-w-sm">
                        현재 등록된 새로운 시공 요청이 없습니다.<br />
                        새로운 리드가 등록되면 실시간으로 알려드립니다.
                    </p>
                </div>
            )}

            {/* Bidding Modal (Placeholder UI) */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
                    <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/20 rounded-xl text-accent">
                                    <ClipboardCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">견적서 작성</h3>
                                    <p className="text-xs text-foreground/40">{selectedLead.address}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent mb-4">
                                <BadgeDollarSign size={40} />
                            </div>
                            <h4 className="text-2xl font-bold text-white">견적 기능 준비 중입니다</h4>
                            <p className="text-foreground/60 leading-relaxed max-w-md mx-auto">
                                시공업체와 고객이 신뢰할 수 있는 정확한 견적 시스템을 구축하고 있습니다.<br />
                                곧 정식 버전에서 만나보실 수 있습니다.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-10 py-4 bg-accent text-white rounded-2xl font-bold hover:bg-orange-500 transition-all shadow-xl shadow-accent/20"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
