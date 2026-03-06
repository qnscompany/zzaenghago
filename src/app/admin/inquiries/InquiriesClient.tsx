'use client'

import { useState } from 'react';
import {
    Search,
    MessageSquare,
    Clock,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Send
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/utils/cn';
import { answerInquiry } from './actions';

interface Inquiry {
    id: string;
    user_id: string;
    category: string;
    title: string;
    content: string;
    status: 'pending' | 'answered';
    answer?: string;
    answered_at?: string;
    created_at: string;
    user?: {
        email: string;
    };
}

export default function InquiriesClient({ initialInquiries }: { initialInquiries: Inquiry[] }) {
    const [inquiries, setInquiries] = useState(initialInquiries);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredInquiries = inquiries.filter(inq =>
        inq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAnswer = async (id: string) => {
        if (!answer.trim()) return;
        setLoading(true);
        try {
            await answerInquiry(id, answer);
            // Update local state
            setInquiries(prev => prev.map(inq =>
                inq.id === id
                    ? { ...inq, answer, status: 'answered', answered_at: new Date().toISOString() }
                    : inq
            ));
            setAnswer('');
            setExpandedId(null);
        } catch (e) {
            console.error(e);
            alert('답변 등록 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="제목, 내용, 유저 이메일로 검색"
                    className="w-full bg-slate-900/50 border border-white/5 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500/50 transition-all font-medium backdrop-blur-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inq) => (
                        <div
                            key={inq.id}
                            className={cn(
                                "bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden transition-all",
                                expandedId === inq.id ? "border-blue-500/30 ring-1 ring-blue-500/10 shadow-2xl" : "hover:border-white/10"
                            )}
                        >
                            <button
                                onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                                className="w-full p-6 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "p-3 rounded-2xl",
                                        inq.status === 'answered' ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
                                    )}>
                                        {inq.status === 'answered' ? <CheckCircle2 size={24} /> : <MessageSquare size={24} />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-lg text-slate-400">
                                                {inq.category}
                                            </span>
                                            <h3 className="font-bold text-lg">{inq.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-400">{inq.user?.email} • {format(new Date(inq.created_at), 'yyyy.MM.dd HH:mm')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {inq.status === 'answered' ? (
                                        <span className="text-xs font-bold text-green-400">답변 완료</span>
                                    ) : (
                                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            답변 대기
                                        </span>
                                    )}
                                    {expandedId === inq.id ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                                </div>
                            </button>

                            {expandedId === inq.id && (
                                <div className="px-6 pb-8 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="bg-white/5 rounded-2xl p-6 text-slate-300 leading-relaxed border border-white/5">
                                        {inq.content}
                                    </div>

                                    {inq.status === 'answered' ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-tight">
                                                <CheckCircle2 size={16} />
                                                작성된 답변
                                            </div>
                                            <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-6 text-blue-100 italic">
                                                {inq.answer}
                                                <p className="text-[10px] text-blue-400/50 mt-4 not-italic uppercase tracking-widest font-bold">
                                                    Answered at {inq.answered_at ? format(new Date(inq.answered_at), 'yyyy-MM-dd HH:mm') : '-'} by Admin
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-tight">
                                                <Send size={16} />
                                                대응 답변 작성
                                            </div>
                                            <textarea
                                                className="w-full h-32 bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                placeholder="답변 내용을 작성해 주세요..."
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleAnswer(inq.id)}
                                                    disabled={loading || !answer.trim()}
                                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                                                >
                                                    {loading ? '등록 중...' : '답변 등록하기'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-slate-900/50 rounded-[40px] border border-white/5 group">
                        <MessageSquare className="mx-auto text-slate-700 mb-4 group-hover:scale-110 transition-transform" size={48} />
                        <h4 className="text-lg font-bold text-slate-500">조회된 문의 내역이 없습니다.</h4>
                        <p className="text-slate-600 text-sm mt-1">검색어나 필터를 확인해 주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
