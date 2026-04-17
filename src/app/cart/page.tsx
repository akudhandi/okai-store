"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, ShieldCheck, Lock } from "lucide-react";

// --- MOCK DATA KERANJANG ---
const initialCart = [
  { id: 1, name: "KAMBI Premium Original", slug: "susu-kambing-original", price: 45000, qty: 2, category: "Bubuk Premium", color: "text-[#D4A373]", tag: "ORIGINAL" },
  { id: 2, name: "KAMBI Premium Cokelat", slug: "susu-kambing-cokelat", price: 50000, qty: 1, category: "Bubuk Premium", color: "text-[#513627]", tag: "COKELAT" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function CartPage() {
  // SIMULASI LOGIN: Sementara diset 'false' biar gemboknya kelihatan
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState(initialCart);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // Fungsi pura-pura untuk ubah Qty & Hapus Item
  const updateQty = (id: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(cartItems.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };
  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Kalkulasi Total
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {!isLoggedIn ? (
          // ==========================================
          // TAMPILAN JIKA BELUM LOGIN (TERGEMBOK)
          // ==========================================
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white p-8 md:p-12 rounded-[3rem] border border-[#EAE6D9] shadow-xl text-center flex flex-col items-center justify-center min-h-[500px]">
            <div className="w-20 h-20 bg-[#F3EFE4] text-[#D4A373] rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Lock size={32} />
            </div>
            <h2 className="text-3xl font-semibold text-[#2C352D] font-playfair mb-4">Akses Terkunci</h2>
            <p className="text-[#5A665A] text-lg font-light mb-8 max-w-md leading-relaxed">
              Silakan masuk ke akun Anda terlebih dahulu untuk melihat dan mengelola keranjang belanja.
            </p>
            <Link href="/login" className="flex items-center justify-center gap-2 bg-[#3A5034] text-white px-10 py-4 rounded-full font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all w-full md:w-auto">
              Masuk / Daftar Akun
            </Link>
            
            {/* Tombol Testing Khusus Dev */}
            <button onClick={() => setIsLoggedIn(true)} className="mt-8 text-[11px] text-[#D4A373] underline font-medium hover:text-[#C08A45]">
              [Dev Test] Simulasi: Anggap Sudah Login
            </button>
          </motion.div>
        ) : (
          // ==========================================
          // TAMPILAN JIKA SUDAH LOGIN (ISI KERANJANG)
          // ==========================================
          <>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10 flex justify-between items-end">
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold text-[#2C352D] font-playfair tracking-tight mb-2">Keranjang Anda</h1>
                <p className="text-[#5A665A] text-lg font-light">Pastikan pesanan Anda sudah benar sebelum melanjutkan ke pembayaran.</p>
              </div>
              <button onClick={() => setIsLoggedIn(false)} className="hidden md:block text-[12px] text-[#D4A373] underline hover:text-[#C08A45] mb-2">
                Simulasi Logout
              </button>
            </motion.div>

            {cartItems.length === 0 ? (
              // JIKA KERANJANG KOSONG
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-32 bg-white rounded-[3rem] border border-[#EAE6D9] shadow-sm relative">
                <button onClick={() => setIsLoggedIn(false)} className="md:hidden absolute top-6 right-6 text-[10px] text-[#D4A373] underline">Logout</button>
                <div className="w-24 h-24 bg-[#F3EFE4] rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4A373]">
                  <ShoppingBag size={40} />
                </div>
                <h2 className="text-2xl font-semibold text-[#2C352D] mb-4 font-playfair">Keranjang Masih Kosong</h2>
                <p className="text-[#5A665A] mb-8 font-light">Sepertinya Anda belum memilih produk kebaikan apapun.</p>
                <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-[#3A5034] text-white rounded-full font-bold tracking-wide shadow-lg hover:bg-[#2C352D] transition-all">
                  Mulai Belanja KAMBI
                </Link>
              </motion.div>
            ) : (
              // JIKA KERANJANG ADA ISINYA
              <div className="flex flex-col lg:flex-row gap-10">
                
                {/* KOLOM KIRI: Daftar Item */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex-1 space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 sm:p-6 rounded-3xl border border-[#EAE6D9] shadow-sm flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-all">
                      
                      {/* Foto Produk (Mockup) */}
                      <Link href={`/product/${item.slug}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-[#FDFCF8] rounded-2xl flex items-center justify-center border border-[#EAE6D9]/50 overflow-hidden shrink-0">
                        <span className={`text-xl font-bold opacity-20 font-playfair ${item.color}`}>{item.tag}</span>
                      </Link>
                      
                      {/* Info Produk */}
                      <div className="flex-1 text-center sm:text-left w-full">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-[#5A665A] uppercase tracking-widest">{item.category}</span>
                        </div>
                        <Link href={`/product/${item.slug}`}>
                          <h3 className="text-xl font-semibold text-[#2C352D] font-playfair group-hover:text-[#D4A373] transition-colors mb-2">{item.name}</h3>
                        </Link>
                        <p className="text-xl font-bold text-[#3A5034] mb-4">{formatIDR(item.price)}</p>
                        
                        {/* Aksi: Qty & Hapus */}
                        <div className="flex items-center justify-between sm:justify-start gap-6 w-full">
                          <div className="flex items-center bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl p-1">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-[#5A665A] hover:bg-white rounded-lg transition-all"><Minus size={14}/></button>
                            <span className="w-10 text-center font-bold text-[#2C352D] text-sm">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-[#5A665A] hover:bg-white rounded-lg transition-all"><Plus size={14}/></button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-[#5A665A] hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium">
                            <Trash2 size={16} /> <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* KOLOM KANAN: Ringkasan Order */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full lg:w-[400px]">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE6D9] shadow-sm sticky top-28">
                    <h3 className="text-2xl font-semibold text-[#2C352D] font-playfair mb-6">Ringkasan Pesanan</h3>
                    
                    <div className="space-y-4 mb-6 text-[#5A665A] font-light">
                      <div className="flex justify-between">
                        <span>Subtotal Produk</span>
                        <span className="font-medium text-[#2C352D]">{formatIDR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ongkos Kirim</span>
                        <span className="text-[#D4A373] italic text-sm">Dihitung di Checkout</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-[#EAE6D9] pt-6 mb-8 flex justify-between items-end">
                      <span className="text-lg font-medium text-[#2C352D]">Total</span>
                      <span className="text-3xl font-bold text-[#3A5034] tracking-tight">{formatIDR(subtotal)}</span>
                    </div>

                    <Link href="/checkout" className="w-full flex items-center justify-center gap-2 bg-[#3A5034] text-white py-4 rounded-2xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300">
                      Lanjut ke Pembayaran <ArrowRight size={18} />
                    </Link>

                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#5A665A] font-light">
                      <ShieldCheck size={16} className="text-[#D4A373]" /> Transaksi Aman & Terenkripsi
                    </div>
                  </div>
                </motion.div>
                
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}