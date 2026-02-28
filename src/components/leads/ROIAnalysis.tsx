'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { BadgeDollarSign, TrendingUp, Wallet, Clock, Info, ShieldAlert } from 'lucide-react'

interface ROIAnalysisProps {
    capacityKw: number
    totalAmount: number
}

export default function ROIAnalysis({ capacityKw, totalAmount }: ROIAnalysisProps) {
    // Sliders state
    const [equityRatio, setEquityRatio] = useState(30) // %
    const [interestRate, setInterestRate] = useState(3.5) // %
    const [sellingPrice, setSellingPrice] = useState(189) // Won/kWh

    // Calculations
    const annualGeneration = capacityKw * 3.6 * 365
    const annualRevenue = annualGeneration * sellingPrice
    const annualOem = annualRevenue * 0.10 // 10% O&M

    const equityAmount = totalAmount * (equityRatio / 100)
    const loanAmount = totalAmount - equityAmount

    // PMT Calculation: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const annualDebtService = useMemo(() => {
        if (loanAmount === 0) return 0;
        const r = interestRate / 100 / 1; // Annual rate
        const n = 15; // 15 years
        if (r === 0) return loanAmount / n;
        return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }, [loanAmount, interestRate]);

    const annualNetIncome = annualRevenue - annualOem - annualDebtService
    const returnOnInvestment = (annualNetIncome / equityAmount) * 100
    const paybackYears = equityAmount / annualNetIncome
    const twentyYearProfit = annualNetIncome * 20 - loanAmount // Simplified: income over 20yr minus initial loan principle (if we consider it as cost)
    // Actually cumulative profit = (AnnualNetIncome * 20) is closer, but 15yr loan.
    // Let's do better: 
    // Y1-15: Revenue - OEM - DebtService
    // Y16-20: Revenue - OEM
    const cumulativeProfit20Yr = (annualRevenue - annualOem - annualDebtService) * 15 + (annualRevenue - annualOem) * 5

    // Data for 20 years
    const yearlyData = useMemo(() => {
        let cumulative = -equityAmount;
        return Array.from({ length: 20 }, (_, i) => {
            const year = i + 1;
            const flow = year <= 15 ? (annualRevenue - annualOem - annualDebtService) : (annualRevenue - annualOem);
            cumulative += flow;
            return { year, cumulative, isCovered: cumulative >= 0 };
        });
    }, [equityAmount, annualRevenue, annualOem, annualDebtService]);

    const formatWon = (val: number) => {
        if (val >= 100000000) return `${(val / 100000000).toFixed(1)}억원`;
        return `${(val / 10000).toLocaleString()}만원`;
    };

    return (
        <div className="space-y-12 py-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-xl text-accent">
                    <TrendingUp size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">수익성 정밀 분석 (ROI)</h2>
            </div>

            {/* Sliders Area */}
            <div className="grid lg:grid-cols-3 gap-8 p-8 bg-white/2 border border-white/5 rounded-[40px]">
                <SliderControl
                    label="자기자본 비율"
                    value={equityRatio}
                    onChange={(v: number[]) => setEquityRatio(v[0])}
                    min={20} max={100} step={10}
                    unit="%"
                />
                <SliderControl
                    label="융자 금리"
                    value={interestRate}
                    onChange={(v: number[]) => setInterestRate(v[0])}
                    min={2.0} max={6.0} step={0.5}
                    unit="%"
                />
                <SliderControl
                    label="판매단가 (SMP+REC)"
                    value={sellingPrice}
                    onChange={(v: number[]) => setSellingPrice(v[0])}
                    min={160} max={220} step={5}
                    unit="원"
                />
            </div>

            {/* Results Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ResultCard
                    icon={<Wallet className="text-blue-400" />}
                    label="투자/융자금"
                    value={`${formatWon(equityAmount)} / ${formatWon(loanAmount)}`}
                    sub="자기자본 vs 융자"
                />
                <ResultCard
                    icon={<BadgeDollarSign className="text-accent" />}
                    label="연간 순수익"
                    value={formatWon(annualNetIncome)}
                    sub={`수익률 ${returnOnInvestment.toFixed(1)}%`}
                    highlight
                />
                <ResultCard
                    icon={<Clock className="text-orange-400" />}
                    label="투자 회수 기간"
                    value={`${paybackYears.toFixed(1)}년`}
                    sub="원금 전액 회수 시점"
                />
                <ResultCard
                    icon={<TrendingUp className="text-green-400" />}
                    label="20년 누적 순수익"
                    value={formatWon(cumulativeProfit20Yr)}
                    sub="융자 상환 완료 포함"
                />
            </div>

            {/* Bar Chart Visualization */}
            <div className="p-8 bg-white/2 border border-white/5 rounded-[40px] space-y-8">
                <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-3 bg-accent rounded-full" />
                    20년 누적 자본 흐름 시뮬레이션
                </h4>

                <div className="flex items-end justify-between h-64 gap-1.5 md:gap-3">
                    {yearlyData.map((data) => {
                        // Normalize height: find max cumulative to scale
                        const maxVal = Math.max(...yearlyData.map(d => d.cumulative));
                        const minVal = Math.min(...yearlyData.map(d => d.cumulative));
                        const range = maxVal - minVal;
                        const height = ((data.cumulative - minVal) / range) * 100;

                        return (
                            <div key={data.year} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                <div
                                    className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-100 opacity-70 cursor-pointer
                                        ${data.isCovered ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-orange-500 shadow-lg shadow-orange-500/20'}`}
                                    style={{ height: `${Math.max(5, height)}%` }}
                                >
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#222] text-[10px] font-bold text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-white/10">
                                        {formatWon(data.cumulative)}
                                    </div>
                                </div>
                                <span className={`text-[9px] mt-3 font-bold ${data.year % 5 === 0 ? 'text-white/60' : 'text-white/20'}`}>
                                    {data.year}년
                                </span>
                            </div>
                        )
                    })}
                </div>
                <div className="flex gap-6 justify-end items-center text-[10px] font-bold">
                    <div className="flex items-center gap-2 text-white/30">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" /> 원금 회수 전
                    </div>
                    <div className="flex items-center gap-2 text-white/30">
                        <div className="w-2 h-2 bg-green-500 rounded-full" /> 수익 구간
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-orange-500/5 rounded-[32px] border border-orange-500/10">
                <ShieldAlert size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-white/40 leading-relaxed">
                    "본 분석표는 참고용 시뮬레이션입니다. 실제 수익은 일조량, REC 가격 변동, 계통연계 조건에 따라 달라질 수 있으며, 투자 결정 전 반드시 전문가와 상담하세요."
                </p>
            </div>
        </div>
    )
}

function SliderControl({ label, value, onChange, min, max, step, unit }: any) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-black text-accent">{value}{unit}</span>
            </div>
            <Slider
                value={[value]}
                onValueChange={onChange}
                min={min}
                max={max}
                step={step}
                className="py-4 cursor-pointer"
            />
        </div>
    )
}

function ResultCard({ icon, label, value, sub, highlight }: any) {
    return (
        <Card className={`overflow-hidden border-white/10 rounded-[32px] ${highlight ? 'bg-accent/5 ring-1 ring-accent/20' : 'bg-white/2'}`}>
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{label}</span>
                </div>
                <div className="space-y-1">
                    <p className="text-xl font-black text-white">{value}</p>
                    <p className="text-[11px] font-bold text-white/40">{sub}</p>
                </div>
            </CardContent>
        </Card>
    )
}
