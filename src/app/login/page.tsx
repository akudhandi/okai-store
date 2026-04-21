"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "../../lib/axios"; 

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk form input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State untuk loading dan error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      let response;
      
      if (isLogin) {
        // --- HIT API LOGIN ---
        response = await axiosInstance.post("/login", {
          email,
          password
        });
      } else {
        // --- HIT API REGISTER ---
        response = await axiosInstance.post("/register", {
          name,
          email,
          password,
          password_confirmation: password // Diperlukan oleh Laravel
        });
      }

      console.log("Bentuk Response dari Laravel:", response.data);

      // Tangkap Token (Menyesuaikan dengan format JSON Laravel-mu)
      const token = response.data.token || response.data.data?.token; 
      
      if (token) {
        // Simpan token di localStorage
        localStorage.setItem("kambi_token", token);
        
        // Simpan data user
        const userData = response.data.user || response.data.data?.user;
        if(userData) localStorage.setItem("kambi_user", JSON.stringify(userData));

        // 👇 TAMBAHKAN BARIS INI: Kirim sinyal ke Navbar!
        window.dispatchEvent(new Event("userLogin"));

        // Alert sukses dari kodingan baru
        alert(isLogin ? "Login Berhasil!" : "Pendaftaran Berhasil!");
        
        // Pindah ke Beranda
        router.push("/"); 
      }

    } catch (err: any) {
      console.error("Auth Error:", err);
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Terjadi kesalahan pada server.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#D4A373]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#3A5034]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl border border-[#EAE6D9] overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px]">
        
        {/* KOLOM KIRI: Branding */}
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
              <p className="text-xs text-[#EAE6D9] font-light">Data Anda dilindungi enkripsi standar industri.</p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Form Area */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          
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

              {/* TAMPILAN ERROR */}
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Input Nama (Hanya muncul saat Register) */}
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nama Lengkap</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><User size={18}/></span>
                      <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Budi Santoso" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3.5 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Email</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><Mail size={18}/></span>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@anda.com" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3.5 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-end pl-1">
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Kata Sandi</label>
                    {isLogin && <a href="#" className="text-xs text-[#D4A373] font-medium hover:underline">Lupa Sandi?</a>}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><Lock size={18}/></span>
                    <input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-12 py-3.5 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A665A] hover:text-[#2C352D] transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#3A5034] disabled:bg-[#5A665A] text-white py-4 rounded-xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300">
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? "Masuk" : "Daftar Akun")}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-[#5A665A] font-light">
                  {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                  <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }} className="text-[#D4A373] font-bold hover:underline transition-all">
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