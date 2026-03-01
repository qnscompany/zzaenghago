'use client'

import Link from "next/link";
import { Sun, LogOut, User, Building2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { signOut } from "@/app/auth/actions";

export default function Navbar({ initialUser }: { initialUser?: any }) {
    const [user, setUser] = useState<any>(initialUser);
    const [loading, setLoading] = useState(!initialUser);
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            if (!initialUser) {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            }
            setLoading(false);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth, initialUser]);

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
                                <Link
                                    href={
                                        user.user_metadata.role === 'admin' ? '/admin' :
                                            user.user_metadata.role === 'company' ? '/dashboard/company' : '/leads'
                                    }
                                    className="hover:text-accent transition-colors"
                                >
                                    대시보드
                                </Link>
                            </>
                        )}

                        {!loading && (
                            user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-foreground/60 text-xs flex items-center gap-1">
                                        {user.user_metadata.role === 'company' ? <Building2 size={14} /> : <User size={14} />}
                                        {user.email}
                                    </span>
                                    <form action={signOut}>
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
