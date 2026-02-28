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
    Search,
    AlertCircle,
    Hourglass
} from 'lucide-react'

export default function ClientDashboard({ leads, kakaoKey }: { leads: any[], kakaoKey: string }) {
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [geocodedLeads, setGeocodedLeads] = useState<any[]>([]);
    const [mapCenter, setMapCenter] = useState({ lat: 36.5, lng: 127.5 }); // Central Korea
    const [isLoaded, setIsLoaded] = useState(false);

    // Kakao Maps API key from env
    const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "";

    const [loading, error] = useKakaoLoader({
        appkey: KAKAO_KEY,
        libraries: ["services"], // Minimal set
    });

    useEffect(() => {
        console.log("Kakao Map Debug Info:", {
            hasKey: !!KAKAO_KEY,
            keyHead: KAKAO_KEY?.slice(0, 5),
            loading,
            error: error?.message || error,
            hasKakao: !!(typeof window !== 'undefined' && window.kakao)
        });

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

    if (!KAKAO_KEY) {
        return (
            <div className="w-full h-[600px] bg-[#0a0a0a] rounded-[40px] flex flex-col items-center justify-center border border-white/10 p-12 text-center text-white">
                <AlertCircle className="text-orange-500 mb-4" size={48} />
                <h3 className="text-xl font-bold mb-2">API 키 누락</h3>
                <p className="text-white/40 max-w-sm mb-6">
                    지도를 불러오기 위한 JavaScript API 키가 설정되지 않았습니다. .env.local 또는 Vercel 환경 변수를 확인해주세요.
                </p>
                <code className="bg-white/5 px-4 py-2 rounded text-accent text-xs">
                    NEXT_PUBLIC_KAKAO_MAP_API_KEY
                </code>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[600px] bg-[#0a0a0a] rounded-[40px] flex flex-col items-center justify-center border border-white/10 p-12 text-center">
                <div className="p-4 bg-red-500/10 rounded-full text-red-400 mb-6">
                    <AlertCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">지도 로드 실패</h3>
                <p className="text-white/40 max-w-md leading-relaxed mb-8">
                    카카오맵 스크립트를 불러올 수 없습니다. API 키가 올바른지, 그리고 현재 도메인이 카카오 개발자 콘솔에 등록되어 있는지 확인해주세요.
                </p>
                <div className="bg-white/5 p-6 rounded-2xl text-left text-xs font-mono text-white/60 space-y-2">
                    <p>1. <a href="https://developers.kakao.com" target="_blank" className="text-accent underline">카카오 개발자 콘솔</a> 접속</p>
                    <p>2. 내 애플리케이션 {">"} 앱 설정 {">"} 플랫폼</p>
                    <p>3. 웹 플랫폼에 현재 주소 추가 (예: localhost:3000)</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full h-[calc(100vh-200px)] min-h-[600px] bg-[#0a0a0a] rounded-[40px] overflow-hidden border border-white/10">
            {/* Left Side: Map (2/3) */}
            <div className="relative w-2/3 h-full border-r border-white/5">
                {loading && (
                    <div className="absolute inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
                        <Hourglass className="text-accent animate-spin-slow" size={40} />
                        <p className="text-white/40 font-bold animate-pulse">지도를 불러오는 중...</p>
                    </div>
                )}

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
                                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
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
            </div>

            {/* Right Side: Detail Panel (1/3) */}
            <div className="w-1/3 h-full bg-[#111111]/50 backdrop-blur-md overflow-y-auto">
                {selectedLead ? (
                    <div className="p-8 animate-in fade-in duration-500">
                        <div className="flex justify-between items-start mb-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-accent/20 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        {selectedLead.project_type === 'rooftop' ? '지붕 태양광' : selectedLead.project_type === 'ground' ? '노지 태양광' : '영농형 태양광'}
                                    </div>
                                    <span className="text-[10px] text-white/40 font-bold">{new Date(selectedLead.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-tight">
                                    {selectedLead.address}
                                </h3>
                                <p className="text-white/40 text-xs flex items-center gap-1">
                                    <MapPin size={12} />
                                    위치 상세 정보 확인 가능
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-10">
                            <DetailItem icon={<Maximize2 size={16} />} label="면적" value={`${selectedLead.area_sqm.toLocaleString()} ㎡`} />
                            <DetailItem icon={<Zap size={16} />} label="희망 용량" value={`${selectedLead.desired_capacity_kw || '미정'} kW`} />
                            <DetailItem icon={<Calendar size={16} />} label="준공 희망" value={`${selectedLead.desired_completion_year}년 ${selectedLead.desired_completion_half === 'H1' ? '상반기' : '하반기'}`} />
                            <DetailItem icon={<Info size={16} />} label="예산" value={selectedLead.budget_range || '상담 후 결정'} />
                        </div>

                        <div className="p-6 bg-accent/5 border border-accent/10 rounded-[32px] mb-10">
                            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <ClipboardCheck size={16} className="text-accent" />
                                시공 검토 내용
                            </h4>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {selectedLead.additional_notes || "추가 메모 정보가 없습니다."}
                            </p>
                        </div>

                        <button
                            onClick={() => setIsBidModalOpen(true)}
                            className="w-full py-5 bg-accent text-white rounded-[24px] font-extrabold flex items-center justify-center gap-3 hover:bg-orange-500 transition-all shadow-xl shadow-accent/20 group"
                        >
                            <BadgeDollarSign size={20} className="group-hover:scale-110 transition-transform" />
                            <span>견적 발송하기</span>
                        </button>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">부지를 선택해주세요</h3>
                        <p className="text-sm text-white/60">
                            지도 위의 마커를 클릭하면<br />
                            해당 부지의 상세 정보를 확인할 수 있습니다.
                        </p>
                    </div>
                )}
            </div>

            {/* Bidding Modal */}
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
