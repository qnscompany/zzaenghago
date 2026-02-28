import Link from "next/link";
import { Sun, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border border-accent/20">
            <Zap size={16} />
            <span>상업용 태양광 비즈니스의 새로운 기준</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-outfit tracking-tight leading-tight">
            똑똑한 발전소 시공,<br />
            <span className="text-accent">쨍하고</span>에서 시작하세요.
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-foreground/60 mb-10 leading-relaxed">
            검증된 시공사와의 투명한 견적 비교를 통해<br />
            태양광 사업자의 성공을 실현하는 가장 완벽한 플랫폼입니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/leads/new" className="w-full sm:w-auto px-8 py-4 bg-accent text-white rounded-xl font-bold text-lg hover:bg-solar-blue transition-all shadow-xl shadow-accent/30 flex items-center justify-center gap-2">
              견적 요청하기
              <ArrowRight size={20} />
            </Link>
            <Link href="/auth/signup" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
              시공업체 가입하기
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<ShieldCheck className="text-accent" size={32} />}
              title="검증된 파트너십"
              description="한국에너지공단에 정식 등록된 전문 시공사만을 엄선하여 연결합니다."
            />
            <FeatureCard
              icon={<Zap className="text-accent" size={32} />}
              title="실시간 견적 비교"
              description="등록한 부지 정보를 바탕으로 여러 업체의 표준 견적을 한눈에 비교하세요."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-background border border-white/5 hover:border-accent/30 transition-all group">
      <div className="mb-6 p-4 bg-accent/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 font-outfit">{title}</h3>
      <p className="text-foreground/60 leading-relaxed">{description}</p>
    </div>
  );
}
