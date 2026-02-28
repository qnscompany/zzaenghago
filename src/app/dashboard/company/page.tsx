import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

export default async function CompanyDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'company') {
        redirect('/');
    }

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    return (
        <div className="pt-24 min-h-screen bg-background px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold font-outfit mb-2">시공업체 대시보드</h1>
                    <p className="text-foreground/60">전국의 오픈된 태양광 리드를 확인하고 견적을 발송하세요.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-accent/10 p-3 rounded-2xl text-accent">
                            <Search size={24} />
                        </div>
                        <h2 className="text-xl font-bold">오픈 리드 탐색</h2>
                    </div>

                    {leads && leads.length > 0 ? (
                        <div className="grid gap-4">
                            {/* Lead list for companies */}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-foreground/40">
                            현재 참여 가능한 새로운 리드가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
