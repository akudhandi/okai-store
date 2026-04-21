"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingCart, ShieldCheck, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "../../../lib/axios";
import { addToCart } from "../../../lib/cart"; // Import fungsi keranjang

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
}

export default function ProductDetail() {
  const params = useParams();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mengambil data spesifik berdasarkan ID/Slug dari URL
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        // params.slug ini berisi ID produk (karena di katalog kita passing ID)
        const response = await axiosInstance.get(`/products/${params?.slug}`);
        const data = response.data.data || response.data;
        setProduct(data);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Gagal mengambil detail produk:", err);
        setError("Produk tidak ditemukan atau server sedang bermasalah.");
        setIsLoading(false);
      }
    };

    if (params?.slug) {
      fetchProductDetail();
    }
  }, [params?.slug]);

  // Fungsi kebal error untuk format rupiah
  const formatIDR = (val: any) => {
    const num = Number(val) || 0; 
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (qty > product.stock) {
      alert(`Maaf, stok hanya tersisa ${product.stock} pcs!`);
      return;
    }

    // Eksekusi fungsi simpan ke memori
    addToCart({
      id: product.id,
      slug: params?.slug as string,
      name: product.name,
      price: Number(product.price),
      qty: qty,
      image_url: product.image_url,
      category: product.category || "Produk",
    });

    alert(`Berhasil menambahkan ${qty}x ${product.name} ke keranjang! 🛒`);
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
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 text-[#2C352D]"><CheckCircle2 size={20} className="text-[#D4A373]"/> <span className="font-medium text-sm">Stok: {product.stock} pcs</span></div>
              <div className="flex items-center gap-3 text-[#2C352D]"><CheckCircle2 size={20} className="text-[#D4A373]"/> <span className="font-medium text-sm">Dikirim dari: {product.warehouse}</span></div>
            </div>

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

      </div>
    </div>
  );
}