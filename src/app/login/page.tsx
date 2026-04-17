"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic POST ke Backend Laravel (Sanctum/JWT) untuk Authentikasi
    alert(isLogin ? "Proses Login berjalan..." : "Proses Pendaftaran berjalan...");
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#D4A373]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#3A5034]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl border border-[#EAE6D9] overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px]">
        
        {/* KOLOM KIRI: Branding (Sembunyi di Mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-[#3A5034] p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-[#EAE6D9] hover:text-white transition-colors mb-12 text-sm font-medium">
              <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
            <h1 className="text-4xl lg:text-5xl font-semibold font-playfair leading-tight mb-6">
              Kebaikan <span className="text-[#D4A373] italic">Murni</span> <br/>Menanti Anda.
            </h1>
            <p className="text-[#EAE6D9] font-light leading-relaxed max-w-sm">
              Masuk ke akun Anda untuk melacak pesanan, menyimpan produk favorit, dan mengakses fitur eksklusif mitra KAMBI.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 border-t border-white/20 pt-8 mt-12">
            <ShieldCheck size={32} className="text-[#D4A373]"/>
            <div>
              <p className="font-bold font-playfair text-lg">Keamanan Terjamin</p>
              <p className="text-xs text-[#EAE6D9] font-light">Data privasi Anda dilindungi enkripsi standar industri.</p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Form Area */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Tombol Back untuk Mobile */}
          <Link href="/" className="md:hidden inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors mb-8 text-sm font-medium">
            <ArrowLeft size={16} /> Kembali
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-semibold text-[#2C352D] font-playfair mb-2">
                  {isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru"}
                </h2>
                <p className="text-[#5A665A] font-light text-sm">
                  {isLogin ? "Silakan masukkan email dan kata sandi Anda." : "Bergabunglah untuk menikmati pengalaman belanja terbaik."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Input Nama (Hanya muncul saat Register) */}
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nama Lengkap</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><User size={18}/></span>
                      <input required type="text" placeholder="Budi Santoso" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3.5 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Email</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><Mail size={18}/></span>
                    <input required type="email" placeholder="email@anda.com" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3.5 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-end pl-1">
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Kata Sandi</label>
                    {isLogin && <a href="#" className="text-xs text-[#D4A373] font-medium hover:underline">Lupa Sandi?</a>}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><Lock size={18}/></span>
                    <input required type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-12 py-3.5 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A665A] hover:text-[#2C352D] transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#3A5034] text-white py-4 rounded-xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300">
                    {isLogin ? "Masuk" : "Daftar Akun"}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-[#5A665A] font-light">
                  {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                  <button onClick={() => setIsLogin(!isLogin)} className="text-[#D4A373] font-bold hover:underline transition-all">
                    {isLogin ? "Daftar sekarang" : "Masuk di sini"}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}