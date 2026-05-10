"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ShieldCheck, Loader2, Save, LogOut } from "lucide-react";
import axiosInstance from "../../lib/axios";
import AffiliateMenu from "@/components/AffiliateMenu";

export default function ProfilePage() {
  const router = useRouter();
  
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState("");
  
  // State Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Tarik data user dari LocalStorage
    const userStr = localStorage.getItem("kambi_user");
    const token = localStorage.getItem("kambi_token");

    if (!token || !userStr) {
      router.push("/login"); // Usir ke login kalau belum masuk
      return;
    }

    try {
      const userObj = JSON.parse(userStr);
      setUserId(userObj.id);
      setName(userObj.name);
      setEmail(userObj.email);
      setRole(userObj.role || "Customer");
      setIsLoading(false);
    } catch (e) {
      console.error("Gagal membaca data");
      router.push("/login");
    }
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const payload: any = { name, email };
      // Hanya kirim password jika diisi
      if (password.trim() !== "") {
        payload.password = password;
      }

      // Hit API Update User Laravel
      const response = await axiosInstance.put(`/users/${userId}`, payload);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        setPassword(""); // Kosongkan field password setelah sukses
        
        // Update data di LocalStorage agar sinkron
        const updatedUser = response.data.data;
        localStorage.setItem("kambi_user", JSON.stringify({
           ...JSON.parse(localStorage.getItem("kambi_user") || "{}"),
           name: updatedUser.name,
           email: updatedUser.email
        }));
        
        // Refresh Navbar dkk
        window.dispatchEvent(new Event("userUpdated"));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Gagal memperbarui profil.";
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kambi_token");
    localStorage.removeItem("kambi_user");
    window.location.href = "/login";
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#D4A373]" size={40}/></div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* KOLOM KIRI: Ringkasan Akun */}
        <div className="w-full md:w-1/3">
          <div className="bg-white border border-[#EAE6D9] rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center sticky top-28">
            <div className="w-24 h-24 bg-[#F3EFE4] rounded-full flex items-center justify-center text-[#D4A373] mb-4 shadow-inner">
              <User size={40} />
            </div>
            <h2 className="text-xl font-bold text-[#2C352D] font-playfair mb-1">{name}</h2>
            <p className="text-sm text-[#5A665A] mb-4">{email}</p>
            
            <div className="px-4 py-1.5 bg-[#EAE6D9]/50 border border-[#EAE6D9] text-[#5A665A] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              {role}
            </div>

            {/* Menu Affiliate (Hanya Muncul Jika Status Active) */}
            <div className="w-full flex justify-center mb-6">
              <AffiliateMenu />
            </div>

            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
              <LogOut size={18} /> Keluar Akun
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: Form Pengaturan */}
        <div className="w-full md:w-2/3">
          <div className="bg-white border border-[#EAE6D9] rounded-[2rem] p-8 md:p-10 shadow-sm">
            <h1 className="text-3xl font-semibold text-[#2C352D] font-playfair mb-2">Pengaturan Akun</h1>
            <p className="text-[#5A665A] text-sm font-light mb-8">Perbarui informasi data diri dan kata sandi Anda di sini.</p>

            {message && (
              <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                {message.type === 'success' ? <ShieldCheck size={20}/> : <ShieldCheck size={20}/>}
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              {/* NAMA */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><User size={18}/></span>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all" />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Alamat Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><Mail size={18}/></span>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all" />
                </div>
              </div>

              <hr className="border-[#EAE6D9] my-6" />

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Ubah Kata Sandi</label>
                <p className="text-[11px] text-[#5A665A] pl-1 mb-2">Kosongkan jika tidak ingin mengubah kata sandi.</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A]"><Lock size={18}/></span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all" />
                </div>
              </div>

              <div className="pt-6">
                <button disabled={isSaving} type="submit" className="w-full md:w-auto px-8 flex items-center justify-center gap-2 bg-[#3A5034] disabled:bg-[#5A665A] text-white py-4 rounded-xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300 ml-auto">
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20}/> Simpan Perubahan</>}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}