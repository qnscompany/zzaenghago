'use client'

import { useState, useEffect } from 'react'
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader, Polyline } from 'react-kakao-maps-sdk'
import {
    Check,
    X,
    MapPin,
    Zap,
    Maximize2,
    Calculator,
    ShieldCheck,
    BadgeDollarSign,
    Building2,
    Heart,
    Star,
    ChevronRight,
    Navigation,
    Info,
    CheckCircle2,
    AlertCircle,
    Hourglass
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type BidWithCompany = any; // For brevity

export default function BidSelectionClient({ lead, bids, kakaoKey }: { lead: any, bids: BidWithCompany[], kakaoKey: string }) {
    const router = useRouter();
    const [selectedBid, setSelectedBid] = useState<BidWithCompany | null>(null);
    const [geocodedBids, setGeocodedBids] = useState<any[]>([]);
    const [leadPosition, setLeadPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 36.5, lng: 127.5 });

    const [loading, error] = useKakaoLoader({
        appkey: kakaoKey || "",
        libraries: ["services"],
    });

    const supabase = createClient();

    // Geocode Lead and Companies
    useEffect(() => {
        if (!loading && !error && typeof window !== 'undefined' && window.kakao) {
            const geocoder = new window.kakao.maps.services.Geocoder();

            // Geocode Lead Address
            geocoder.addressSearch(lead.address, (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const pos = { lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) };
                    setLeadPosition(pos);
                    setMapCenter(pos);
                }
            });

            // Geocode Company Addresses
            const geocodeBids = async () => {
                const results = await Promise.all(
                    bids.map(async (bid) => {
                        const addr = bid.company?.head_office_address;
                        if (!addr) return null;

                        return new Promise((resolve) => {
                            geocoder.addressSearch(addr, (result: any, status: any) => {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    resolve({
                                        ...bid,
                                        position: {
                                            lat: parseFloat(result[0].y),
                                            lng: parseFloat(result[0].x)
                                        }
                                    });
                                } else {
                                    resolve(null);
                                }
                            });
                        });
                    })
                );
                setGeocodedBids(results.filter(b => b !== null));
            };

            geocodeBids();
        }
    }, [loading, error, lead.address, bids]);

    const handleSelectBid = async () => {
        if (!selectedBid) return;
        setSubmitting(true);

        try {
            const { error: rpcError } = await supabase.rpc('select_bid', {
                p_lead_id: lead.id,
                p_bid_id: selectedBid.id
            });

            if (rpcError) throw rpcError;

            // Success!
            setIsConfirmModalOpen(false);
            router.push(`/leads/${lead.id}`);
            router.refresh();
        } catch (err: any) {
            console.error("Error selecting bid:", err);
            alert("업체 선정 중 오류가 발생했습니다. (" + err.message + ")");
        } finally {
            setSubmitting(false);
        }
    };

    const formatWon = (val: number) => {
        return Math.floor(val / 10000).toLocaleString() + '만원';
    };

    const calculateDistance = (p1: { lat: number, lng: number }, p2: { lat: number, lng: number }) => {
        const R = 6371; // Earth's radius in km
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLng = (p2.lng - p1.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    return (
        <div className="space-y-8">
            {/* 1. Comparison Page Body */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Comparison Lists */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BadgeDollarSign className="text-accent" />
                            견적 비교 목록
                        </h2>
                        <span className="text-xs text-white/40">최근 도착한 견적 순</span>
                    </div>

                    <div className="space-y-4">
                        {bids.length === 0 ? (
                            <div className="p-12 bg-white/2 border border-white/5 rounded-[40px] text-center space-y-4 opacity-50">
                                <Hourglass size={48} className="mx-auto text-white/20" />
                                <p className="text-white/40">아직 도착한 견적이 없습니다.</p>
                            </div>
                        ) : (
                            bids.map((bid) => (
                                <div
                                    key={bid.id}
                                    onClick={() => setSelectedBid((prev: BidWithCompany | null) => prev?.id === bid.id ? null : bid)}
                                    className={`p-6 bg-[#111] border rounded-[32px] cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden
                                        ${selectedBid?.id === bid.id ? 'border-accent ring-1 ring-accent/50 shadow-2xl shadow-accent/20' : 'border-white/10 hover:border-white/20'}`}
                                >
                                    <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border transition-all flex items-center justify-center
                                            ${selectedBid?.id === bid.id
                                            ? 'bg-accent border-accent text-white shadow-lg shadow-accent/40 scale-110'
                                            : 'bg-white/5 border-white/10 text-white/10'}`}>
                                        <Check size={14} strokeWidth={4} />
                                    </div>

                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent/10 transition-colors">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg text-white group-hover:text-accent transition-colors">{bid.company?.company_name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                                <Star size={10} className="fill-accent text-accent" />
                                                <span>인증 시공사</span>
                                                <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                                <span>{bid.company?.head_office_address?.split(' ')[0]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/2 rounded-2xl border border-white/5 group-hover:bg-white/5 transition-colors">
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">총 공사비</p>
                                            <p className="text-xl font-black text-white">{formatWon(bid.total_amount)}</p>
                                        </div>
                                        <div className="p-4 bg-white/2 rounded-2xl border border-white/5 group-hover:bg-white/5 transition-colors">
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">하자 보증</p>
                                            <p className="text-xl font-black text-white">{bid.warranty_years_construction}년</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {bid.included_items?.slice(0, 3).map((item: string) => (
                                            <span key={item} className="px-2 py-1 bg-white/5 text-white/40 rounded-lg text-[10px] font-bold">
                                                #{item === 'module' ? '고효율모듈' : item === 'inverter' ? 'KS인버터' : item === 'monitoring' ? '모니터링' : item}
                                            </span>
                                        ))}
                                        {bid.included_items?.length > 3 && (
                                            <span className="px-2 py-1 bg-white/5 text-white/40 rounded-lg text-[10px] font-bold">
                                                +{bid.included_items.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Map Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Navigation className="text-accent" size={20} />
                            지도로 거리 체감하기
                        </h2>
                    </div>

                    <div className="w-full h-[500px] bg-white/2 border border-white/10 rounded-[40px] overflow-hidden relative shadow-2xl">
                        {loading && (
                            <div className="absolute inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
                                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-white/40 font-bold">지도를 불러오는 중...</p>
                            </div>
                        )}

                        <Map
                            center={mapCenter}
                            style={{ width: "100%", height: "100%" }}
                            level={11}
                        >
                            {/* Lead Position Marker */}
                            {leadPosition && (
                                <MapMarker
                                    position={leadPosition}
                                    image={{
                                        src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                                        size: { width: 24, height: 35 },
                                    }}
                                />
                            )}

                            {/* Company Markers */}
                            {geocodedBids.map((bid) => (
                                <MapMarker
                                    key={bid.id}
                                    position={bid.position}
                                    onClick={() => setSelectedBid((prev: BidWithCompany | null) => prev?.id === bid.id ? null : bid)}
                                />
                            ))}

                            {/* Overlays */}
                            {geocodedBids.map((bid) => (
                                <CustomOverlayMap
                                    key={`overlay-${bid.id}`}
                                    position={bid.position}
                                    yAnchor={1.4}
                                >
                                    <div
                                        onClick={() => setSelectedBid((prev: BidWithCompany | null) => prev?.id === bid.id ? null : bid)}
                                        className={`px-4 py-2 rounded-full border shadow-xl transition-all cursor-pointer whitespace-nowrap font-bold text-xs
                                            ${selectedBid?.id === bid.id
                                                ? 'bg-accent border-white text-white scale-110 z-50'
                                                : 'bg-[#111111]/90 backdrop-blur-md border-white/10 text-white/60 hover:scale-105'}`}
                                    >
                                        {bid.company?.company_name}
                                    </div>
                                </CustomOverlayMap>
                            ))}

                            {/* Lead Name Overlay */}
                            {leadPosition && (
                                <CustomOverlayMap position={leadPosition} yAnchor={1.4}>
                                    <div className="px-4 py-2 bg-black/80 border border-accent text-accent rounded-full font-black text-xs">
                                        내 태양광 부지
                                    </div>
                                </CustomOverlayMap>
                            )}

                            {/* Connect Line if selected */}
                            {selectedBid && selectedBid.position && leadPosition && (
                                <Polyline
                                    path={[
                                        leadPosition,
                                        selectedBid.position
                                    ]}
                                    strokeWeight={3}
                                    strokeColor="#FF5C00"
                                    strokeOpacity={0.5}
                                    strokeStyle="solid"
                                />
                            )}
                        </Map>

                        <div className="absolute bottom-10 left-10 right-10 z-10">
                            <div className="p-6 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-[32px] flex items-center gap-6 shadow-2xl">
                                <div className="p-3 bg-accent/20 rounded-2xl text-accent">
                                    <Navigation size={24} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">거리 확인</p>
                                    <p className="text-white font-bold leading-none text-sm md:text-base">
                                        {selectedBid && selectedBid.position && leadPosition ? (
                                            <>시공사와 내 부지 사이의 본사 직선 거리는 약 <span className="text-accent underline font-black">{calculateDistance(leadPosition, selectedBid.position)}km</span> 입니다.</>
                                        ) : (
                                            <>업체 또는 마커를 선택하면 거리가 표시됩니다.</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Floating Action Bar (If bid selected) */}
            {selectedBid && !isConfirmModalOpen && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-32px)] max-w-3xl animate-in slide-in-from-bottom duration-500">
                    <div className="p-6 md:p-8 bg-accent/90 backdrop-blur-3xl rounded-[32px] border border-white/30 shadow-[0_40px_100px_rgba(255,92,0,0.4)] flex flex-col md:flex-row items-center gap-6 group">
                        <div className="flex-1 flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-accent shadow-xl group-hover:scale-110 transition-transform">
                                <Building2 size={28} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-white/70 text-[9px] font-black uppercase tracking-[0.2em]">Partner</p>
                                <h4 className="text-xl md:text-2xl font-black text-white">{selectedBid.company?.company_name}</h4>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-white/20 hidden md:block"></div>

                        <div className="text-center md:text-right space-y-0.5">
                            <p className="text-white/70 text-[10px] font-bold">최종 공사비</p>
                            <p className="text-xl md:text-2xl font-black text-white">{formatWon(selectedBid.total_amount)}</p>
                        </div>

                        <Button
                            onClick={() => setIsConfirmModalOpen(true)}
                            className="w-full md:w-auto px-8 h-16 bg-white hover:bg-white/90 text-accent rounded-2xl font-black text-lg shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.98]"
                        >
                            이 업체 선정하기
                        </Button>
                    </div>
                </div>
            )}

            {/* 3. Confirm Modal */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="bg-[#111] border-white/10 text-white rounded-[32px] max-w-md p-6 md:p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[80px] -mr-24 -mt-24 rounded-full"></div>

                    <DialogHeader className="flex flex-col items-center text-center space-y-4 relative">
                        <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent/40 animate-pulse">
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl md:text-2xl font-black italic tracking-tight">"최종 파트너로 선정하시겠습니까?"</DialogTitle>
                            <DialogDescription className="text-white/60 leading-relaxed text-xs">
                                <span className="text-white font-bold">{selectedBid?.company?.company_name}</span>을 최종 시공사로 선택합니다.<br />
                                선정 즉시 연락처 및 성함이 공개됩니다.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="p-4 bg-white/5 rounded-[20px] space-y-2 my-6 border border-white/10">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">최종 공사비</span>
                            <span className="text-accent text-base font-black">{formatWon(selectedBid?.total_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">품질 보증</span>
                            <span className="text-white font-black text-xs">{selectedBid?.warranty_years_construction}년 무상 보증</span>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-center gap-2 relative">
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmModalOpen(false)}
                            disabled={submitting}
                            className="h-12 flex-1 rounded-xl border-white/10 hover:bg-white/5 font-bold text-xs"
                        >
                            잠시만요
                        </Button>
                        <Button
                            className="h-12 flex-1 bg-accent hover:bg-orange-600 rounded-xl font-black text-white shadow-lg shadow-accent/20 text-xs"
                            onClick={handleSelectBid}
                            disabled={submitting}
                        >
                            {submitting ? '처리 중...' : '네, 선정하겠습니다'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function DetailCard({ icon, label, value, sub, highlight }: any) {
    return (
        <div className={`p-8 rounded-[40px] border transition-all ${highlight ? 'bg-accent/5 border-accent/20 ring-1 ring-accent/10' : 'bg-white/2 border-white/5'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white/5 rounded-2xl">{icon}</div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-xs font-bold text-white/40">{sub}</p>
            </div>
        </div>
    );
}
