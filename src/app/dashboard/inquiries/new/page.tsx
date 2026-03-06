'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInquiry } from '../actions';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const categories = [
    '계정 관련',
    '시스템 오류',
    '견적/매칭 문의',
    '서비스 제안',
    '기타'
];

export default function NewInquiryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: '계정 관련',
        title: '',
        content: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return;

        setLoading(true);
        try {
            await createInquiry(formData);
            router.push('/dashboard/inquiries');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('문의 등록 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background px-4">
            <div className="max-w-[800px] mx-auto space-y-8">
                <Link
                    href="/dashboard/inquiries"
                    className="inline-flex items-center gap-2 text-foreground/40 hover:text-white transition-colors text-sm font-medium group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    목록으로 돌아가기
                </Link>

                <div className="bg-white/2 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                    <header className="relative mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2">새 문의 작성</h1>
                        <p className="text-foreground/40 font-medium">관리자에게 궁금한 점이나 불편한 사항을 알려주세요.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="relative space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">문의 분류</label>
                                <select
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">제목</label>
                            <input
                                type="text"
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent transition-colors"
                                placeholder="문의 제목을 입력해 주세요"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">문의 내용</label>
                            <textarea
                                className="w-full h-48 bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent transition-colors resize-none"
                                placeholder="상세 내용을 입력해 주세요. (기기 정보, 에러 발생 시점 등을 포함하면 더 빠른 답변이 가능합니다.)"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/10 rounded-2xl text-[10px] text-accent font-medium leading-relaxed">
                            <AlertCircle size={14} className="shrink-0" />
                            영업일 기준 24시간 이내에 답변을 드릴 수 있도록 노력하겠습니다. 긴급한 용무는 고객센터로 연락 부탁드립니다.
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.title || !formData.content}
                            className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-solar-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-accent/20"
                        >
                            {loading ? (
                                '등록 중...'
                            ) : (
                                <>
                                    <Send size={18} />
                                    문의 등록하기
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
