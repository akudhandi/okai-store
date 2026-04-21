"use client";

import { useState, useEffect} from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, CheckCircle2, Megaphone, Wallet, Link as LinkIcon, AtSign, Send, Phone, Lock } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function RegisterAffiliate() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  // 👇 TAMBAHKAN STATE EMAIL
  const [userEmail, setUserEmail] = useState("Memuat email...");

  // 👇 TAMBAHKAN KODINGAN PENGECEK TOKEN & USER
  useEffect(() => {
    const token = localStorage.getItem("kambi_token");
    const userStr = localStorage.getItem("kambi_user");
    
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const userObj = JSON.parse(userStr);
        setUserEmail(userObj.email); // Isi email otomatis dari database!
      } catch (e) {
        console.error("Gagal membaca data user");
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic POST ke Backend:
    // 1. Data dikirim ke tabel 'affiliate_requests' (Status: Pending)
    // 2. Admin/Super Admin akan review. Kalau di-Approve, role user berubah jadi 'affiliate'.
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FDFCF8] px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center max-w-lg bg-white p-12 rounded-[3rem] border border-[#EAE6D9] shadow-xl">
          <div className="w-24 h-24 bg-[#D4A373] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-semibold text-[#2C352D] font-playfair mb-4">Pengajuan Terkirim!</h2>
          <p className="text-[#5A665A] mb-8 font-light leading-relaxed">
            Terima kasih telah mendaftar. <strong className="text-[#2C352D]">Tim Admin kami akan meninjau kelayakan profil Anda.</strong> 
            <br/><br/>
            Jika disetujui, kami akan menghubungi Anda via WhatsApp dan Anda bisa langsung mengakses Dashboard Affiliate.
          </p>
          <Link href="/shop" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3A5034] text-white rounded-full font-bold tracking-wide shadow-lg hover:bg-[#2C352D] transition-all">
            Kembali Belanja
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* KOLOM KIRI: Edukasi & Benefit (Tetap Terlihat agar user tertarik) */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
            <motion.div variants={fadeUp}>
              <span className="px-4 py-2 bg-[#D4A373]/20 text-[#D4A373] rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block border border-[#D4A373]/30">
                Upgrade Akun Anda
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#2C352D] font-playfair tracking-tight mb-6 leading-tight">
                Jadilah Bagian dari <br/><span className="text-[#D4A373] italic">Keluarga KAMBI.</span>
              </h1>
              <p className="text-lg text-[#5A665A] font-light leading-relaxed">
                Ubah peran Anda dari sekadar pelanggan menjadi mitra bisnis kami. Bagikan kebaikan susu etawa premium dan nikmati penghasilan tambahan tanpa batas.
              </p>
            </motion.div>

            <motion.div variants={staggerContainer} className="space-y-6 pt-4 border-t border-[#EAE6D9]">
              <motion.div variants={fadeUp} className="flex gap-4">
                <div className="w-12 h-12 bg-white border border-[#EAE6D9] rounded-2xl flex items-center justify-center text-[#D4A373] shrink-0 shadow-sm"><Wallet size={24}/></div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2C352D] font-playfair mb-1">Komisi Tinggi</h3>
                  <p className="text-[#5A665A] font-light text-sm">Dapatkan komisi hingga 20% dari setiap transaksi yang berasal dari link referal Anda.</p>
                </div>
              </motion.div>
              <motion.div variants={fadeUp} className="flex gap-4">
                <div className="w-12 h-12 bg-white border border-[#EAE6D9] rounded-2xl flex items-center justify-center text-[#D4A373] shrink-0 shadow-sm"><LinkIcon size={24}/></div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2C352D] font-playfair mb-1">Sistem Otomatis</h3>
                  <p className="text-[#5A665A] font-light text-sm">Cukup sebar link spesifik Anda, sistem kami akan merekam komisi secara otomatis saat ada pesanan sukses.</p>
                </div>
              </motion.div>
              <motion.div variants={fadeUp} className="flex gap-4">
                <div className="w-12 h-12 bg-white border border-[#EAE6D9] rounded-2xl flex items-center justify-center text-[#D4A373] shrink-0 shadow-sm"><Megaphone size={24}/></div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2C352D] font-playfair mb-1">Edukasi & Materi</h3>
                  <p className="text-[#5A665A] font-light text-sm">Admin kami akan membimbing Anda. Akses foto, video, dan copywriting premium siap posting.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* KOLOM KANAN: Form Pengajuan ATAU Gembok Login */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            
            {!isLoggedIn ? (
              // TAMPILAN JIKA BELUM LOGIN (TERGEMBOK)
              <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-[#EAE6D9] shadow-xl text-center flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-20 h-20 bg-[#F3EFE4] text-[#D4A373] rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Lock size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-[#2C352D] font-playfair mb-4">Login Diperlukan</h2>
                <p className="text-[#5A665A] text-sm font-light mb-8 max-w-sm leading-relaxed">
                  Program Affiliate KAMBI bersifat eksklusif. Anda harus memiliki akun pelanggan dan masuk terlebih dahulu untuk mengajukan kemitraan.
                </p>
                <Link href="/login" className="flex items-center justify-center gap-2 bg-[#3A5034] text-white px-8 py-4 rounded-xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all w-full md:w-auto">
                  Masuk / Daftar Akun
                </Link>
                
                {/* Tombol Testing Khusus Dev (Biar kamu bisa liat formnya tanpa harus coding API dulu) */}
                <button onClick={() => setIsLoggedIn(true)} className="mt-8 text-[11px] text-[#D4A373] underline font-medium hover:text-[#C08A45]">
                  [Dev Test] Simulasi: Anggap Sudah Login
                </button>
              </div>
            ) : (
              // TAMPILAN JIKA SUDAH LOGIN (FORM PENGAJUAN)
              <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-[#EAE6D9] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3EFE4] rounded-bl-full -z-10 opacity-50"></div>
                
                <h2 className="text-2xl font-semibold text-[#2C352D] font-playfair mb-2">Formulir Pengajuan</h2>
                <p className="text-[#5A665A] text-sm font-light mb-8">Data akan ditinjau oleh Admin sebelum disetujui.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Data Akun Otomatis */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Email Akun (Terkunci)</label>
                    <input type="email" value={userEmail} disabled className="w-full bg-[#F3EFE4] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#5A665A] opacity-80 cursor-not-allowed font-medium" />
                  </div>

                  {/* Nomor WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Nomor WhatsApp Aktif</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><Phone size={18}/></span>
                      <input required type="tel" placeholder="0812xxxx..." className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                    </div>
                  </div>

                  {/* Sosial Media (Dropdown + Input) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Sosial Media Utama</label>
                    <div className="flex gap-3">
                      <select required className="bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all w-[120px] cursor-pointer">
                        <option value="tiktok">TikTok</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                      </select>
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><AtSign size={18}/></span>
                        <input required type="text" placeholder="Username / Link Profil" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                      </div>
                    </div>
                  </div>

                  {/* Strategi */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Rencana Promosi</label>
                    <textarea required rows={4} placeholder="Ceritakan bagaimana cara Anda menawarkan KAMBI (Contoh: Live TikTok rutin, share ke grup WA Ibu-ibu, dll)..." className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all resize-none"></textarea>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    {/* Tombol Testing Khusus Dev buat balik ke mode Gembok */}
                    <button type="button" onClick={() => setIsLoggedIn(false)} className="text-[11px] text-[#D4A373] underline">Batal (Logout)</button>
                    
                    <button type="submit" className="flex items-center justify-center gap-2 bg-[#3A5034] text-white px-8 py-4 rounded-xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300">
                      Ajukan <Send size={18} />
                    </button>
                  </div>

                </form>
              </div>
            )}
            
          </motion.div>

        </div>
      </div>
    </div>
  );
}