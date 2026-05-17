"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, ShieldCheck, Lock, Loader2 } from "lucide-react";
// Mengimpor fungsi penanganan keranjang berbasis basis data
import { getCartDB, updateCartQtyDB, removeFromCartDB, CartItem } from "../../lib/cart"; 

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function CartPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); 

  useEffect(() => {
    const fetchCartData = async () => {
      const token = localStorage.getItem("kambi_token");
      if (token) {
        setIsLoggedIn(true);
        const data = await getCartDB();
        setCartItems(data);
      }
      setIsLoaded(true);
    };

    fetchCartData();
  }, []);

  const formatIDR = (val: any) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Memperbarui kuantitas pada basis data
  const updateQty = async (cartId: number, newQty: number) => {
    if (newQty < 1) return;
    
    // Pembaruan optimistik pada state internal untuk performa visual yang cepat
    const updatedCart = cartItems.map(item => item.id === cartId ? { ...item, qty: newQty } : item);
    setCartItems(updatedCart);
    
    try {
      await updateCartQtyDB(cartId, newQty);
    } catch (error) {
      // Mengembalikan data asli apabila proses server mengalami kegagalan
      const originalData = await getCartDB();
      setCartItems(originalData);
    }
  };

  // Menghapus item dari basis data
  const handleRemoveItem = async (cartId: number) => {
    try {
      await removeFromCartDB(cartId);
      const data = await getCartDB(); // Sinkronisasi ulang data terbaru
      setCartItems(data);
    } catch (error) {
      alert("Gagal menghapus produk dari keranjang.");
    }
  };

  // Kalkulasi total harga akumulatif secara real-time dengan merujuk pada objek product
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product ? Number(item.product.price) : 0;
    return acc + (price * item.qty);
  }, 0);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <Loader2 className="animate-spin text-[#3A5034]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {!isLoggedIn ? (
          /* TAMPILAN JIKA BELUM TERAUTENTIKASI */
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
          </motion.div>
        ) : (
          /* TAMPILAN JIKA SUDAH LOG IN */
          <>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
              <h1 className="text-4xl md:text-5xl font-semibold text-[#2C352D] font-playfair tracking-tight mb-2">Keranjang Anda</h1>
              <p className="text-[#5A665A] text-lg font-light">Pastikan pesanan Anda sudah benar sebelum melanjutkan ke pembayaran.</p>
            </motion.div>

            {cartItems.length === 0 ? (
              /* KONDISI KERANJANG KOSONG */
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-32 bg-white rounded-[3rem] border border-[#EAE6D9] shadow-sm relative">
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
              /* KONDISI KERANJANG TERISI */
              <div className="flex flex-col lg:flex-row gap-10">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex-1 space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 sm:p-6 rounded-3xl border border-[#EAE6D9] shadow-sm flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-all">
                      
                      {/* Tautan Menuju Detail Produk Berdasarkan Properti Objek Relasi */}
                      <Link href={`/product/${item.product?.slug}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-[#FDFCF8] rounded-2xl flex items-center justify-center border border-[#EAE6D9]/50 overflow-hidden shrink-0">
                        {item.product?.image_url ? (
                           <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                           <span className="text-xl font-bold opacity-20 font-playfair text-[#D4A373]">{item.product?.category || "Produk"}</span>
                        )}
                      </Link>
                      
                      <div className="flex-1 text-center sm:text-left w-full">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-[#5A665A] uppercase tracking-widest">{item.product?.category || "Produk"}</span>
                        </div>
                        <Link href={`/product/${item.product?.slug}`}>
                          <h3 className="text-xl font-semibold text-[#2C352D] font-playfair group-hover:text-[#D4A373] transition-colors mb-2 line-clamp-1">{item.product?.name}</h3>
                        </Link>
                        <p className="text-xl font-bold text-[#3A5034] mb-4">{formatIDR(item.product?.price)}</p>
                        
                        <div className="flex items-center justify-between sm:justify-start gap-6 w-full">
                          <div className="flex items-center bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl p-1">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-[#5A665A] hover:bg-white rounded-lg transition-all"><Minus size={14}/></button>
                            <span className="w-10 text-center font-bold text-[#2C352D] text-sm">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-[#5A665A] hover:bg-white rounded-lg transition-all"><Plus size={14}/></button>
                          </div>
                          <button onClick={() => handleRemoveItem(item.id)} className="text-[#5A665A] hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium">
                            <Trash2 size={16} /> <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* AREA RINGKASAN PEMBAYARAN */}
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
                      Lanjut ke Checkout <ArrowRight size={18} />
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