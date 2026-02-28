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
    capacityKw = 0,
    totalAmount = 0,
    equityRatio = 30,
    interestRate = 3.5,
    sellingPrice = 189
}: ProfitabilityTableProps) {
    // Basic safety checks for inputs
    const safeCapacity = Math.max(0, capacityKw || 0);
    const safeTotalAmount = Math.max(0, totalAmount || 0);

    const annualGeneration = safeCapacity * 3.6 * 365;
    const annualRevenue = annualGeneration * sellingPrice;
    const annualOem = annualRevenue * 0.10; // 10% O&M

    const equityAmount = safeTotalAmount * (equityRatio / 100);
    const loanAmount = Math.max(0, safeTotalAmount - equityAmount);

    const annualDebtService = useMemo(() => {
        if (loanAmount <= 0) return 0;
        const r = (interestRate || 0) / 100;
        const n = 15; // 15 years
        if (r <= 0) return loanAmount / n;

        try {
            const powTerm = Math.pow(1 + r, n);
            const denominator = powTerm - 1;
            if (denominator === 0) return loanAmount / n;
            return loanAmount * (r * powTerm) / denominator;
        } catch (e) {
            return loanAmount / n;
        }
    }, [loanAmount, interestRate]);

    const yearlyData = useMemo(() => {
        const data = [];
        let cumulative = -equityAmount;

        for (let i = 1; i <= 20; i++) {
            const year = i;
            const revenue = annualRevenue;
            const oem = annualOem;
            const debt = year <= 15 ? annualDebtService : 0;
            const netFlow = revenue - oem - debt;
            cumulative += netFlow;

            data.push({
                year,
                revenue: isNaN(revenue) ? 0 : revenue,
                oem: isNaN(oem) ? 0 : oem,
                debt: isNaN(debt) ? 0 : debt,
                netFlow: isNaN(netFlow) ? 0 : netFlow,
                cumulative: isNaN(cumulative) ? 0 : cumulative
            });
        }
        return data;
    }, [equityAmount, annualRevenue, annualOem, annualDebtService]);

    const formatWon = (val: number) => {
        if (isNaN(val) || !isFinite(val)) return '0원';
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
