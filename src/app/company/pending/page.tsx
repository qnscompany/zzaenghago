import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Building2, XCircle, Clock, CheckCircle2, Home } from 'lucide-react';
import Link from 'next/link';

export default async function PendingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Bypass for admins (role or specific email)
    if (user.user_metadata.role === 'admin' || user.email === 'qnscompany88@gmail.com') {
        redirect('/');
    }

    const { data: company } = await supabase
        .from('companies')
        .select('company_name, match_status, rejection_reason')
        .eq('user_id', user.id)
        .single();

    if (!company || company.match_status === 'approved') {
        redirect('/leads');
    }

    const isRejected = company.match_status === 'rejected';

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] mt-16 bg-gray-50">
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center relative z-10">
                    <div className="mb-6 flex justify-center">
                        {isRejected ? (
                            <div className="p-4 bg-red-100 rounded-full">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                        ) : (
                            <div className="p-4 bg-blue-100 rounded-full animate-pulse">
                                <Clock className="w-12 h-12 text-blue-600" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {company.company_name}
                    </h1>

                    <p className="text-lg font-semibold text-gray-700 mb-4">
                        {isRejected ? "가입 신청이 반려되었습니다" : "가입 승인 대기 중입니다"}
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
                        {isRejected ? (
                            <>
                                <p className="text-sm font-medium text-gray-500 mb-1">반려 사유:</p>
                                <p className="text-gray-900">{company.rejection_reason || "사유가 등록되지 않았습니다. 관리자에게 문의하세요."}</p>
                            </>
                        ) : (
                            <p className="text-gray-600 leading-relaxed">
                                쨍하고 관리자가 귀사의 정보를 확인 중입니다. 승인이 완료되면 대시보드 이용이 가능합니다.
                                <br /><br />
                                <span className="text-sm">평균적으로 영엽일 기준 1~2일이 소요됩니다.</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                            <Home size={18} />
                            홈으로 가기
                        </Link>
                    </div>

                    <p className="mt-8 text-xs text-gray-400">
                        문의: qnscompany88@gmail.com | 010-2018-1101
                    </p>
                </div>
            </div>
        </div>
    );
}
