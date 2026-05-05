"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Filter, Loader2, AlertCircle, Search } from "lucide-react";
import { motion, Variants } from "framer-motion";
import axiosInstance from "../../lib/axios";

// --- TIPE DATA TYPESCRIPT ---
interface Product {
  id: number;
  name: string;
  price: number;
  category?: string; 
  slug?: string;
  image_url?: string;
}

// --- ANIMASI ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const categories = ["Semua", "Bubuk Premium", "Paket Hemat", "Perawatan"];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- MENGAMBIL DATA DARI LARAVEL ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/products");
        const data = response.data.data || response.data; 
        setProducts(data);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Gagal mengambil data produk:", err);
        setError("Gagal terhubung ke server. Pastikan Backend Laravel sudah berjalan.");
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatIDR = (val: any) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(num);
  };

  // --- FILTER & PENCARIAN ---
  const filteredProducts = products.filter((product) => {
    const matchCategory = activeCategory === "Semua" || product.category === activeCategory;
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER KATALOG */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#2C352D] mb-4 font-playfair tracking-tight">Koleksi KAMBI</h1>
          <p className="text-[#5A665A] text-lg font-light max-w-2xl mx-auto">
            Temukan pilihan nutrisi terbaik untuk Anda dan keluarga. 100% murni, organik, dan penuh kebaikan.
          </p>
        </motion.div>

        {/* SEARCH & FILTER BAR */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12 border-b border-[#EAE6D9] pb-8">
          
          {/* SEARCH BAR */}
          <div className="mb-8 max-w-md mx-auto md:mx-0">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A] group-focus-within:text-[#D4A373] transition-colors">
                <Search size={20} />
              </span>
              <input
                type="text"
                placeholder="Cari produk di sini..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#EAE6D9] rounded-2xl py-3.5 pl-12 pr-4 text-[#2C352D] font-medium placeholder:text-[#5A665A]/50 placeholder:font-light focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] shadow-sm transition-all"
              />
            </div>
          </div>

          {/* KATEGORI */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-[#5A665A]">
              <Filter size={20} />
              <span className="font-semibold">Kategori:</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 hide-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                    activeCategory === cat ? "bg-[#3A5034] text-white shadow-md" : "bg-white text-[#5A665A] border border-[#EAE6D9] hover:border-[#D4A373] hover:text-[#D4A373]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- STATE HANDLING (LOADING & ERROR) --- */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-[#D4A373]">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="font-playfair text-xl text-[#2C352D]">Memuat produk dari server...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-8 rounded-3xl text-center max-w-2xl mx-auto">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Oops! Ada Masalah.</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* GRID PRODUK DARI DATABASE */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <motion.div 
            key={`${activeCategory}-${searchTerm}`} 
            initial="hidden" animate="visible" variants={staggerContainer} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeUp} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#EAE6D9]/50 group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                
                {/* Gambar Area */}
                <Link href={`/product/${product.slug || product.id}`} className="block w-full aspect-4/3 bg-[#FDFCF8] rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative cursor-pointer">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl font-bold opacity-10 group-hover:scale-110 transition-transform duration-500 font-playfair text-[#D4A373]">
                      {product.name.substring(0, 3).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#5A665A] uppercase tracking-widest border border-[#EAE6D9]">
                    {product.category || "Produk"}
                  </div>
                </Link>

                {/* Info Produk */}
                <div className="flex-grow flex flex-col">
                  <Link href={`/product/${product.slug || product.id}`}>
                    <h3 className="text-xl font-semibold text-[#2C352D] mb-2 font-playfair group-hover:text-[#D4A373] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex gap-1 text-[#D4A373] mb-4">
                    <Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/>
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <p className="text-2xl font-bold text-[#3A5034] mb-6 tracking-tight">{formatIDR(product.price)}</p>
                    <Link href={`/product/${product.slug || product.id}`} className="w-full flex justify-center py-3.5 bg-transparent text-[#3A5034] border border-[#3A5034] rounded-xl font-bold tracking-wide hover:bg-[#3A5034] hover:text-white transition-colors">
                      Lihat Detail
                    </Link>
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}

        {/* KONDISI JIKA PRODUK TIDAK DITEMUKAN */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-20 bg-white rounded-3xl border border-[#EAE6D9]">
            <Search size={48} className="mx-auto mb-4 text-[#D4A373] opacity-50" />
            <h3 className="text-xl font-bold text-[#2C352D] mb-2">Produk tidak ditemukan</h3>
            <p className="text-[#5A665A] text-sm">
              Maaf, kami tidak dapat menemukan produk yang sesuai dengan pencarian atau kategori Anda.
            </p>
            <button 
              onClick={() => { setSearchTerm(""); setActiveCategory("Semua"); }}
              className="mt-6 px-6 py-2.5 bg-[#FDFCF8] text-[#3A5034] border border-[#EAE6D9] rounded-full text-sm font-semibold hover:border-[#D4A373] transition-colors"
            >
              Hapus Filter
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}