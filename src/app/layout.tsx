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
      <body className={`${inter.className} min-h-screen text-[#EAECEF]`}>
        {children}
      </body>
    </html>
  );
}
