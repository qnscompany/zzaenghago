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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isAdminPath = pathname.startsWith("/admin");

  return (
    <html lang="ko" className={`${outfit.variable}`}>
      <body className="antialiased font-sans">
        {!isAdminPath && <Navbar initialUser={user} />}
        {children}
        {!isAdminPath && <Footer />}
      </body>
    </html>
  );
}
