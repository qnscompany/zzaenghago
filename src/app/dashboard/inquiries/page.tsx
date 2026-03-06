import { getMyInquiries } from './actions';
import Link from 'next/link';
import { MessageSquare, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default async function InquiriesPage() {
    const inquiries = await getMyInquiries();

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background px-4">
            <div className="max-w-[1000px] mx-auto space-y-8">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">운영자 문의 내역</h1>
                        <p className="text-foreground/40 mt-2">문의하신 내용과 답변을 확인하실 수 있습니다.</p>
                    </div>
                    <Link
                        href="/dashboard/inquiries/new"
                        className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl font-bold text-sm hover:bg-solar-blue transition-all shadow-lg shadow-accent/20"
                    >
                        <Plus size={18} />
                        새 문의 작성
                    </Link>
                </header>

                <div className="grid gap-4">
                    {inquiries.length > 0 ? (
                        inquiries.map((inq) => (
                            <div
                                key={inq.id}
                                className="bg-white/2 border border-white/5 rounded-[32px] p-6 hover:border-white/10 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-lg text-foreground/40">
                                                {inq.category}
                                            </span>
                                            {inq.status === 'answered' ? (
                                                <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                                                    <CheckCircle2 size={12} />
                                                    답변 완료
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-accent flex items-center gap-1">
                                                    <Clock size={12} />
                                                    처리 중
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{inq.title}</h3>
                                        <p className="text-sm text-foreground/60 line-clamp-2 leading-relaxed">{inq.content}</p>
                                        <p className="text-[10px] text-foreground/30">{format(new Date(inq.created_at), 'yyyy.MM.dd HH:mm')}</p>
                                    </div>

                                    {inq.answer && (
                                        <div className="hidden md:block max-w-[40%] bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter mb-2">관리자 답변</p>
                                            <p className="text-xs text-blue-100/80 italic line-clamp-3">{inq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white/2 rounded-[40px] border border-white/5 opacity-50">
                            <MessageSquare className="mx-auto text-foreground/20 mb-4" size={48} />
                            <h4 className="text-lg font-bold text-white/40">문의 내역이 없습니다.</h4>
                            <p className="text-foreground/30 text-sm mt-1">도움이 필요하시면 새 문의를 작성해 주세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
