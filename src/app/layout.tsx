import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
// 👇 Import komponen Navbar yang baru dibuat
import Navbar from "@/components/Navbar"; 

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
    <html lang="id">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {/* 👇 Panggil Navbar di sini */}
        <Navbar />
        
        {children}
        
        {/* Kalau ada Footer, biarkan di bawah sini */}
      </body>
    </html>
  );
}