import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en">
      <body className={`${inter.className} min-h-screen text-[#EAECEF] bg-gradient-to-br from-[#1b1f24] via-[#202328] to-[#111315]`}>
        {children}
      </body>
    </html>
  );
}
