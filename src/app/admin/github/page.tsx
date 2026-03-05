import { getAdminStatus } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { Github, ExternalLink, GitBranch, Users, Star, BookOpen } from 'lucide-react';

export default async function GitHubProfilePage() {
    const { isAdmin } = await getAdminStatus();

    if (!isAdmin) {
        redirect('/');
    }

    const githubToken = process.env.GITHUB_TOKEN;
    let userData = null;
    let error = null;

    try {
        const response = await fetch('https://api.github.com/users/qnscompany', {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            next: { revalidate: 3600 } // 1시간마다 캐시 갱신
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        userData = await response.json();
    } catch (err: any) {
        error = err.message;
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">GitHub 인사이트</h1>
                    <p className="text-slate-400 mt-2">운영상 필수적인 GitHub 계정 활동 및 프로필 데이터입니다.</p>
                </div>
                <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 text-blue-400 text-sm font-bold">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    API Connected
                </div>
            </header>

            {error ? (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 flex items-center gap-4">
                    <ExternalLink size={24} />
                    <div>
                        <p className="font-bold">GitHub 연동 오류</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                </div>
            ) : userData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-sm text-center">
                            <img
                                src={userData.avatar_url}
                                alt={userData.login}
                                className="w-32 h-32 rounded-full border-4 border-blue-600/20 mx-auto mb-6 shadow-2xl shadow-blue-500/10"
                            />
                            <h2 className="text-2xl font-bold text-white">{userData.name || userData.login}</h2>
                            <p className="text-slate-400 mb-6">@{userData.login}</p>

                            <div className="grid grid-cols-2 gap-4 py-6 border-t border-white/5">
                                <div>
                                    <p className="text-2xl font-bold">{userData.followers}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Followers</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{userData.following}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Following</p>
                                </div>
                            </div>

                            <a
                                href={userData.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-white text-slate-950 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                <Github size={18} />
                                Visit Profile
                            </a>
                        </div>
                    </div>

                    {/* Right: Detailed Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <StatCard
                                icon={<BookOpen size={20} className="text-blue-500" />}
                                title="Public Repos"
                                value={userData.public_repos}
                            />
                            <StatCard
                                icon={<GitBranch size={20} className="text-purple-500" />}
                                title="Public Gists"
                                value={userData.public_gists}
                            />
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Users size={18} className="text-blue-500" />
                                계정 상세 정보
                            </h3>
                            <div className="space-y-4">
                                <InfoRow label="Location" value={userData.location || 'Not specified'} />
                                <InfoRow label="Company" value={userData.company || 'Not specified'} />
                                <InfoRow label="Blog" value={userData.blog || 'Not specified'} />
                                <InfoRow label="Created At" value={new Date(userData.created_at).toLocaleDateString()} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <Github size={48} className="text-slate-700 mb-4" />
                    <p className="text-slate-500 font-bold">Connecting to GitHub...</p>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: number }) {
    return (
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
                <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest">{title}</h4>
            </div>
            <p className="text-4xl font-extrabold font-outfit">{value}</p>
        </div>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <span className="text-sm text-slate-400 font-medium">{label}</span>
            <span className="text-sm text-white font-bold">{value}</span>
        </div>
    );
}
