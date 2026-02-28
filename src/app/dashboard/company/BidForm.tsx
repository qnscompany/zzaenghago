'use client'

import { useState, useActionState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
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
import { BadgeDollarSign, Calculator, Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { submitBid, type BidActionState } from './bidActions'

interface BidFormProps {
    isOpen: boolean
    onClose: () => void
    lead: any
}

const ITEMS = [
    { id: 'module', label: '모듈' },
    { id: 'inverter', label: '인버터' },
    { id: 'structure', label: '구조물' },
    { id: 'electric', label: '전기공사' },
    { id: 'civil', label: '토목공사' },
    { id: 'permits', label: '계통연계 대행' },
    { id: 'monitoring', label: '모니터링 시스템' },
]

export default function BidForm({ isOpen, onClose, lead }: BidFormProps) {
    const [state, formAction, isPending] = useActionState<BidActionState, FormData>(submitBid, null);
    const [capacity, setCapacity] = useState<string>(lead?.desired_capacity_kw?.toString() || '');
    const [totalAmount, setTotalAmount] = useState<string>('');
    const [unitPrice, setUnitPrice] = useState<number>(0);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        if (lead) {
            setCapacity(lead.desired_capacity_kw?.toString() || '');
        }
    }, [lead]);

    useEffect(() => {
        if (state?.success) {
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 2000);
        }
    }, [state, onClose]);

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f0f0f] border-white/10 text-white rounded-[32px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2 text-accent">
                        <BadgeDollarSign size={24} />
                        <DialogTitle className="text-2xl font-bold font-outfit">개략 견적서 작성</DialogTitle>
                    </div>
                    <DialogDescription className="text-white/40 text-xs leading-relaxed">
                        "본 견적은 현장 실사 전 개략 견적입니다. 부지 인허가 조건, 한전 연계 가능 용량, 지반 조건에 따라 실제 공사비는 달라질 수 있습니다. 고객님께서 업체를 선정한 후 현장실사 및 면담 결과에 따라 수정보완한 상세견적을 발송하게 됩니다."
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-8 py-4">
                    <input type="hidden" name="lead_id" value={lead?.id} />

                    {state?.success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400 animate-in zoom-in duration-300">
                            <CheckCircle2 size={18} />
                            <p className="text-sm font-bold">견적이 성공적으로 발송되었습니다!</p>
                        </div>
                    )}

                    {state?.error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-in zoom-in duration-300">
                            <AlertCircle size={18} />
                            <p className="text-sm font-bold">{state.error}</p>
                        </div>
                    )}

                    {/* 기본 정보 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">설치 예상 용량 (kW)</Label>
                            <Input
                                name="capacity_kw"
                                type="number"
                                step="0.1"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="bg-white/5 border-white/10 rounded-xl focus:ring-accent/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">사업 유형</Label>
                            <Select name="project_type" defaultValue={lead?.project_type || 'rooftop'} required>
                                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-white/10 text-white">
                                    <SelectItem value="rooftop">지붕형</SelectItem>
                                    <SelectItem value="ground">지상형</SelectItem>
                                    <SelectItem value="agri">영농형</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">총 공사비 (VAT 포함, 원)</Label>
                            <div className="relative">
                                <Input
                                    name="total_amount_display"
                                    type="text"
                                    value={totalAmount ? parseInt(totalAmount).toLocaleString() : ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setTotalAmount(val);
                                    }}
                                    placeholder="예: 50,000,000"
                                    className="bg-white/5 border-white/10 rounded-xl pr-20"
                                    required
                                />
                                <input type="hidden" name="total_amount" value={totalAmount} />
                                {unitPrice > 0 && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-accent font-bold">
                                        kW당 {Math.floor(unitPrice / 10000).toLocaleString()}만원
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">공사 기간</Label>
                                <Input name="construction_period" placeholder="예: 착공 후 45일" className="bg-white/5 border-white/10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">견적 유효기간</Label>
                                <Input name="valid_thru" type="date" className="bg-white/5 border-white/10 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* 포함 항목 */}
                    <div className="space-y-4">
                        <Label className="text-white/60 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                            포함 항목 (최소 3개 선택)
                            <span className={`text-[10px] ${selectedItems.length >= 3 ? 'text-green-400' : 'text-orange-400'}`}>
                                {selectedItems.length}개 선택됨
                            </span>
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {ITEMS.map((item) => (
                                <div key={item.id} className="flex items-center space-x-2 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                                    <Checkbox
                                        id={item.id}
                                        name={`item_${item.id}`}
                                        onCheckedChange={(checked) => handleItemChange(item.id, !!checked)}
                                    />
                                    <label htmlFor={item.id} className="text-xs font-medium cursor-pointer">{item.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 보증 조건 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">시공 하자 보증 (년)</Label>
                            <Input name="warranty_years_construction" type="number" defaultValue="5" className="bg-white/5 border-white/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">모듈 출력 보증 (년)</Label>
                            <Input name="warranty_years_module" type="number" defaultValue="25" className="bg-white/5 border-white/10 rounded-xl" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">A/S 정책</Label>
                            <Textarea
                                name="as_policy"
                                placeholder="연 2회 정기점검, 긴급출동 24시간 이내 등 보장 내용을 입력하세요."
                                className="bg-white/5 border-white/10 rounded-xl min-h-[80px]"
                            />
                        </div>
                    </div>

                    {/* 불포함 및 코멘트 */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">불포함 항목</Label>
                            <Textarea
                                name="exclusions"
                                placeholder="인허가비, 한전 계통연계 분담금, 농지전용부담금 등 제외되는 항목을 기재하세요."
                                className="bg-white/5 border-white/10 rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">업체 코멘트</Label>
                            <Textarea
                                name="comment"
                                placeholder="현장 확인 후 공사비 변동 가능성, 추가 상담 내용 등 자유롭게 기재하세요."
                                className="bg-white/5 border-white/10 rounded-xl min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-6">
                        <Button
                            type="submit"
                            disabled={isPending || selectedItems.length < 3}
                            className="w-full h-14 bg-accent hover:bg-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-accent/20"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <Hourglass className="animate-spin" size={18} />
                                    <span>제출 중...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <BadgeDollarSign size={20} />
                                    <span>견적 발송 확정</span>
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function Hourglass(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 22h14" />
            <path d="M5 2h14" />
            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
    )
}
