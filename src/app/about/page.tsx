import { Sun, CheckCircle2, ArrowRight, Wallet, Users, BarChart3, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-24 pb-20 bg-background overflow-hidden">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24">
                <h1 className="text-4xl md:text-6xl font-bold font-outfit mb-6">
                    복잡한 태양광 비즈니스,<br />
                    <span className="text-accent italic">쨍하고</span> 해 뜰 날이 올 거예요.
                </h1>
                <p className="text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed">
                    "쨍하고"는 태양광 발전소 설립을 꿈꾸는 사업주님과<br />
                    실력 있는 시공사를 가장 투명하고 빠르게 연결하는 스마트 매칭 서비스입니다.
                </p>
            </section>

            {/* Business Flow */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold font-outfit mb-4">서비스 이용 흐름</h2>
                    <p className="text-foreground/60">단 4단계면 견적 비교부터 시공사 선정까지 끝납니다.</p>
                </div>

                <div className="relative group">
                    {/* Flow Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-accent/20 -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FlowStep
                            number="01"
                            icon={<Sun className="text-accent" />}
                            title="부지 정보 등록"
                            description="발전소를 지으려는 부지의 위치와 규모를 등록해 주세요."
                        />
                        <FlowStep
                            number="02"
                            icon={<Users className="text-accent" />}
                            title="시공사 견적 발송"
                            description="검증된 전문 업체들이 부지 정보를 확인하고 견적을 제안합니다."
                        />
                        <FlowStep
                            number="03"
                            icon={<BarChart3 className="text-accent" />}
                            title="비교 및 상담"
                            description="업체별 가격과 AS 정책을 한눈에 비교하고 직접 상담하세요."
                        />
                        <FlowStep
                            number="04"
                            icon={<CheckCircle2 className="text-accent" />}
                            title="파트너 선정"
                            description="가장 믿음직한 시공사를 선정하여 발전소 사업을 시작하세요."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Model */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="bg-solar-dark border border-white/10 rounded-[40px] p-8 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                                <Wallet size={16} />
                                <span>합리적인 과금 모델</span>
                            </div>
                            <h2 className="text-4xl font-bold font-outfit mb-6 leading-tight">
                                사업주님은 <span className="text-accent">100% 무료</span>,<br />
                                시공사님은 <span className="text-accent">성공 시에만</span> 지불하세요.
                            </h2>
                            <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
                                쨍하고는 투명한 시장 형성을 위해 과도한 광고비를 요구하지 않습니다.<br />
                                누구나 부담 없이 최고의 파트너를 만날 수 있는 환경을 만듭니다.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <PricingCard
                                title="일반 사용자 (사업주)"
                                price="무료 (Free)"
                                features={["견적 요청 무제한", "1:1 상담 서비스", "시공사 정보 열람"]}
                            />
                            <PricingCard
                                title="프리미엄 파트너 (시공사)"
                                price="월 구독료 + 성공 보수"
                                features={["실시간 리드 알림", "표준 견적 발송 권한", "업체 포트폴리오 노출"]}
                                highlight
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 border-t border-white/5">
                <h2 className="text-3xl font-bold font-outfit mb-12">왜 '쨍하고'인가요?</h2>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <h4 className="text-xl font-bold text-accent">투명함</h4>
                        <p className="text-foreground/60">모든 견적은 표준화된 서식으로 제공되어 누구나 쉽게 비교할 수 있습니다.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xl font-bold text-accent">전문성</h4>
                        <p className="text-foreground/60">에너지공단에 등록된 정식 자격 업체만 파트너로 활동할 수 있습니다.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xl font-bold text-accent">신속함</h4>
                        <p className="text-foreground/60">등록 후 최대 48시간 이내에 3개 이상의 견적을 받아보실 수 있습니다.</p>
                    </div>
                </div>

                <div className="mt-20">
                    <Link href="/auth/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-accent text-white rounded-2xl font-bold text-xl hover:bg-solar-blue transition-all shadow-2xl shadow-accent/40">
                        지금 바로 시작하기
                        <ArrowRight size={24} />
                    </Link>
                </div>
            </section>
        </main>
    );
}

function FlowStep({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="relative p-8 rounded-3xl bg-background border border-white/5 hover:border-accent/30 transition-all z-10 bg-background/50 backdrop-blur-sm">
            <div className="text-4xl font-bold text-accent/10 font-outfit absolute top-4 right-6">{number}</div>
            <div className="mb-6 p-4 bg-accent/5 rounded-2xl w-fit">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function PricingCard({ title, price, features, highlight = false }: { title: string, price: string, features: string[], highlight?: boolean }) {
    return (
        <div className={`p-8 rounded-3xl border ${highlight ? 'border-accent bg-accent/5' : 'border-white/10 bg-white/2'}`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h4 className="font-bold text-lg mb-1">{title}</h4>
                    <p className="text-2xl font-bold text-accent font-outfit">{price}</p>
                </div>
                {highlight && <ShieldCheck className="text-accent" />}
            </div>
            <ul className="space-y-3">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground/60">
                        <CheckCircle2 size={14} className="text-accent" />
                        {f}
                    </li>
                ))}
            </ul>
        </div>
    );
}
