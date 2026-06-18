"use client";

// 1. TAMBAHKAN 'use' PADA IMPORT REACT
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // 👈 IMPORT UNTUK BACA URL
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingCart, ShieldCheck, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "../../../lib/axios";
import { addToCartDB } from "../../../lib/cart"; 
import ProductReviews from "../../../components/ProductReviews";
import toast from 'react-hot-toast';

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: string | number;
  stock: number;
  warehouse: string;
  image_url: string | null;
  is_dropship_enabled?: boolean;
  dropship_discount_type?: string;
  dropship_discount_value?: number;
  dropship_min_qty?: number;
}

// 2. SESUAIKAN TIPE DATA PARAMS MENJADI PROMISE
export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  // 3. GUNAKAN 'use()' UNTUK MEMBUKA PROMISE PARAMS
  const resolvedParams = use(params);
  
  // 👈 TANGKAP KODE AFILIASI DARI URL (Contoh: ?ref=KMB-JOKO123)
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const [qty, setQty] = useState(1);
  const [isDropshipChecked, setIsDropshipChecked] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🔥 FUNGSI PEREKAM KLIK AFILIASI (Berjalan di belakang layar)
    const recordClick = async () => {
      if (refCode && resolvedParams?.id) {
        // Cek SessionStorage agar tidak spam hitung klik kalau user cuma refresh halaman
        const hasClicked = sessionStorage.getItem(`clicked_${refCode}_${resolvedParams.id}`);
        
        if (!hasClicked) {
          try {
            // 👇 UPDATE DI SINI: Kirimkan product_id ke backend dalam bentuk Angka (Number)
            await axiosInstance.post('/affiliate/track', { 
              ref: refCode,
              product_id: Number(resolvedParams.id) 
            });
            sessionStorage.setItem(`clicked_${refCode}_${resolvedParams.id}`, 'true');
          } catch (err) {
            console.error("Gagal merekam klik afiliasi", err);
          }
        }
      }
    };

    const fetchProductDetail = async () => {
      try {
        // 4. GUNAKAN resolvedParams.id, BUKAN params.id LAGI
        const response = await axiosInstance.get(`/products/${resolvedParams.id}`);
        const data = response.data.data || response.data;
        setProduct(data);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Gagal mengambil detail produk:", err);
        setError("Produk tidak ditemukan atau server sedang bermasalah.");
        setIsLoading(false);
      }
    };

    if (resolvedParams?.id) {
      fetchProductDetail();
      recordClick(); // 👈 PANGGIL SENSOR PEREKAM DI SINI
    }
  }, [resolvedParams?.id, refCode]); 

  const formatIDR = (val: any) => {
    const num = Number(val) || 0; 
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const token = localStorage.getItem("kambi_token");
    if (!token) {
      toast.error("Silakan masuk (login) ke akun Anda terlebih dahulu untuk berbelanja.");
      return; // Bisa juga diarahkan dengan: router.push('/login')
    }

    if (qty > product.stock) {
      toast.error(`Maaf, stok hanya tersisa ${product.stock} pcs!`);
      return;
    }

    try {
      await addToCartDB(product.id, qty);
      toast.success(`Berhasil menambahkan ${qty}x ${product.name} ke keranjang! 🛒`);
    } catch (error) {
      toast.error("Gagal menambahkan ke keranjang. Silakan coba lagi.");
    }
  };

  // --- STATE LOADING ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#D4A373] mb-4" />
        <p className="font-playfair text-xl text-[#2C352D]">Menyiapkan produk...</p>
      </div>
    );
  }

  // --- STATE ERROR ---
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle size={64} className="text-red-500 mb-4 opacity-80" />
        <h2 className="text-3xl font-playfair font-bold text-[#2C352D] mb-4">Oops!</h2>
        <p className="text-[#5A665A] mb-8">{error || "Produk tidak ditemukan."}</p>
        <Link href="/shop" className="px-8 py-3 bg-[#3A5034] text-white rounded-full font-bold">Kembali ke Katalog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb / Navigasi Kembali */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* KOLOM KIRI: Gambar Produk */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <div className="w-full aspect-square bg-[#F3EFE4]/50 rounded-[3rem] border border-[#EAE6D9] flex items-center justify-center relative overflow-hidden group p-8">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="text-center">
                  <ShieldCheck size={80} className="text-[#D4A373] mx-auto mb-4 opacity-50" />
                  <span className="text-4xl font-bold opacity-20 font-playfair text-[#3A5034]">KAMBI</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* KOLOM KANAN: Detail & Transaksi */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} className="flex flex-col justify-center">
            
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-[#EAE6D9]/50 text-[#5A665A] rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#EAE6D9]">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold text-[#2C352D] font-playfair leading-tight mb-4 tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex gap-1 text-[#D4A373]">
                  <Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/>
                </div>
                <span className="text-[#5A665A] text-sm font-medium">| SKU: {product.sku}</span>
              </div>
            </div>

            <p className="text-4xl font-bold text-[#3A5034] mb-8 tracking-tight">
              {formatIDR(product.price)}
            </p>

            <div className="text-[#5A665A] text-lg font-light leading-relaxed mb-8 bg-white p-6 rounded-2xl border border-[#EAE6D9]">
              <h4 className="font-bold text-sm text-[#2C352D] mb-2 uppercase tracking-wide">Deskripsi Produk</h4>
              <p>{product.description}</p>
            </div>

            {/* Fitur Utama & Info Stok */}
            <div className="mb-6">
              <div className="flex items-center gap-3 text-[#2C352D]">
                <CheckCircle2 size={20} className="text-[#D4A373]"/> 
                <span className="font-medium text-sm text-lg font-bold">Stok: {product.stock} pcs (Tersedia)</span>
              </div>
            </div>

            {product.is_dropship_enabled && (
              <div className="mb-8 bg-orange-50/50 p-4 rounded-2xl border border-orange-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isDropshipChecked} 
                    onChange={(e) => {
                      setIsDropshipChecked(e.target.checked);
                      if (e.target.checked) {
                        localStorage.setItem("kambi_is_dropship", "true");
                      } else {
                        localStorage.removeItem("kambi_is_dropship");
                      }
                    }} 
                    className="w-5 h-5 accent-[#E65100] rounded cursor-pointer"
                  />
                  <span className="font-bold text-[#E65100]">Kirim sebagai Dropshipper</span>
                </label>
                {isDropshipChecked && (
                  <p className="text-xs text-orange-800 mt-2 font-medium">
                    ✨ Dapatkan diskon khusus dropshipper <strong>{product.dropship_discount_type === 'percent' ? `${product.dropship_discount_value}%` : formatIDR(product.dropship_discount_value)}</strong> dengan minimal pembelian {product.dropship_min_qty} pcs!
                  </p>
                )}
              </div>
            )}

            {/* Action Area (Add to Cart) */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE6D9] shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-[#FDFCF8] border border-[#EAE6D9] rounded-2xl p-2 sm:w-1/3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-[#5A665A] hover:bg-white hover:shadow-sm rounded-xl transition-all"><Minus size={18}/></button>
                  <span className="font-bold text-[#2C352D] text-lg">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 flex items-center justify-center text-[#5A665A] hover:bg-white hover:shadow-sm rounded-xl transition-all"><Plus size={18}/></button>
                </div>

                {/* Add to Cart Button */}
                <button onClick={handleAddToCart} disabled={product.stock < 1} className="flex-1 flex items-center justify-center gap-2 bg-[#3A5034] disabled:bg-[#EAE6D9] disabled:text-[#5A665A] disabled:cursor-not-allowed text-white rounded-2xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:scale-[1.02] transition-all duration-300 py-4 sm:py-0">
                  <ShoppingCart size={20} /> {product.stock > 0 ? "Masukkan Keranjang" : "Stok Habis"}
                </button>
                
              </div>
            </div>

          </motion.div>
        </div>
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}