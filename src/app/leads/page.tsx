import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";

export default async function LeadsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'customer') {
        redirect('/');
    }

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="pt-24 min-h-screen bg-background px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-bold font-outfit mb-2">내 부지 목록</h1>
                        <p className="text-foreground/60">등록하신 태양광 부지 리스트와 견적 현황입니다.</p>
                    </div>
                    <Link href="/leads/new" className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-solar-blue transition-all shadow-lg shadow-accent/20">
                        <PlusCircle size={20} />
                        새 부지 등록
                    </Link>
                </div>

                {leads && leads.length > 0 ? (
                    <div className="grid gap-6">
                        {/* Lead list items will go here */}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                        <Search size={48} className="text-foreground/20 mb-4" />
                        <p className="text-foreground/40 font-medium">아직 등록된 부지가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
