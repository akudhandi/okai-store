"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, ShoppingCart, LogOut, ShieldCheck } from "lucide-react";
import { getCartTotalQty } from "../lib/cart";
import AffiliateMenu from "./AffiliateMenu";
import { useSearchParams } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [cartCount, setCartCount] = useState(0); 

  // 👇 1. Panggil hook-nya di sini
  const searchParams = useSearchParams();

  useEffect(() => {
    // 👇 2. SKRIP NINJA PENANGKAP REFERRAL 👇
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("kambi_affiliate_ref", refCode);
      console.log("Kode Referral tertangkap dari URL:", refCode);
    }
    // 👆 =================================== 👆

    const checkLoginStatus = () => {
      const token = localStorage.getItem("kambi_token");
      const userStr = localStorage.getItem("kambi_user");
      
      if (token && userStr) {
        setIsLoggedIn(true);
        try {
          const userObj = JSON.parse(userStr);
          setUserName(userObj.name.split(" ")[0]); 
        } catch (e) {
          console.error("Gagal parse nama user");
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    checkLoginStatus();

    window.addEventListener("userUpdated", checkLoginStatus);
    window.addEventListener("userLogin", checkLoginStatus);

    const updateCartBadge = () => {
      setCartCount(getCartTotalQty());
    };
    
    updateCartBadge(); 

    window.addEventListener("cartUpdated", updateCartBadge);
    
    return () => {
      window.removeEventListener("userUpdated", checkLoginStatus);
      window.removeEventListener("userLogin", checkLoginStatus);
      window.removeEventListener("cartUpdated", updateCartBadge);
    };
  // 👇 3. Tambahkan searchParams ke dalam array ini biar Next.js pantau terus URL-nya
  }, [searchParams]); 

  const handleLogout = () => {
    localStorage.removeItem("kambi_token");
    localStorage.removeItem("kambi_user");
    window.location.href = "/login"; 
  };

  return (
    <nav className="w-full bg-[#FDFCF8] border-b border-[#EAE6D9] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* BAGIAN KIRI: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck size={32} className="text-[#D4A373]"/>
            <span className="text-2xl font-bold font-playfair text-[#3A5034] tracking-widest">KAMBI.</span>
          </Link>

          {/* BAGIAN TENGAH: Menu Utama */}
          <div className="hidden md:flex items-center gap-8 text-[#5A665A] font-medium text-sm">
            <Link href="/" className="hover:text-[#D4A373] transition-colors">Beranda</Link>
            <Link href="/shop" className="hover:text-[#D4A373] transition-colors">Belanja</Link>
            <Link href="/register-affiliate" className="hover:text-[#D4A373] transition-colors">Affiliate</Link>
          </div>

          {/* BAGIAN KANAN: Ikon Cart & Profil */}
          <div className="flex items-center gap-6">
            
            {/* Ikon Keranjang dengan Badge Dinamis */}
            <Link href="/cart" className="relative text-[#2C352D] hover:text-[#D4A373] transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4A373] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-[#EAE6D9]"></div> {/* Garis Pemisah */}

            {isLoggedIn ? (
              <div className="group relative py-2"> 
                <button className="flex items-center gap-2 text-[#2C352D] hover:text-[#D4A373] transition-colors">
                  <User size={22} />
                  <span className="text-sm font-medium hidden sm:block">Hai, {userName}</span>
                </button>
                
                {/* DROPDOWN ANTI JURANG KEMATIAN */}
                <div className="absolute right-0 top-full pt-2 w-56 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-50">
                  <div className="bg-white border border-[#EAE6D9] rounded-2xl shadow-xl p-3 flex flex-col gap-1">
                    
                    <div className="px-3 py-2 border-b border-[#EAE6D9] mb-1">
                      <p className="text-[10px] font-bold text-[#5A665A] uppercase tracking-widest">Akun Saya</p>
                    </div>
                    
                    <AffiliateMenu />

                    <Link href="/profile" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#2C352D] hover:text-[#D4A373] hover:bg-[#FDFCF8] rounded-xl transition-all">
                      <User size={18} /> Pengaturan Akun
                    </Link>

                    <Link href="/orders" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#2C352D] hover:text-[#D4A373] hover:bg-[#FDFCF8] rounded-xl transition-all">
                      <ShoppingCart size={18} /> Pesanan Saya
                    </Link>
                    
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all mt-1">
                      <LogOut size={18} /> Keluar Akun
                    </button>

                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-[#2C352D] hover:text-[#D4A373] transition-colors">
                <User size={22} />
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}