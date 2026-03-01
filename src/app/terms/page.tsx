export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen py-16 px-6 sm:px-10">
            <div className="max-w-3xl mx-auto">
                <header className="mb-12 border-b pb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">이용약관</h1>
                    <p className="text-gray-500">시행일: 2026년 [  ]월 [  ]일</p>
                </header>

                <div className="space-y-10 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
                        <p>
                            본 약관은 박규섭(이하 "회사")이 운영하는 쨍하고 COMMERCIAL
                            플랫폼(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의
                            권리·의무를 규정함을 목적으로 합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (서비스의 성격 및 책임 한계)</h2>
                        <div className="space-y-2">
                            <p>① 회사는 태양광 발전소 건설을 희망하는 사업자와 시공업체 간의 견적 비교·매칭을 중개하는 통신판매중개업자입니다.</p>
                            <p>② 회사는 사업자와 시공업체 간 시공 계약의 당사자가 아니며, 계약 이행, 시공 품질, 하자, 인허가 결과에 대해 책임을 지지 않습니다.</p>
                            <p>③ 플랫폼 내 수익분석표 및 발전량 시뮬레이션은 참고용이며, 실제 수익을 보장하지 않습니다.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (시공업체 등록 조건)</h2>
                        <div className="space-y-2">
                            <p>① 시공업체로 등록하려면 다음 자격을 모두 갖추어야 합니다.</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>전기공사업법에 따른 전기공사업 등록</li>
                                <li>유효한 사업자등록</li>
                            </ul>
                            <p>② 허위 자격으로 등록한 사실이 확인될 경우, 회사는 즉시 계정을 정지하고 관련 기관에 신고할 수 있습니다.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (크레딧 정책)</h2>
                        <div className="space-y-2">
                            <p>① 시공업체는 견적 발송 시 크레딧 1개가 차감됩니다.</p>
                            <p>② 신규 가입 시 무료 크레딧 3개가 지급됩니다.</p>
                            <p>③ 구매한 크레딧은 환불되지 않습니다. 단, 회사 귀책 사유로 서비스 이용이 불가한 경우 예외로 합니다.</p>
                            <p>④ 발송된 견적에 대한 크레딧은 고객의 업체 선택 여부와 관계없이 반환되지 않습니다.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (부지 등록 및 견적 수신)</h2>
                        <div className="space-y-2">
                            <p>① 사업자는 부지 1개당 최대 5개의 견적을 수신할 수 있습니다.</p>
                            <p>② 5번째 견적 수신일로부터 1년이 경과하거나, 시공업체 선택 후 1년이 경과하면 동일 부지에 대한 재견적 요청이 가능합니다.</p>
                            <p>③ 사업자는 실제 발전사업을 검토 중인 경우에만 부지를 등록해야 하며, 허위·불성실한 등록은 이용 제한의 사유가 됩니다.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (개인정보 제공 동의)</h2>
                        <div className="space-y-2">
                            <p>① 사업자가 플랫폼에서 시공업체를 최종 선택하는 시점에, 선택된 업체에 한해 사업자의 연락처가 공개됩니다.</p>
                            <p>② 이 제공에 동의하지 않으면 업체 선택을 진행할 수 없습니다.</p>
                            <p>③ 선택받지 못한 업체에게는 사업자 정보가 일절 공개되지 않습니다.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (금지 행위)</h2>
                        <p className="mb-2">다음 행위는 금지되며, 위반 시 서비스 이용이 즉시 정지됩니다.</p>
                        <ul className="list-decimal list-inside ml-4 space-y-1">
                            <li>허위 부지 정보 등록 또는 타인 명의 도용</li>
                            <li>미끼 견적 발송 (고의적 저가 제시 후 현장에서 과도한 증액)</li>
                            <li>플랫폼 외부에서의 직접 거래 유도 (크레딧 회피 목적)</li>
                            <li>타인의 개인정보를 수집·유출하는 행위</li>
                            <li>복수 계정 생성을 통한 크레딧 부정 수취</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (분쟁 처리)</h2>
                        <div className="space-y-2">
                            <p>① 이용자 간 분쟁 발생 시 회사는 중재 역할을 할 수 있으나, 법적 책임을 부담하지는 않습니다.</p>
                            <p>② 분쟁 신고 접수 시, 회사는 관련 거래 정보를 확인할 수 있습니다.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">제9조 (준공 확인)</h2>
                        <div className="space-y-2">
                            <p>① 시공 완료 후 회사는 서비스 개선을 위해 준공 여부를 사업자에게 확인할 수 있습니다.</p>
                            <p>② 수집된 정보는 서비스 통계 및 신뢰도 지표로만 활용됩니다.</p>
                        </div>
                    </section>

                    <div className="pt-12 border-t text-sm text-gray-500 text-center">
                        시행일: 2026년 [  ]월 [  ]일
                    </div>
                </div>
            </div>
        </div>
    );
}
