'use client'

import { useState, useMemo } from 'react'
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
    ClipboardCheck,
    MousePointer2,
    Info
} from 'lucide-react'

export default function ClientDashboard({ leads }: { leads: any[] }) {
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);

    // Filtered or active leads logic (placeholder for actual map sync)
    const activeLeads = leads;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[600px]">
            {/* Left: Map Section */}
            <div className="lg:w-3/5 bg-white/5 border border-white/10 rounded-[40px] relative overflow-hidden group/map">
                {/* Placeholder for actual Map (Kakao/Google) */}
                <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                    {/* Simulated Pins */}
                    {activeLeads.map((lead, index) => (
                        <div
                            key={lead.id}
                            className={`absolute transition-all duration-300 transform cursor-pointer
                                ${selectedLead?.id === lead.id ? 'scale-125 z-50' : 'z-10 hover:scale-110'}`}
                            style={{
                                left: `${20 + (index * 15) % 60}%`,
                                top: `${30 + (index * 13) % 40}%`
                            }}
                            onClick={() => setSelectedLead(lead)}
                        >
                            <div className={`relative flex flex-col items-center group/pin`}>
                                <div className={`p-2 rounded-full border-2 transition-all
                                    ${selectedLead?.id === lead.id ? 'bg-accent border-white text-white shadow-xl shadow-accent/50' : 'bg-[#111111] border-accent text-accent'}`}>
                                    <MapPin size={24} />
                                </div>
                                <div className="absolute bottom-full mb-2 bg-[#111111] border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity">
                                    {lead.address.split(' ').slice(0, 2).join(' ')}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="text-center z-0">
                        <MapPin size={48} className="text-white/5 mx-auto mb-4" />
                        <p className="text-white/20 font-medium">실시간 부지 위치 맵 (준비 중)</p>
                        <p className="text-white/10 text-xs mt-1 italic">핀을 클릭하면 상세 정보를 확인할 수 있습니다.</p>
                    </div>
                </div>

                {/* Overlays */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                    <div className="bg-[#111111]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 pointer-events-auto">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-white/60">LIVE UPDATED</span>
                    </div>
                </div>
            </div>

            {/* Right: List Section */}
            <div className="lg:w-2/5 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {activeLeads.length > 0 ? (
                        activeLeads.map((lead) => (
                            <div
                                key={lead.id}
                                onMouseEnter={() => setHoveredLeadId(lead.id)}
                                onMouseLeave={() => setHoveredLeadId(null)}
                                onClick={() => setSelectedLead(lead)}
                                className={`p-6 border rounded-[32px] transition-all cursor-pointer group
                                    ${selectedLead?.id === lead.id
                                        ? 'bg-accent/10 border-accent shadow-xl shadow-accent/5'
                                        : 'bg-white/2 border-white/10 hover:border-white/20'}`}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="px-3 py-1 bg-white/5 text-white/60 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            {lead.project_type === 'rooftop' ? '지붕' : lead.project_type === 'ground' ? '노지' : '영농형'}
                                        </div>
                                        <div className="text-[10px] text-white/30 font-medium">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-white group-hover:text-accent transition-colors line-clamp-1">
                                        {lead.address}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-xs text-white/50">
                                            <Maximize2 size={14} className="text-accent/60" />
                                            {lead.area_sqm.toLocaleString()} ㎡
                                        </div>
                                        {lead.desired_capacity_kw && (
                                            <div className="flex items-center gap-2 text-xs text-white/50">
                                                <Zap size={14} className="text-accent/60" />
                                                {lead.desired_capacity_kw} kW
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/2 border border-white/5 border-dashed rounded-[40px]">
                            <AlertCircle size={32} className="text-white/10 mb-4" />
                            <p className="text-white/40 text-sm">대기 중인 리드가 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* Selected Lead Mini-Detail */}
                {selectedLead && (
                    <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-accent/20 rounded-lg text-accent">
                                    <Info size={16} />
                                </div>
                                <h4 className="font-bold text-white">부지 상세 요약</h4>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                                <X size={16} className="text-white/40" />
                            </button>
                        </div>
                        <div className="space-y-3 mb-6">
                            <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{selectedLead.address}</p>
                            <div className="flex items-center gap-4 py-2 border-y border-white/5 text-[11px] font-bold text-accent italic">
                                <span>준공희망: {selectedLead.desired_completion_year}년 {selectedLead.desired_completion_half === 'H1' ? '상반기' : '하반기'}</span>
                                <span className="opacity-20">|</span>
                                <span>예산: {selectedLead.budget_range || '미정'}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsBidModalOpen(true)}
                            className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-lg shadow-accent/20"
                        >
                            <BadgeDollarSign size={20} />
                            견적 발송하기
                        </button>
                    </div>
                )}
            </div>

            {/* Bidding Modal */}
            {isBidModalOpen && selectedLead && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
                    <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-8 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/20 rounded-xl text-accent">
                                    <ClipboardCheck size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">견적 시스템 준비 중</h3>
                            </div>
                            <button onClick={() => setIsBidModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent mb-6">
                                <BadgeDollarSign size={40} />
                            </div>
                            <p className="text-white/60 mb-8">신뢰할 수 있는 견적 발송을 위해 현재 준비 중입니다.</p>
                            <button onClick={() => setIsBidModalOpen(false)} className="px-10 py-4 bg-accent text-white rounded-2xl font-bold">확인</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
