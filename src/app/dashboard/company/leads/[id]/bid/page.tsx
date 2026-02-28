import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BadgeDollarSign, Calculator, Info, Building2, MapPin, Zap } from "lucide-react";
import BidFormPageClient from "./BidFormPageClient";

export default async function BidCreatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: leadId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || (user.user_metadata.role !== 'company' && user.user_metadata.role !== 'admin')) {
        redirect('/auth/login');
    }

    // Check if company exists
    const { data: company } = await supabase
        .from('companies')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single();

    if (!company) {
        redirect('/dashboard/company/profile');
    }

    // Check if bid already exists (to prevent duplicate page entry)
    const { data: existingBid } = await supabase
        .from('bids')
        .select('id')
        .eq('lead_id', leadId)
        .eq('company_id', company.id)
        .maybeSingle();

    if (existingBid) {
        redirect('/dashboard/company');
    }

    // Fetch lead info
    const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

    if (error || !lead) {
        notFound();
    }

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background px-4">
            <div className="max-w-[1600px] mx-auto">
                <Link
                    href="/dashboard/company"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    대시보드로 돌아가기
                </Link>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left: Lead Summary Sticky */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="p-8 bg-white/2 border border-white/10 rounded-[40px] space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MapPin size={20} className="text-accent" />
                                    대상 부지 정보
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">주소</p>
                                        <p className="text-white font-bold leading-tight">{lead.address}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">면적</p>
                                            <p className="text-white font-bold">{lead.area_sqm.toLocaleString()} ㎡</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">희망용량</p>
                                            <p className="text-white font-bold">{lead.desired_capacity_kw || '미정'} kW</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">추가 요청사항</p>
                                        <p className="text-xs text-white/60 leading-relaxed italic">
                                            "{lead.additional_notes || '입력된 요청사항이 없습니다.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-accent/5 border border-accent/20 rounded-[32px] flex items-start gap-4">
                                <Info className="text-accent shrink-0 mt-1" size={18} />
                                <p className="text-xs text-white/60 leading-relaxed">
                                    견적 작성 시 입력된 정보는 고객에게 실시간으로 전달되며, 이후 20년 수익분석 데이터가 자동으로 계산되어 보여집니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: The Form Page (Client-side) */}
                    <div className="lg:col-span-3">
                        <div className="p-10 md:p-16 bg-white/2 border border-white/10 rounded-[48px]">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                                    <BadgeDollarSign size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-white">개략 견적서 작성</h1>
                                    <p className="text-white/40 text-sm">상세 설계를 위한 기초 가이드를 작성해주세요.</p>
                                </div>
                            </div>

                            <BidFormPageClient lead={lead} company={company} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
