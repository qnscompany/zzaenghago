import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CompaniesClient from './CompaniesClient';
import { Building2 } from 'lucide-react';

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
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-gray-900 text-white rounded-lg">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">시공사 가입 관리</h1>
                        <p className="text-gray-500 text-sm">가입 신청 현황을 확인하고 승인/반려 처리를 진행합니다.</p>
                    </div>
                </div>

                <CompaniesClient initialCompanies={companies || []} />
            </div>
        </div>
    );
}
