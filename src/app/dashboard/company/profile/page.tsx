import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
    ChevronLeft,
    Building2,
    ShieldCheck,
    Hourglass,
    Settings
} from "lucide-react";
import Link from "next/link";
import ProfileForm from "./ProfileForm";

export default async function CompanyProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'company') {
        redirect('/');
    }

    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: pendingUpdates } = await supabase
        .from('profile_updates')
        .select('*')
        .eq('company_id', company?.id)
        .eq('status', 'pending');

    const isPending = !!(pendingUpdates && pendingUpdates.length > 0);

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/dashboard/company" className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors mb-8">
                    <ChevronLeft size={20} />
                    대시보드로 돌아가기
                </Link>

                <div className="space-y-8">
                    <div className="p-8 bg-white/2 border border-white/10 rounded-[40px]">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent/20 rounded-2xl text-accent">
                                    <Building2 size={24} />
                                </div>
                                <h1 className="text-2xl font-bold text-white">업체 정보 관리</h1>
                            </div>
                            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                <Settings size={18} className="text-white/20" />
                            </div>
                        </div>

                        {isPending && (
                            <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-[24px] flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <Hourglass className="text-orange-400 shrink-0 animate-spin-slow" />
                                <div>
                                    <p className="text-sm font-bold text-white">운영자 승인 대기 중</p>
                                    <p className="text-xs text-white/40 mt-1 leading-relaxed">준공 정보를 포함한 업체 정보 수정 요청을 운영자가 검토 중입니다. 승인 전까지는 추가 수정이 제한됩니다.</p>
                                </div>
                            </div>
                        )}

                        <ProfileForm
                            companyName={company?.company_name || ''}
                            businessNumber={company?.business_number || ''}
                            isPending={isPending}
                        />
                    </div>

                    <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[40px] flex items-start gap-5">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-2">시공업체 신뢰도 시스템</h4>
                            <p className="text-sm text-white/40 leading-relaxed">
                                쨍하고는 검증된 파트너만을 고객에게 연결합니다. 정확한 업체 정보는 견적 수락 확률을 40% 이상 높여줍니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
