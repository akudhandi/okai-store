"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Filter } from "lucide-react";
import { motion, Variants } from "framer-motion";

// --- ANIMASI ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// --- DATA PRODUK BOHONGAN (MOCK DATA) ---
const products = [
  { id: 1, name: "KAMBI Premium Original", slug: "susu-kambing-original", price: 45000, category: "Bubuk Premium", rating: 5.0, tag: "ORIGINAL", color: "text-[#D4A373]" },
  { id: 2, name: "KAMBI Premium Cokelat", slug: "susu-kambing-cokelat", price: 50000, category: "Bubuk Premium", rating: 4.9, tag: "COKELAT", color: "text-[#513627]" },
  { id: 3, name: "Paket Sehat Keluarga (4 Box)", slug: "paket-keluarga", price: 170000, category: "Paket Hemat", rating: 5.0, tag: "PAKET 4", color: "text-[#3A5034]" },
  { id: 4, name: "Sabun Herbal Susu Kambing", slug: "sabun-susu", price: 25000, category: "Perawatan", rating: 4.8, tag: "SABUN", color: "text-[#8BA888]" },
  { id: 5, name: "KAMBI Premium Jahe Merah", slug: "susu-kambing-jahe", price: 48000, category: "Bubuk Premium", rating: 4.7, tag: "JAHE", color: "text-[#C08A45]" },
  { id: 6, name: "Paket Reseller Starter", slug: "paket-reseller", price: 400000, category: "Paket Hemat", rating: 5.0, tag: "RESELLER", color: "text-[#2C352D]" },
];

const categories = ["Semua", "Bubuk Premium", "Paket Hemat", "Perawatan"];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("Semua");

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // Filter produk berdasarkan kategori yang diklik
  const filteredProducts = activeCategory === "Semua" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER KATALOG */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp} 
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-[#2C352D] mb-4 font-playfair tracking-tight">Koleksi KAMBI</h1>
          <p className="text-[#5A665A] text-lg font-light max-w-2xl mx-auto">
            Temukan pilihan nutrisi terbaik untuk Anda dan keluarga. 100% murni, organik, dan penuh kebaikan.
          </p>
        </motion.div>

        {/* FILTER BAR */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp} 
          className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-[#EAE6D9] pb-6"
        >
          <div className="flex items-center gap-2 text-[#5A665A]">
            <Filter size={20} />
            <span className="font-semibold">Kategori:</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeCategory === cat 
                    ? "bg-[#3A5034] text-white shadow-md" 
                    : "bg-white text-[#5A665A] border border-[#EAE6D9] hover:border-[#D4A373] hover:text-[#D4A373]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* GRID PRODUK */}
        <motion.div 
          key={activeCategory} // Key ini bikin animasi ke-trigger ulang saat kategori ganti
          initial="hidden" animate="visible" variants={staggerContainer} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={fadeUp} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#EAE6D9]/50 group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              
              {/* Gambar Area */}
              <Link href={`/product/${product.slug}`} className="block w-full aspect-4/3 bg-[#FDFCF8] rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative cursor-pointer">
                <span className={`text-4xl font-bold opacity-10 group-hover:scale-110 transition-transform duration-500 font-playfair ${product.color}`}>
                  {product.tag}
                </span>
                {/* Badge Kategori */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#5A665A] uppercase tracking-widest border border-[#EAE6D9]">
                  {product.category}
                </div>
              </Link>

              {/* Info Produk */}
              <div className="flex-grow flex flex-col">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-xl font-semibold text-[#2C352D] mb-2 font-playfair group-hover:text-[#D4A373] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex gap-1 text-[#D4A373] mb-4">
                  <Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/>
                </div>
                
                {/* Pushing price and button to the bottom */}
                <div className="mt-auto pt-4">
                  <p className="text-2xl font-bold text-[#3A5034] mb-6 tracking-tight">{formatIDR(product.price)}</p>
                  <Link href={`/product/${product.slug}`} className="w-full flex justify-center py-3.5 bg-transparent text-[#3A5034] border border-[#3A5034] rounded-xl font-bold tracking-wide hover:bg-[#3A5034] hover:text-white transition-colors">
                    Lihat Detail
                  </Link>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>

        {/* Jika Filter Kosong (Walaupun saat ini mustahil karena data statis) */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#5A665A] text-lg">Maaf, produk untuk kategori ini sedang kosong.</p>
          </div>
        )}

      </div>
    </div>
  );
}