export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen py-16 px-6 sm:px-10">
            <div className="max-w-3xl mx-auto">
                <header className="mb-12 border-b pb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">개인정보 처리방침</h1>
                    <p className="text-gray-500">시행일: 2026년 [  ]월 [  ]일</p>
                </header>

                <div className="space-y-10 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 수집하는 개인정보 항목</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium text-gray-900">[사업자]</p>
                                <p>필수: 이메일, 비밀번호, 연락처</p>
                                <p>서비스 이용 시: 부지 주소, 면적, 예상 용량</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">[시공업체]</p>
                                <p>필수: 이메일, 비밀번호, 상호명, 사업자등록번호, 전기공사업 등록번호, 대표자명, 연락처, 소재지</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 개인정보 수집 및 이용 목적</h2>
                        <ul className="list-none space-y-2">
                            <li>① 회원 식별 및 서비스 제공</li>
                            <li>② 견적 요청·발송 서비스 운영</li>
                            <li>③ 분쟁 처리 및 부정 이용 방지</li>
                            <li>④ 서비스 개선을 위한 통계 분석</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 개인정보 보유 및 이용 기간</h2>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>회원 탈퇴 시까지 보유</li>
                            <li>전자상거래법에 따라 계약·거래 기록은 5년간 보존</li>
                            <li>부정 이용 기록은 1년간 보존</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 개인정보 제3자 제공</h2>
                        <p className="mb-4">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 다음 경우는 예외입니다.</p>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <p className="font-medium text-gray-900">① 사업자가 시공업체를 최종 선택한 경우</p>
                            <ul className="list-none ml-4 space-y-1 text-sm">
                                <li><span className="font-medium">- 제공받는 자:</span> 선택된 시공업체</li>
                                <li><span className="font-medium">- 제공 항목:</span> 연락처(전화번호)</li>
                                <li><span className="font-medium">- 제공 목적:</span> 시공 상담 및 계약 진행</li>
                                <li><span className="font-medium">- 보유 기간:</span> 계약 종료 후 1년</li>
                            </ul>
                            <p className="font-medium text-gray-900">② 법령에 따른 수사기관·법원의 적법한 요청</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 개인정보 처리의 위탁</h2>
                        <ul className="list-disc list-inside ml-4">
                            <li>Supabase Inc. (데이터베이스 저장·관리)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 이용자의 권리</h2>
                        <p>
                            이용자는 언제든지 열람·정정·삭제·처리 정지·동의 철회를 요청할 수 있습니다.
                            요청은 <a href="mailto:qnscompany88@gmail.com" className="text-blue-600 hover:underline">qnscompany88@gmail.com</a>으로 연락주세요.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. 개인정보 보호책임자</h2>
                        <div className="space-y-1">
                            <p>성명: 박규섭</p>
                            <p>연락처: <a href="mailto:qnscompany88@gmail.com" className="text-blue-600 hover:underline">qnscompany88@gmail.com</a></p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">8. 운영자 예외 열람 정책</h2>
                        <p>
                            운영자는 원칙적으로 견적 금액과 고객 연락처를 열람할 수 없습니다.
                            단, 분쟁 신고 접수, 불법 행위 의심, 법령 제출 의무 발생 시
                            감사 로그를 기록하고 예외적으로 열람할 수 있습니다.
                        </p>
                    </section>

                    <div className="pt-12 border-t text-sm text-gray-500 text-center">
                        시행일: 2026년 [  ]월 [  ]일
                    </div>
                </div>
            </div>
        </div>
    );
}
