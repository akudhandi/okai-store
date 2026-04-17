"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, MapPin, User, Phone, Truck, CreditCard, ShieldCheck, Tag } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function CheckoutPage() {
  // State untuk menyimpan kode Affiliate dari Local Storage
  const [affiliateRef, setAffiliateRef] = useState<string | null>(null);

  // Saat halaman dimuat, diam-diam cek apakah ada "jejak" Affiliate
  useEffect(() => {
    const ref = localStorage.getItem("okai_affiliate_ref");
    if (ref) {
      setAffiliateRef(ref);
    }
  }, []);

  // --- MOCK DATA (Anggap aja ini data dari keranjang sebelumnya) ---
  const subtotal = 140000;
  const ongkir = 15000;
  const total = subtotal + ongkir;

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    // Nanti di sini kita POST data ke Backend Laravel
    alert(`Checkout Berhasil!\nTotal: ${formatIDR(total)}\nAffiliate: ${affiliateRef || "Tidak ada"}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigasi Kembali */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Kembali ke Keranjang
        </Link>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#2C352D] font-playfair tracking-tight mb-2">Checkout</h1>
          <p className="text-[#5A665A] text-lg font-light">Lengkapi detail pengiriman Anda untuk menyelesaikan pesanan.</p>
        </motion.div>

        <form onSubmit={handleCheckout} className="flex flex-col lg:flex-row gap-10">
          
          {/* KOLOM KIRI: Form Pengiriman */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex-1 space-y-8">
            
            {/* Box 1: Informasi Kontak */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
              <h2 className="text-xl font-semibold text-[#2C352D] font-playfair mb-6 flex items-center gap-2">
                <User className="text-[#D4A373]" size={20}/> Informasi Kontak
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#5A665A]">Nama Lengkap</label>
                  <input required type="text" placeholder="Budi Santoso" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#5A665A]">Nomor WhatsApp</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A] font-medium">+62</span>
                    <input required type="tel" placeholder="81234567890" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl pl-12 pr-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Alamat Pengiriman */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
              <h2 className="text-xl font-semibold text-[#2C352D] font-playfair mb-6 flex items-center gap-2">
                <MapPin className="text-[#D4A373]" size={20}/> Alamat Pengiriman
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#5A665A]">Alamat Lengkap (Jalan, No Rumah, RT/RW)</label>
                  <textarea required rows={3} placeholder="Jl. Sudirman No. 123, RT 01/RW 02..." className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all resize-none"></textarea>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#5A665A]">Kota / Kabupaten</label>
                    <input required type="text" placeholder="Kota Surabaya" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#5A665A]">Kode Pos</label>
                    <input required type="text" placeholder="60123" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: Metode Pengiriman & Pembayaran */}
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
                  <h2 className="text-lg font-semibold text-[#2C352D] font-playfair mb-4 flex items-center gap-2">
                    <Truck className="text-[#D4A373]" size={18}/> Ekspedisi
                  </h2>
                  <select className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all cursor-pointer">
                     <option>JNE Reguler (Rp 15.000)</option>
                     <option>J&T Express (Rp 16.000)</option>
                     <option>SiCepat REG (Rp 15.000)</option>
                  </select>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
                  <h2 className="text-lg font-semibold text-[#2C352D] font-playfair mb-4 flex items-center gap-2">
                    <CreditCard className="text-[#D4A373]" size={18}/> Pembayaran
                  </h2>
                  <select className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-[#2C352D] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] transition-all cursor-pointer">
                     <option>Bank Transfer (BCA)</option>
                     <option>Bank Transfer (Mandiri)</option>
                     <option>E-Wallet (GoPay / OVO)</option>
                  </select>
               </div>
            </div>

          </motion.div>

          {/* KOLOM KANAN: Ringkasan Final */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full lg:w-[400px]">
            <div className="bg-[#3A5034] p-8 rounded-[2.5rem] shadow-xl sticky top-28 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={150} /></div>
              
              <h3 className="text-2xl font-semibold font-playfair mb-8 relative z-10">Ringkasan Pembayaran</h3>
              
              <div className="space-y-4 mb-6 text-[#EAE6D9] font-light border-b border-white/20 pb-6 relative z-10">
                <div className="flex justify-between">
                  <span>Subtotal (3 Item)</span>
                  <span className="font-medium text-white">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span className="font-medium text-white">{formatIDR(ongkir)}</span>
                </div>
              </div>

              {/* INDIKATOR AFFILIATE (Muncul kalau ada kode ref) */}
              {affiliateRef && (
                <div className="mb-6 px-4 py-3 bg-[#D4A373]/20 rounded-xl border border-[#D4A373]/30 flex items-center gap-3 relative z-10">
                   <Tag size={18} className="text-[#D4A373]" />
                   <div className="text-sm">
                      <p className="text-[#EAE6D9] font-light text-xs">Diundang oleh mitra:</p>
                      <p className="font-bold text-[#D4A373] uppercase tracking-wider">{affiliateRef}</p>
                   </div>
                </div>
              )}
              
              <div className="mb-8 flex justify-between items-end relative z-10">
                <span className="text-lg font-medium text-[#EAE6D9]">Total Bayar</span>
                <span className="text-3xl font-bold text-[#D4A373] tracking-tight">{formatIDR(total)}</span>
              </div>

              <button type="submit" className="w-full flex items-center justify-center bg-[#D4A373] text-white py-4 rounded-2xl font-bold tracking-wide shadow-lg hover:bg-[#C08A45] hover:scale-[1.02] transition-all duration-300 relative z-10">
                Selesaikan Pembayaran
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#EAE6D9]/70 font-light relative z-10">
                Data Anda dilindungi enkripsi SSL 256-bit
              </div>
            </div>
          </motion.div>
          
        </form>

      </div>
    </div>
  );
}