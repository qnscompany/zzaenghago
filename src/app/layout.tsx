import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "쨍하고 | 태양광 발전소 견적 비교 플랫폼",
  description: "사업자와 시공사를 잇는 가장 확실한 태양광 비즈니스 파트너",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { getAdminStatus } from "@/utils/auth";
import { getUnreadInquiryCount } from "@/app/dashboard/inquiries/actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { role } = await getAdminStatus();

  // 알림 개수 가져오기 (오류 시 0으로 처리하여 전체 장애 방지)
  let unreadCount = 0;
  try {
    if (user) {
      unreadCount = await getUnreadInquiryCount();
    }
  } catch (error) {
    console.error('Error fetching unread count:', error);
  }

  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || headersList.get("referer") || "";
  const isAdminPath = pathname.includes("/admin");

  return (
    <html lang="ko" className={`${outfit.variable}`}>
      <body className="antialiased font-sans">
        {!isAdminPath && <Navbar initialUser={user} initialRole={role} initialUnreadCount={unreadCount} />}
        {children}
        {!isAdminPath && <Footer />}
      </body>
    </html>
  );
}
