import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CompaniesClient from './CompaniesClient';
import { Building2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default async function AdminCompaniesPage() {
    const supabase = await createClient();

    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== 'admin') {
        redirect('/');
    }

    const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .neq('match_status', 'pre_registered')
        .order('registered_at', { ascending: false });

    if (error) {
        console.error('Error fetching companies:', error);
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">시공사 가입 관리</h1>
                    <p className="text-slate-400 mt-2">가입 신청 현황을 확인하고 승인/반려 처리를 진행합니다.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-bold uppercase tracking-widest">
                    <Building2 size={16} />
                    Company Approval
                </div>
            </header>

            <CompaniesClient initialCompanies={companies || []} />
        </div>
    );
}
