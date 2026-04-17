import "./globals.css";
import { ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "KAMBI Premium | Susu Kambing Etawa",
  description: "Susu Kambing Etawa Premium untuk Kesehatan Keluarga",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${dmSans.variable} ${playfair.variable} antialiased selection:bg-[#D4A373] selection:text-white flex flex-col min-h-screen`}>
        
        {/* NAVBAR CENTERED */}
        <nav className="bg-[#FDFCF8]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#EAE6D9]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 relative">
              
              {/* Kiri: Logo KAMBI */}
              <Link href="/" className="flex items-center gap-3 group">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🐐</span>
                <span className="text-2xl font-bold tracking-tight text-[#2C352D] font-playfair">
                  KAMBI<span className="text-[#D4A373]">.</span>
                </span>
              </Link>

              {/* Tengah: Navigasi (Absolute center untuk presisi) */}
              <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                <Link href="/" className="text-[15px] font-medium text-[#2C352D] hover:text-[#D4A373] transition-colors">
                  Beranda
                </Link>
                <Link href="/shop" className="text-[15px] font-medium text-[#5A665A] hover:text-[#D4A373] transition-colors">
                  Belanja
                </Link>
                <Link href="/#affiliate" className="text-[15px] font-medium text-[#5A665A] hover:text-[#D4A373] transition-colors">
                  Affiliate
                </Link>
              </div>

             {/* Kanan: Icons */}
              <div className="flex items-center gap-6">
                <Link href="/cart" className="relative p-2 text-[#2C352D] hover:text-[#D4A373] transition-colors">
                  <ShoppingCart size={24} strokeWidth={1.5} />
                  <span className="absolute top-0 right-0 bg-[#D4A373] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    0
                  </span>
                </Link>
                <div className="h-4 w-px bg-[#EAE6D9] hidden md:block"></div>
                
                {/* FIX: Ubah href="/checkout" jadi href="/login" di sini 👇 */}
                <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#2C352D] hover:text-[#D4A373] transition-colors">
                  <User size={24} strokeWidth={1.5} />
                </Link>
              </div>

            </div>
          </div>
        </nav>

        {/* ISI KONTEN */}
        <main className="flex-grow">
          {children}
        </main>

        {/* FOOTER PREMIUM */}
        <footer className="bg-[#F3EFE4]/60 border-t border-[#EAE6D9] pt-20 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
               
               {/* Col 1: Brand Info */}
               <div className="md:col-span-1">
                 <Link href="/" className="flex items-center gap-3 mb-6">
                   <span className="text-2xl">🐐</span>
                   <span className="text-xl font-bold text-[#2C352D] font-playfair">Susu Kambing <br/>Premium</span>
                 </Link>
                 <p className="text-[#5A665A] font-light leading-relaxed">
                   Kesehatan alami untuk keluarga Anda dengan susu kambing premium berkualitas tinggi.
                 </p>
               </div>

               {/* Col 2: Navigasi */}
               <div>
                  <h4 className="font-playfair font-bold text-[#2C352D] mb-6 text-lg">Navigasi</h4>
                  <ul className="space-y-4 text-[#5A665A] font-light">
                     <li><Link href="/" className="hover:text-[#D4A373] transition-colors">Beranda</Link></li>
                     <li><Link href="/shop" className="hover:text-[#D4A373] transition-colors">Belanja</Link></li>
                     <li><Link href="/#affiliate" className="hover:text-[#D4A373] transition-colors">Affiliate</Link></li>
                  </ul>
               </div>

               {/* Col 3: Layanan Pelanggan */}
               <div>
                  <h4 className="font-playfair font-bold text-[#2C352D] mb-6 text-lg">Layanan Pelanggan</h4>
                  <ul className="space-y-4 text-[#5A665A] font-light">
                     <li>Email:<br/><a href="mailto:info@susukambing.com" className="hover:text-[#D4A373] transition-colors">info@susukambing.com</a></li>
                     <li>Telepon:<br/>+62 123 456 789</li>
                     <li>Jam Operasional:<br/>08:00 - 17:00 WIB</li>
                  </ul>
               </div>

               {/* Col 4: Sosial Media */}
               <div>
                  <h4 className="font-playfair font-bold text-[#2C352D] mb-6 text-lg">Ikuti Kami</h4>
                  <ul className="space-y-4 text-[#5A665A] font-light">
                     <li><a href="#" className="hover:text-[#D4A373] transition-colors">Instagram</a></li>
                     <li><a href="#" className="hover:text-[#D4A373] transition-colors">Facebook</a></li>
                     <li><a href="#" className="hover:text-[#D4A373] transition-colors">TikTok</a></li>
                  </ul>
               </div>

            </div>

            {/* Copyright Row */}
            <div className="border-t border-[#EAE6D9] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#5A665A] font-light">
               <p>© 2024 Susu Kambing Premium KAMBI. Semua hak dilindungi.</p>
               <div className="flex gap-6">
                  <a href="#" className="hover:text-[#D4A373] transition-colors">Kebijakan Privasi</a>
                  <a href="#" className="hover:text-[#D4A373] transition-colors">Syarat & Ketentuan</a>
               </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}