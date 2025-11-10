import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore: allow importing global CSS without type declarations
import "./globals.css";
// import { WalletProvider } from '@/contexts/WalletContext'
import ProviderLayout from "@/components/layouts/ProviderLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DipCert - Hệ thống Văn bằng Blockchain",
  description: "Xác minh và cấp phát văn bằng trên nền tảng Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} min-h-screen text-[#EAECEF] bg-gradient-to-b from-[#0f172a] to-[#1e293b]`}>
        {/* <WalletProvider> */}
          <ProviderLayout>
            {children}
          </ProviderLayout>
        {/* </WalletProvider> */}
      </body>
    </html>
  );
}
