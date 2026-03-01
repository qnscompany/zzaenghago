'use client'

import { useState, useActionState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BadgeDollarSign, Calculator, CheckCircle2, AlertCircle, Hourglass, ShieldCheck, Clock, FileText, Building2, Zap, Coins } from 'lucide-react'
import { submitBid, type BidActionState } from '../../../bidActions'
import { useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

const ITEMS = [
    { id: 'module', label: '모듈' },
    { id: 'inverter', label: '인버터' },
    { id: 'structure', label: '구조물' },
    { id: 'electric', label: '전기공사' },
    { id: 'civil', label: '토목공사' },
    { id: 'permits', label: '계통연계 대행' },
    { id: 'monitoring', label: '모니터링 시스템' },
]

export default function BidFormPageClient({ lead, company, creditBalance }: { lead: any, company: any, creditBalance: number }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState<BidActionState, FormData>(submitBid, null);
    const [capacity, setCapacity] = useState<string>(lead?.desired_capacity_kw?.toString() || '');
    const [totalAmount, setTotalAmount] = useState<string>('');
    const [unitPrice, setUnitPrice] = useState<number>(0);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Modal states
    const [showLackModal, setShowLackModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (state?.success) {
            window.location.href = '/dashboard/company';
        }
        if (state?.error === 'CREDIT_LACK') {
            setShowLackModal(true);
        }
    }, [state]);

    useEffect(() => {
        const cap = parseFloat(capacity);
        const total = parseFloat(totalAmount);
        if (cap > 0 && total > 0) {
            setUnitPrice(Math.floor(total / cap));
        } else {
            setUnitPrice(0);
        }
    }, [capacity, totalAmount]);

    const handleItemChange = (itemId: string, checked: boolean) => {
        if (checked) {
            setSelectedItems([...selectedItems, itemId]);
        } else {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        }
    };

    const handleSubmitAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        if (creditBalance < 1) {
            setShowLackModal(true);
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmSubmit = () => {
        setShowConfirmModal(false);
        formRef.current?.requestSubmit();
    };

    return (
        <>
            <form ref={formRef} action={formAction} onSubmit={handleSubmitAttempt} className="space-y-12">
                <input type="hidden" name="lead_id" value={lead?.id} />

                {state?.error && state.error !== 'CREDIT_LACK' && (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center gap-4 text-red-400">
                        <AlertCircle size={24} />
                        <p className="font-bold">{state.error}</p>
                    </div>
                )}

                {/* ROI 자동 생성 안내 - 강조형 */}
                <div className="p-8 bg-accent/10 border border-accent/20 rounded-[40px] flex items-start gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
                    <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                        <Calculator size={32} />
                    </div>
                    <div className="space-y-2 relative">
                        <h4 className="text-white text-xl font-black italic">"20년 수익성 정밀 분석표 자동 생성 가이드"</h4>
                        <p className="text-white/60 leading-relaxed">
                            입력하신 <span className="text-accent font-bold">설치 용량</span>과 <span className="text-accent font-bold">총 공사비</span>를 바탕으로 실시간 자동 계산되는 <span className="text-white font-bold underline decoration-accent/40 decoration-4">20개년 예상 수익 분석표</span>가 고객 견적서에 포함됩니다. <span className="block mt-2 text-xs italic opacity-50 underline">* 본 수치는 최초 견적 정보를 바탕으로 실시간 자동 계산되며, 시장 상황에 따라 달라질 수 있음이 고객에게 명시됩니다.</span>
                        </p>
                    </div>
                </div>

                {/* 기본 공사 정보 섹션 */}
                <div className="space-y-8">
                    <SectionTitle icon={<Building2 size={24} className="text-accent" />} title="기본 공사 정보" />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">설치 예상 용량 (kW)</Label>
                            <Input
                                name="capacity_kw"
                                type="number"
                                step="0.1"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold focus:ring-accent/50 focus:border-accent"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">사업 유형</Label>
                            <Select name="project_type" defaultValue={lead?.project_type || 'rooftop'} required>
                                <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg font-bold">
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-white/10 text-white">
                                    <SelectItem value="rooftop">지붕형 태양광</SelectItem>
                                    <SelectItem value="ground">지상형 태양광</SelectItem>
                                    <SelectItem value="agri">영농형 태양광</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">총 공사비 (VAT 포함, 원)</Label>
                            <div className="relative">
                                <Input
                                    name="total_amount_display"
                                    type="text"
                                    value={totalAmount ? parseInt(totalAmount).toLocaleString() : ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setTotalAmount(val);
                                    }}
                                    placeholder="예: 55,000,000"
                                    className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold pr-32"
                                    required
                                />
                                <input type="hidden" name="total_amount" value={totalAmount} />
                                {unitPrice > 0 && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-accent/20 text-accent px-3 py-1 rounded-lg text-xs font-black">
                                        kW당 {Math.floor(unitPrice / 10000).toLocaleString()}만원
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">공사 기간 (예상)</Label>
                                <Input name="construction_period" placeholder="예: 약 40일" className="h-16 bg-white/5 border-white/10 rounded-2xl" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">견적 유효기간</Label>
                                <Input name="valid_thru" type="date" className="h-16 bg-white/5 border-white/10 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 공사 범위 섹션 */}
                <div className="space-y-8">
                    <SectionTitle
                        icon={<Zap size={24} className="text-accent" />}
                        title="공사 범위 및 포함 항목"
                        sub={`${selectedItems.length}개 선택됨 (최소 3개)`}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {ITEMS.map((item) => (
                            <div key={item.id} className={`flex flex-col items-center gap-4 bg-white/2 p-6 rounded-[32px] border transition-all cursor-pointer group ${selectedItems.includes(item.id) ? 'bg-accent/10 border-accent/40' : 'border-white/5 hover:border-white/20'}`}>
                                <Checkbox
                                    id={item.id}
                                    name={`item_${item.id}`}
                                    className="w-6 h-6 rounded-lg border-2 border-white/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                    onCheckedChange={(checked) => handleItemChange(item.id, !!checked)}
                                />
                                <label htmlFor={item.id} className={`text-sm font-bold cursor-pointer text-center ${selectedItems.includes(item.id) ? 'text-white' : 'text-white/40'}`}>
                                    {item.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 사후 관리 및 보증 섹션 */}
                <div className="space-y-8">
                    <SectionTitle icon={<ShieldCheck size={24} className="text-accent" />} title="유지보수 및 품질 보증" />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white/2 border border-white/5 rounded-[40px] space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={20} className="text-accent" />
                                <h4 className="font-bold text-white">보증 기간 설정</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-white/30 text-[10px] font-black uppercase tracking-widest">시공 하자 보증</Label>
                                    <div className="flex items-center gap-3">
                                        <Input name="warranty_years_construction" type="number" defaultValue="5" className="h-12 bg-white/5 border-white/10 rounded-xl font-bold" />
                                        <span className="text-white/40 font-bold">년</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/30 text-[10px] font-black uppercase tracking-widest">모듈 출력 보증</Label>
                                    <div className="flex items-center gap-3">
                                        <Input name="warranty_years_module" type="number" defaultValue="25" className="h-12 bg-white/5 border-white/10 rounded-xl font-bold" />
                                        <span className="text-white/40 font-bold">년</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText size={14} />
                                A/S 정책 및 관리 예시
                            </Label>
                            <Textarea
                                name="as_policy"
                                placeholder="예: 연 2회 무상 점검, 발전소 이상 감지 시 24시간 이내 현장 출동 등"
                                className="bg-white/5 border-white/10 rounded-3xl min-h-[160px] p-6 focus:ring-accent/50"
                            />
                        </div>
                    </div>
                </div>

                {/* 기타 안내 사항 */}
                <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
                    <div className="space-y-3">
                        <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">불포함 항목 (제외 공사)</Label>
                        <Textarea
                            name="exclusions"
                            placeholder="예: 인허가 면허세, 한전 계통 인입 비용, 농지전용부담금(별도) 등"
                            className="bg-white/5 border-white/10 rounded-3xl min-h-[120px] p-6"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">회사 특장점 및 추가 의견</Label>
                        <Textarea
                            name="comment"
                            placeholder="예: 10년 이상 시공 경력팀 상주, 고효율 N-Type 모듈 적용 등"
                            className="bg-white/5 border-white/10 rounded-3xl min-h-[120px] p-6"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-12">
                    <Button
                        type="submit"
                        disabled={isPending || selectedItems.length < 3}
                        className="w-full h-24 bg-accent hover:bg-orange-500 text-white text-2xl font-black rounded-[32px] shadow-2xl shadow-accent/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:grayscale"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-4">
                                <Hourglass className="animate-spin" size={32} />
                                <span>상세 견적서 발송 준비 중...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <BadgeDollarSign size={32} />
                                <span>최종 견적 발송 및 알림 전송</span>
                            </div>
                        )}
                    </Button>
                    <p className="text-center text-white/20 text-xs mt-6">
                        발송된 견적은 고객의 스마트폰으로 즉시 알림이 전송되며, 철회가 불가능하므로 신중히 작성해주세요.
                    </p>
                </div>

                {/* Modals */}
                <Dialog open={showLackModal} onOpenChange={setShowLackModal}>
                    <DialogContent className="bg-[#111] border-white/10 text-white rounded-[40px] max-w-md p-10">
                        <DialogHeader className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center text-red-500">
                                <Coins size={40} />
                            </div>
                            <DialogTitle className="text-2xl font-black">보유 크레딧이 부족합니다</DialogTitle>
                            <DialogDescription className="text-white/60 leading-relaxed">
                                견적 발송에는 1 크레딧이 필요합니다.<br />
                                크레딧을 충전하면 견적을 발송할 수 있습니다.<br />
                                <span className="block mt-4 text-xs italic text-white/40">(신규 가입 시 3크레딧이 무료로 제공됩니다)</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-10 sm:justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowLackModal(false)}
                                className="h-14 rounded-2xl border-white/10 hover:bg-white/5 font-bold"
                            >
                                닫기
                            </Button>
                            <Button
                                className="h-14 px-8 bg-accent hover:bg-orange-600 rounded-2xl font-black text-white"
                                onClick={() => window.location.href = 'mailto:qspar0325@naver.com?subject=[쨍하고] 크레딧 충전 문의'}
                            >
                                충전 대기/문의하기
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <DialogContent className="bg-[#111] border-white/10 text-white rounded-[40px] max-w-md p-10">
                        <DialogHeader className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-accent/10 rounded-[32px] flex items-center justify-center text-accent">
                                <BadgeDollarSign size={40} />
                            </div>
                            <DialogTitle className="text-2xl font-black">견적을 발송하시겠습니까?</DialogTitle>
                            <DialogDescription className="text-white/60 leading-relaxed">
                                견적 발송 시 <span className="text-white font-bold">1 크레딧</span>이 차감됩니다.<br />
                                발송된 견적은 고객에게 즉시 전달되며,<br />
                                이후에는 수정이나 취소가 불가능합니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 bg-white/5 rounded-3xl space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/40">보유 크레딧</span>
                                <span className="text-white font-bold">{creditBalance}개</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/40 text-red-400">차감 크레딧</span>
                                <span className="text-red-400 font-bold">-1개</span>
                            </div>
                        </div>
                        <DialogFooter className="mt-10 sm:justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmModal(false)}
                                className="h-14 rounded-2xl border-white/10 hover:bg-white/5 font-bold"
                            >
                                취소
                            </Button>
                            <Button
                                className="h-14 px-8 bg-accent hover:bg-orange-600 rounded-2xl font-black text-white shadow-xl shadow-accent/20"
                                onClick={confirmSubmit}
                            >
                                네, 발송하겠습니다
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </form>
        </>
    )
}

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode, title: string, sub?: string }) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
                <h3 className="text-xl font-black text-white">{title}</h3>
            </div>
            {sub && <span className="text-[10px] font-black bg-white/5 px-4 py-2 rounded-full text-white/40 uppercase tracking-widest">{sub}</span>}
        </div>
    );
}
