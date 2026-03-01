import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-10 px-6 sm:px-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* 상단 - 사업자 정보 */}
                <div className="text-xs sm:text-sm leading-relaxed border-b border-gray-800 pb-8">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                        <span>대표 박규섭</span>
                        <span className="hidden sm:inline text-gray-700">|</span>
                        <span>사업자등록번호 530-05-03411</span>
                        <span className="hidden sm:inline text-gray-700">|</span>
                        <span>통신판매중개업 2026-##</span>
                    </div>
                    <div className="mb-2">
                        주소 충청남도 당진시 무수동1길 11, 203호
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                        <span>Tel. 010-2018-1101</span>
                        <span className="hidden sm:inline text-gray-700">|</span>
                        <span>E-mail. qnscompany88@gmail.com</span>
                    </div>
                    <div>
                        통신판매업신고 2024-충남당진-0120
                    </div>
                </div>

                {/* 중단 - 링크 */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                    <Link
                        href="/terms"
                        className="underline underline-offset-4 hover:text-white transition-colors"
                    >
                        이용약관
                    </Link>
                    <Link
                        href="/privacy"
                        className="underline underline-offset-4 hover:text-white transition-colors"
                    >
                        개인정보 처리방침
                    </Link>
                    <a
                        href="https://www.energy.or.kr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors flex items-center gap-1"
                    >
                        한국에너지공단 바로가기
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" x2="21" y1="14" y2="3" />
                        </svg>
                    </a>
                </div>

                {/* 하단 - 카피라이트 */}
                <div className="text-xs pt-2">
                    © {new Date().getFullYear() > 2026 ? new Date().getFullYear() : 2026} 쨍하고 COMMERCIAL. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
