import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
    Building2,
    CheckCircle2,
    MapPin,
    Maximize2,
    Zap,
    Calendar,
    Clock,
    ChevronRight,
    Search,
    AlertCircle,
    UserCircle2,
    Settings
} from "lucide-react";
import Link from "next/link";
import ClientDashboard from "./ClientDashboard";

export default async function CompanyDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const userRole = user.user_metadata.role;
    if (userRole !== 'company' && userRole !== 'admin') {
        redirect('/');
    }

    // Fetch company profile
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    // Fetch bids sent by this company to these leads
    const { data: myBids } = await supabase
        .from('bids')
        .select('lead_id')
        .eq('company_id', company?.id);

    // Fetch total bids count for each lead (from ANY company)
    const { data: allBids } = await supabase
        .from('bids')
        .select('lead_id');

    const myBidsMap = new Set(myBids?.map(b => b.lead_id) || []);

    // Count bids per lead
    const bidCountsMap: Record<string, number> = {};
    allBids?.forEach(b => {
        bidCountsMap[b.lead_id] = (bidCountsMap[b.lead_id] || 0) + 1;
    });

    const enhancedLeads = leads?.map(lead => ({
        ...lead,
        has_sent_bid: myBidsMap.has(lead.id),
        total_bids_count: bidCountsMap[lead.id] || 0
    })) || [];

    console.log(`[Dashboard Debug] User ID: ${user.id}`);
    console.log(`[Dashboard Debug] User Role (Metadata): ${user.user_metadata.role}`);
    console.log(`[Dashboard Debug] Leads Count: ${enhancedLeads?.length || 0}`);
    if (leadsError) {
        console.error(`[Dashboard Debug] Leads Fetch Error:`, leadsError);
    }
    if (enhancedLeads && enhancedLeads.length > 0) {
        console.log(`[Dashboard] Sample lead address: ${enhancedLeads[0].address}, Has Sent: ${enhancedLeads[0].has_sent_bid}`);
    }

    // Calculate "Sent Bids" count
    const sentCount = myBids?.length || 0;

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background px-4">
            <div className="max-w-[1600px] mx-auto">
                {/* Company Profile Header */}
                <div className="mb-12 p-8 bg-white/2 border border-white/10 rounded-[40px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                                <Building2 size={32} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">{company?.company_name || '회사명 미등록'}</h1>
                                    {company?.is_verified && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                            <CheckCircle2 size={10} />
                                            VERIFIED
                                        </div>
                                    )}
                                </div>
                                <p className="text-foreground/40 text-sm flex items-center gap-1.5">
                                    <UserCircle2 size={14} />
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex items-center gap-8 py-2 md:py-0">
                                <StatItem label="대기중 리드" value={enhancedLeads?.length || 0} />
                                <StatItem label="보낸 견적" value={sentCount} />
                            </div>
                            <Link href="/dashboard/company/profile" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-white/60 transition-all group">
                                <Settings size={14} className="group-hover:rotate-90 transition-transform" />
                                정보 관리
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Dashboard Tabs & Content */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                            <Search size={24} className="text-accent" />
                            실시간 신규 부지 탐색
                        </h2>
                    </div>

                    <ClientDashboard
                        leads={enhancedLeads}
                        kakaoKey={process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || ""}
                    />
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="text-center md:text-right">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-bold font-outfit text-white">{value}</p>
        </div>
    );
}
