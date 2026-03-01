import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { notFound, redirect } from "next/navigation";
import BidSelectionClient from "./BidSelectionClient";
import Link from "next/link";
import { ChevronLeft, MapPin, Maximize2, Zap } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function BidSelectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: leadId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch lead info
    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

    if (leadError || !lead) {
        notFound();
    }

    // Security check: Only the customer who owns the lead or an admin can view this
    if (lead.customer_id !== user.id && user.user_metadata.role !== 'admin') {
        redirect('/leads');
    }

    // Fetch all sent bids for this lead
    // Use admin client to ensure we get company details even if RLS is strict
    const adminSupabase = createAdminClient();
    const queryClient = adminSupabase || supabase;

    const { data: bids, error: bidsError } = await queryClient
        .from('bids')
        .select(`
            *,
            company:companies(*)
        `)
        .eq('lead_id', leadId)
        .eq('status', 'sent')
        .order('total_amount', { ascending: true }); // Show cheapest first by default

    if (bidsError) {
        console.error("Error fetching bids:", bidsError);
    }

    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "";

    return (
        <main className="min-h-screen pt-20 pb-20 bg-background px-4">
            <div className="max-w-6xl mx-auto">
                <Link
                    href={`/leads/${leadId}`}
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 group text-sm"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    부지 상세정보로 돌아가기
                </Link>

                <div className="mb-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2 py-0.5 bg-accent/20 text-accent rounded-full text-[9px] font-black uppercase tracking-widest">
                            {lead.project_type === 'rooftop' ? '지붕형' : lead.project_type === 'ground' ? '지상형' : '영농형'}
                        </span>
                        <h1 className="text-2xl md:text-4xl font-black text-white">{lead.address}</h1>
                    </div>
                    <div className="flex items-center gap-6 text-white/40 text-sm">
                        <div className="flex items-center gap-2">
                            <Maximize2 size={16} />
                            {lead.area_sqm.toLocaleString()}㎡
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap size={16} />
                            희망 {lead.desired_capacity_kw || '미정'}kW
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            수신 견적 {bids?.length || 0}개
                        </div>
                    </div>
                </div>

                <BidSelectionClient
                    lead={lead}
                    bids={bids || []}
                    kakaoKey={kakaoKey}
                />
            </div>
        </main>
    );
}
