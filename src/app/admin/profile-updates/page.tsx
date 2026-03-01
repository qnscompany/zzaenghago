import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getProfileUpdates } from './actions';
import ProfileUpdatesClient from './ProfileUpdatesClient';
import { UserCog } from 'lucide-react';

export default async function AdminProfileUpdatesPage() {
    const supabase = await createClient();

    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== 'admin') {
        redirect('/');
    }

    let updates = [];
    try {
        updates = await getProfileUpdates();
    } catch (e) {
        console.error('Error fetching profile updates:', e);
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">정보 변경 승인</h1>
                    <p className="text-slate-400 mt-2">시공사가 수정한 프로필 정보를 검토하고 승인합니다.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-bold uppercase tracking-widest">
                    <UserCog size={16} />
                    Profile Updates
                </div>
            </header>

            <ProfileUpdatesClient initialUpdates={updates} />
        </div>
    );
}
