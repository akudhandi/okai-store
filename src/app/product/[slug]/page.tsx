"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingCart, ShieldCheck, Leaf, Heart, ArrowLeft, CheckCircle2 } from "lucide-react";

// --- MOCK DATA (Nanti diganti dari Backend) ---
const products = [
  { id: 1, name: "KAMBI Premium Original", slug: "susu-kambing-original", price: 45000, category: "Bubuk Premium", rating: 5.0, tag: "ORIGINAL", color: "text-[#D4A373]", desc: "Susu kambing etawa murni dengan kualitas premium. Diproses tanpa bahan pengawet, menjaga keutuhan nutrisi untuk mendukung imunitas dan kesehatan pencernaan keluarga Anda." },
  { id: 2, name: "KAMBI Premium Cokelat", slug: "susu-kambing-cokelat", price: 50000, category: "Bubuk Premium", rating: 4.9, tag: "COKELAT", color: "text-[#513627]", desc: "Perpaduan sempurna antara kebaikan susu kambing etawa dan cokelat premium pilihan. Sangat disukai anak-anak dan dewasa, tanpa bau prengus sama sekali." },
  // Default data kalau slug gak ketemu
  { id: 99, name: "KAMBI Etawa Spesial", slug: "default", price: 50000, category: "Premium", rating: 5.0, tag: "KAMBI", color: "text-[#3A5034]", desc: "Produk premium dari KAMBI untuk kesehatan Anda." }
];

export default function ProductDetail() {
  const params = useParams();
  const [qty, setQty] = useState(1);

  // Cari produk berdasarkan slug dari URL
  const product = products.find(p => p.slug === params?.slug) || products[2];

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleAddToCart = () => {
    // Nanti di sini kita pasang logic Context/Zustand + Cek Affiliate
    alert(`Berhasil menambahkan ${qty}x ${product.name} ke keranjang!`);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb / Navigasi Kembali */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* KOLOM KIRI: Gambar Produk */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-full aspect-square bg-[#F3EFE4]/50 rounded-[3rem] border border-[#EAE6D9] flex items-center justify-center p-12 relative overflow-hidden group">
              <span className={`text-6xl md:text-8xl font-bold opacity-10 group-hover:scale-110 transition-transform duration-700 font-playfair ${product.color}`}>
                {product.tag}
              </span>
              {/* Dummy Kotak Produk (Nanti diganti foto asli) */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-48 h-64 bg-white rounded-2xl shadow-2xl border border-white/50 flex flex-col items-center justify-center p-6 transform group-hover:-translate-y-2 transition-transform duration-500">
                    <ShieldCheck size={48} className={product.color} strokeWidth={1.5} />
                    <h3 className="text-center font-playfair font-bold text-[#2C352D] mt-4 leading-tight">{product.name}</h3>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* KOLOM KANAN: Detail & Transaksi */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-[#EAE6D9]/50 text-[#5A665A] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold text-[#2C352D] font-playfair leading-tight mb-4 tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex gap-1 text-[#D4A373]">
                  <Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/>
                </div>
                <span className="text-[#5A665A] text-sm font-medium">({product.rating} / 5.0)</span>
              </div>
            </div>

            <p className="text-4xl font-bold text-[#3A5034] mb-8 tracking-tight">
              {formatIDR(product.price)}
            </p>

            <p className="text-[#5A665A] text-lg font-light leading-relaxed mb-8">
              {product.desc}
            </p>

            {/* Fitur Utama */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 text-[#2C352D]"><CheckCircle2 size={20} className="text-[#D4A373]"/> <span className="font-medium text-sm">100% Organik</span></div>
              <div className="flex items-center gap-3 text-[#2C352D]"><CheckCircle2 size={20} className="text-[#D4A373]"/> <span className="font-medium text-sm">Tanpa Prengus</span></div>
              <div className="flex items-center gap-3 text-[#2C352D]"><CheckCircle2 size={20} className="text-[#D4A373]"/> <span className="font-medium text-sm">Ramah Lambung</span></div>
              <div className="flex items-center gap-3 text-[#2C352D]"><CheckCircle2 size={20} className="text-[#D4A373]"/> <span className="font-medium text-sm">BPOM RI</span></div>
            </div>

            {/* Action Area (Add to Cart) */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE6D9] shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-[#FDFCF8] border border-[#EAE6D9] rounded-2xl p-2 sm:w-1/3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-[#5A665A] hover:bg-white hover:shadow-sm rounded-xl transition-all"><Minus size={18}/></button>
                  <span className="font-bold text-[#2C352D] text-lg">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-[#5A665A] hover:bg-white hover:shadow-sm rounded-xl transition-all"><Plus size={18}/></button>
                </div>

                {/* Add to Cart Button */}
                <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-[#3A5034] text-white rounded-2xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:scale-[1.02] transition-all duration-300 py-4 sm:py-0">
                  <ShoppingCart size={20} /> Masukkan Keranjang
                </button>
                
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}