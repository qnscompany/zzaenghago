import { getAdminStatus } from '@/utils/auth';
import { redirect } from 'next/navigation';

export default async function GitHubTestPage() {
    const { isAdmin } = await getAdminStatus();

    // 보안을 위해 관리자만 접근 가능하도록 제한
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
            cache: 'no-store' // 실시간 데이터 확인을 위해 캐시 비활성화
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        userData = await response.json();
    } catch (err: any) {
        error = err.message;
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">GitHub API 연동 테스트</h1>
                <p className="text-slate-400 mt-2">Vercel 환경 변수(GITHUB_TOKEN)를 이용한 데이터 호출 테스트입니다.</p>
            </header>

            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-500">
                    호출 결과
                </h3>

                {error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                        <p className="font-bold">⚠️ 오류 발생</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                ) : userData ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <img
                                src={userData.avatar_url}
                                alt={userData.login}
                                className="w-16 h-16 rounded-full border border-white/10"
                            />
                            <div>
                                <p className="text-xl font-bold text-white">{userData.name || userData.login}</p>
                                <p className="text-slate-400">@{userData.login}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mb-1">Public Repos</p>
                                <p className="text-2xl font-bold text-white">{userData.public_repos}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mb-1">Followers</p>
                                <p className="text-2xl font-bold text-white">{userData.followers}</p>
                            </div>
                        </div>

                        <pre className="bg-black/40 p-6 rounded-2xl border border-white/5 text-xs text-slate-300 overflow-auto max-h-60 font-mono">
                            {JSON.stringify(userData, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-12">데이터를 불러오는 중...</p>
                )}
            </div>

            <div className="flex justify-start">
                <a
                    href="/admin"
                    className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                >
                    ← 관리자 대시보드로 돌아가기
                </a>
            </div>
        </div>
    );
}
