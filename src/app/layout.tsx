import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

// 👇 Import komponen Navbar
import Navbar from "@/components/Navbar"; 
// 👇 Import komponen ChatWidget yang baru kita buat
import ChatWidget from "@/components/ChatWidget"; 

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "KAMBI | Susu Kambing Premium",
  description: "Nutrisi kebaikan murni untuk keluarga Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`} suppressHydrationWarning>
        {/* 👇 Panggil Navbar di sini */}
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        
        {children}
        
        {/* Kalau ada Footer, biarkan di bawah sini */}
        
        {/* 👇 Panggil ChatWidget di sini agar mengambang di semua halaman */}
        <ChatWidget />
      </body>
    </html>
  );
}