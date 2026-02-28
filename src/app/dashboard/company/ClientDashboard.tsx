'use client'

import { useState, useEffect } from 'react'
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk'
import {
    Maximize2,
    Zap,
    Calendar,
    X,
    BadgeDollarSign,
    ClipboardCheck,
    Info,
    MapPin,
    Building2,
    Search
} from 'lucide-react'

export default function ClientDashboard({ leads }: { leads: any[] }) {
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [geocodedLeads, setGeocodedLeads] = useState<any[]>([]);
    const [mapCenter, setMapCenter] = useState({ lat: 36.5, lng: 127.5 }); // Central Korea
    const [isLoaded, setIsLoaded] = useState(false);

    // Kakao Maps API key from env
    const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "";

    const [loading, error] = useKakaoLoader({
        appkey: KAKAO_KEY,
        libraries: ["services", "clusterer", "drawing"],
    });

    useEffect(() => {
        console.log("Kakao Map Loading State:", { loading, error, hasKakao: !!window.kakao });

        if (!loading && !error && typeof window !== 'undefined' && window.kakao) {
            console.log("Kakao SDK loaded successfully. Initializing Geocoder...");
            const geocoder = new window.kakao.maps.services.Geocoder();

            const geocodeLeads = async () => {
                console.log("Starting geocoding for leads count:", leads.length);
                if (leads.length === 0) {
                    console.warn("No leads to geocode - leads array is empty.");
                    return;
                }

                const results = await Promise.all(
                    leads.map(async (lead) => {
                        return new Promise((resolve) => {
                            geocoder.addressSearch(lead.address, (result: any, status: any) => {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    console.log(`✅ Geocoding SUCCESS: ${lead.address} -> ${result[0].y}, ${result[0].x}`);
                                    resolve({
                                        ...lead,
                                        position: {
                                            lat: parseFloat(result[0].y),
                                            lng: parseFloat(result[0].x)
                                        }
                                    });
                                } else {
                                    console.error(`❌ Geocoding FAILED: ${lead.address}. Status:`, status);
                                    // If status is 'ERROR', it might be an API key issue or domain restriction
                                    resolve(null);
                                }
                            });
                        });
                    })
                );

                const validLeads = results.filter(id => id !== null);
                setGeocodedLeads(validLeads);

                // If there are leads, center map on the first one
                if (validLeads.length > 0) {
                    setMapCenter((validLeads[0] as any).position);
                }
            };

            geocodeLeads();
        }
    }, [leads, isLoaded]);

    return (
        <div className="relative w-full h-[calc(100vh-200px)] min-h-[600px] bg-[#0a0a0a] rounded-[40px] overflow-hidden border border-white/10">
            {/* Kakao Map */}
            <Map
                center={mapCenter}
                style={{ width: "100%", height: "100%" }}
                level={leads.length > 0 ? 8 : 10}
                onCreate={() => setIsLoaded(true)}
            >
                {geocodedLeads.map((lead) => (
                    <MapMarker
                        key={lead.id}
                        position={lead.position}
                        onClick={() => setSelectedLead(lead)}
                        image={{
                            src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png", // Temporarily using standard star, will customize below
                            size: { width: 24, height: 35 },
                        }}
                    />
                ))}

                {geocodedLeads.map((lead) => (
                    <CustomOverlayMap
                        key={`overlay-${lead.id}`}
                        position={lead.position}
                        yAnchor={1.4}
                    >
                        <div
                            className={`px-3 py-1.5 rounded-full border shadow-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap
                                ${selectedLead?.id === lead.id
                                    ? 'bg-accent border-white text-white scale-110 z-50'
                                    : 'bg-[#111111]/90 backdrop-blur-md border-accent/40 text-accent hover:scale-105'}`}
                            onClick={() => setSelectedLead(lead)}
                        >
                            <Building2 size={12} />
                            <span className="text-[10px] font-bold">
                                {lead.project_type === 'rooftop' ? '지붕' : lead.project_type === 'ground' ? '노지' : '영농형'}
                                {` ${lead.desired_capacity_kw || ''}kW`}
                            </span>
                        </div>
                    </CustomOverlayMap>
                ))}
            </Map>

            {/* Float HUD: Search Leads */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                <div className="bg-[#111111]/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-[24px] flex items-center gap-3 shadow-2xl">
                    <Search size={18} className="text-accent" />
                    <input
                        placeholder="지역 또는 주소 검색"
                        className="bg-transparent border-none focus:outline-none text-sm text-white w-48 font-medium placeholder:text-white/20"
                    />
                </div>
                <div className="bg-accent text-white px-4 py-3 rounded-[20px] font-bold text-xs shadow-xl shadow-accent/20">
                    전체 {geocodedLeads.length}개 부지
                </div>
            </div>

            {/* Detail Overlay Card */}
            {selectedLead && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md z-20 px-4 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-[#111111]/95 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-accent/20 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            {selectedLead.project_type === 'rooftop' ? '지붕 태양광' : selectedLead.project_type === 'ground' ? '노지 태양광' : '영농형 태양광'}
                                        </div>
                                        <span className="text-[10px] text-white/40 font-bold">{new Date(selectedLead.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white leading-tight">
                                        {selectedLead.address}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <DetailItem icon={<Maximize2 size={16} />} label="면적" value={`${selectedLead.area_sqm.toLocaleString()} ㎡`} />
                                <DetailItem icon={<Zap size={16} />} label="희망 용량" value={`${selectedLead.desired_capacity_kw || '미정'} kW`} />
                                <DetailItem icon={<Calendar size={16} />} label="준공 희망" value={`${selectedLead.desired_completion_year}년 ${selectedLead.desired_completion_half === 'H1' ? '상반기' : '하반기'}`} />
                                <DetailItem icon={<Info size={16} />} label="예산" value={selectedLead.budget_range || '상담 후 결정'} />
                            </div>

                            <button
                                onClick={() => setIsBidModalOpen(true)}
                                className="w-full py-5 bg-accent text-white rounded-[24px] font-extrabold flex items-center justify-center gap-3 hover:bg-orange-500 transition-all shadow-xl shadow-accent/20 group"
                            >
                                <BadgeDollarSign size={20} className="group-hover:scale-110 transition-transform" />
                                <span>이 부지에 견적 보내기</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bidding Modal (Same as before) */}
            {isBidModalOpen && selectedLead && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="p-12 text-center">
                            <div className="p-4 bg-accent/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8 text-accent">
                                <ClipboardCheck size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">견적 시스템 준비 중</h3>
                            <p className="text-white/40 mb-10 leading-relaxed">
                                더욱 정확하고 투명한 견적 비교를 위해<br />
                                정식 견적 시스템을 구축하고 있습니다.
                            </p>
                            <button
                                onClick={() => setIsBidModalOpen(false)}
                                className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bg-white/2 border border-white/5 p-4 rounded-3xl">
            <div className="flex items-center gap-2 mb-1.5 opacity-30">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-sm font-bold text-white">{value}</p>
        </div>
    )
}
