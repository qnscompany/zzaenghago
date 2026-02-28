'use client'

import { useMemo } from 'react'

interface ProfitabilityTableProps {
    capacityKw: number
    totalAmount: number
    equityRatio?: number // %
    interestRate?: number // %
    sellingPrice?: number // Won/kWh
}

export default function ProfitabilityTable({
    capacityKw,
    totalAmount,
    equityRatio = 30,
    interestRate = 3.5,
    sellingPrice = 189
}: ProfitabilityTableProps) {
    const annualGeneration = capacityKw * 3.6 * 365
    const annualRevenue = annualGeneration * sellingPrice
    const annualOem = annualRevenue * 0.10 // 10% O&M

    const equityAmount = totalAmount * (equityRatio / 100)
    const loanAmount = totalAmount - equityAmount

    const annualDebtService = useMemo(() => {
        if (loanAmount <= 0) return 0;
        const r = interestRate / 100;
        const n = 15; // 15 years
        return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }, [loanAmount, interestRate]);

    const yearlyData = useMemo(() => {
        let cumulative = -equityAmount;
        return Array.from({ length: 20 }, (_, i) => {
            const year = i + 1;
            const revenue = annualRevenue;
            const oem = annualOem;
            const debt = year <= 15 ? annualDebtService : 0;
            const netFlow = revenue - oem - debt;
            cumulative += netFlow;
            return { year, revenue, oem, debt, netFlow, cumulative };
        });
    }, [equityAmount, annualRevenue, annualOem, annualDebtService]);

    const formatWon = (val: number) => {
        return Math.floor(val / 10000).toLocaleString() + '만원';
    };

    return (
        <div className="overflow-x-auto rounded-[32px] border border-white/10 bg-white/2">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <tr>
                        <th className="px-6 py-4">연차</th>
                        <th className="px-6 py-4">예상 매출</th>
                        <th className="px-6 py-4">운영비 (O&M)</th>
                        <th className="px-6 py-4">금융 상환액</th>
                        <th className="px-6 py-4 text-accent">연간 순수익</th>
                        <th className="px-6 py-4">누적 수익</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {yearlyData.map((data) => (
                        <tr key={data.year} className="hover:bg-white/2 transition-colors">
                            <td className="px-6 py-4 font-bold text-white/60">{data.year}년차</td>
                            <td className="px-6 py-4 text-white/80">{formatWon(data.revenue)}</td>
                            <td className="px-6 py-4 text-white/40">{formatWon(data.oem)}</td>
                            <td className="px-6 py-4 text-white/40">{formatWon(data.debt)}</td>
                            <td className="px-6 py-4 font-bold text-accent">{formatWon(data.netFlow)}</td>
                            <td className={`px-6 py-4 font-bold ${data.cumulative >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                                {formatWon(data.cumulative)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
