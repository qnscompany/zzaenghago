import { getAdminStatus } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { getInquiries } from './actions';
import InquiriesClient from './InquiriesClient';
import { MessageSquare } from 'lucide-react';

export default async function AdminInquiriesPage() {
    const { isAdmin } = await getAdminStatus();
    if (!isAdmin) {
        redirect('/');
    }

    let inquiries = [];
    try {
        inquiries = await getInquiries();
    } catch (e) {
        console.error('Error fetching inquiries:', e);
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">운영자 문의 응대</h1>
                    <p className="text-slate-400 mt-2">유저들의 문의 사항을 확인하고 전담 답변을 작성하세요.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-bold uppercase tracking-widest">
                    <MessageSquare size={16} />
                    Inquiry Management
                </div>
            </header>

            <InquiriesClient initialInquiries={inquiries} />
        </div>
    );
}
