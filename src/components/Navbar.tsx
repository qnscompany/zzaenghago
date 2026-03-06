'use client'

import Link from "next/link";
import { Sun, LogOut, User, Building2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { signOut } from "@/app/auth/actions";
import { useRouter } from "next/navigation";

export default function Navbar({
    initialUser,
    initialRole,
    initialUnreadCount = 0
}: {
    initialUser?: AuthUser | null,
    initialRole?: string | null,
    initialUnreadCount?: number
}) {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(initialUser || null);
    const [role, setRole] = useState<string | null>(initialRole || initialUser?.user_metadata?.role || null);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [loading, setLoading] = useState(!initialUser);
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            if (!initialUser) {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser && !initialRole) {
                    // 런타임에 role이 없는 경우에만 추가 조회 (거의 발생 안 함)
                    const { data } = await supabase.from('users').select('role').eq('id', currentUser.id).single();
                    setRole(data?.role || currentUser.user_metadata?.role || null);
                }
            }
            setLoading(false);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                // Metadata 보다는 DB의 최신 정보를 우선하되, 없으면 Metadata라도 시도
                const { data } = await supabase.from('users').select('role').eq('id', currentUser.id).single();
                setRole(data?.role || currentUser.user_metadata?.role || null);
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, initialUser, initialRole]);

    const handleSignOut = async (e: React.FormEvent) => {
        e.preventDefault();
        await signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2 text-accent font-bold text-xl font-outfit">
                        <Sun className="fill-accent" />
                        <span>쨍하고</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/about" className="hover:text-accent transition-colors">서비스 소개</Link>
                        {user && (
                            <>
                                {role === 'admin' ? (
                                    <>
                                        <Link href="/dashboard/company" className="hover:text-accent transition-colors">시공사 대시보드</Link>
                                        <Link href="/admin" className="hover:text-accent transition-colors">관리자 대시보드</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={role === 'company' ? '/dashboard/company' : '/leads'}
                                            className="hover:text-accent transition-colors"
                                        >
                                            {role === 'company' ? '고객 관리' : '내 부지 목록'}
                                        </Link>
                                        <Link href="/dashboard/inquiries" className="hover:text-accent transition-colors flex items-center gap-1">
                                            운영자에 문의
                                            {unreadCount > 0 && (
                                                <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full animate-pulse">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        {!loading && (
                            user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-foreground/60 text-xs flex items-center gap-1">
                                        {role === 'company' ? <Building2 size={14} /> : <User size={14} />}
                                        {user.email}
                                    </span>
                                    <form onSubmit={handleSignOut}>
                                        <button type="submit" className="text-foreground/60 hover:text-red-400 transition-colors flex items-center gap-1">
                                            <LogOut size={16} />
                                            로그아웃
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <Link href="/auth/login" className="bg-accent text-white px-4 py-2 rounded-full hover:bg-solar-blue transition-all shadow-lg shadow-accent/20">
                                    시작하기
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
