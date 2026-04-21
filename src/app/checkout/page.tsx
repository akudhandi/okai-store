"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard, Wallet, Truck, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { getCart, CartItem } from "../../lib/cart";
import axiosInstance from "../../lib/axios";

export default function CheckoutPage() {
  const router = useRouter();
  
  // State Data
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // State Form
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Kalkulasi Harga
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const ongkir = 25000; // Contoh ongkir flat
  const total = subtotal + ongkir;

  useEffect(() => {
    // 1. Cek Login
    const token = localStorage.getItem("kambi_token");
    const userStr = localStorage.getItem("kambi_user");
    
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pembayaran.");
      router.push("/login");
      return;
    }
    
    if (userStr) setUser(JSON.parse(userStr));

    // 2. Tarik Data Keranjang
    const items = getCart();
    if (items.length === 0) {
      router.push("/cart"); // Kalau kosong, balikin ke keranjang
      return;
    }
    
    setCartItems(items);
    setIsLoaded(true);
  }, [router]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await axiosInstance.post("/orders", {
        address: address,
        payment_method: paymentMethod,
        total_price: total, // Sesuai kolom DB
        items: cartItems,    // Array berisi id, qty, price
      });

      if (response.data.success) {
        localStorage.removeItem("kambi_cart");
        window.dispatchEvent(new Event("cartUpdated"));
        setIsProcessing(false);
        setIsSuccess(true);
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Gagal memproses pesanan. Silakan coba lagi.");
      setIsProcessing(false);
    }
  };

  // Jangan render sebelum data siap
  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#D4A373]" size={40}/></div>;

  // LAYAR SUKSES
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-[#EAE6D9] text-center max-w-md w-full">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold font-playfair text-[#2C352D] mb-4">Pesanan Berhasil!</h2>
          <p className="text-[#5A665A] mb-8 leading-relaxed">
            Terima kasih, <strong>{user?.name}</strong>. Pesanan Anda sedang kami proses. Invoice telah dikirim ke email Anda.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#D4A373] animate-pulse">
            Mengalihkan ke beranda...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/cart" className="inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors mb-8 font-medium text-sm">
          <ArrowLeft size={16} /> Kembali ke Keranjang
        </Link>

        <h1 className="text-4xl font-semibold text-[#2C352D] font-playfair mb-10">Penyelesaian Pesanan</h1>

        <form onSubmit={handleCheckout} className="flex flex-col lg:flex-row gap-10">
          
          {/* KOLOM KIRI: Form Data Pengiriman & Pembayaran */}
          <div className="flex-1 space-y-8">
            
            {/* Box Alamat */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
              <h2 className="text-xl font-bold font-playfair text-[#2C352D] mb-6 flex items-center gap-2">
                <MapPin className="text-[#D4A373]"/> Alamat Pengiriman
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nama Penerima</label>
                  <input type="text" value={user?.name || ""} disabled className="w-full bg-[#F3EFE4] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#5A665A] cursor-not-allowed mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Alamat Lengkap</label>
                  <textarea required rows={3} placeholder="Nama Jalan, Gedung, No. Rumah, RT/RW, Kecamatan, Kota..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all mt-1 resize-none" />
                </div>
              </div>
            </div>

            {/* Box Metode Pembayaran */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
              <h2 className="text-xl font-bold font-playfair text-[#2C352D] mb-6 flex items-center gap-2">
                <Wallet className="text-[#D4A373]"/> Metode Pembayaran
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1 */}
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'transfer_bank' ? 'border-[#3A5034] bg-[#3A5034]/5' : 'border-[#EAE6D9] hover:border-[#D4A373]/50'}`}>
                  <input type="radio" name="payment" value="transfer_bank" checked={paymentMethod === 'transfer_bank'} onChange={() => setPaymentMethod('transfer_bank')} className="hidden" />
                  <CreditCard size={28} className={paymentMethod === 'transfer_bank' ? 'text-[#3A5034]' : 'text-[#5A665A]'}/>
                  <span className={`font-semibold text-sm ${paymentMethod === 'transfer_bank' ? 'text-[#3A5034]' : 'text-[#5A665A]'}`}>Transfer Bank</span>
                </label>

                {/* Option 2 */}
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'cod' ? 'border-[#3A5034] bg-[#3A5034]/5' : 'border-[#EAE6D9] hover:border-[#D4A373]/50'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                  <Truck size={28} className={paymentMethod === 'cod' ? 'text-[#3A5034]' : 'text-[#5A665A]'}/>
                  <span className={`font-semibold text-sm ${paymentMethod === 'cod' ? 'text-[#3A5034]' : 'text-[#5A665A]'}`}>Bayar di Tempat (COD)</span>
                </label>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: Ringkasan & Tombol Bayar */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE6D9] shadow-sm sticky top-28">
              <h3 className="text-xl font-bold text-[#2C352D] font-playfair mb-6 border-b border-[#EAE6D9] pb-4">Ringkasan Pesanan</h3>
              
              {/* List Item Kecil */}
              <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#2C352D] line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[#5A665A]">{item.qty} x {formatIDR(item.price)}</p>
                    </div>
                    <p className="text-sm font-bold text-[#3A5034]">{formatIDR(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>

              {/* Rincian Harga */}
              <div className="space-y-3 mb-6 text-[#5A665A] font-light text-sm border-t border-[#EAE6D9] pt-4">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-[#2C352D]">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim (Flat)</span>
                  <span className="font-medium text-[#2C352D]">{formatIDR(ongkir)}</span>
                </div>
              </div>

              {/* Total Akhir */}
              <div className="border-t border-[#EAE6D9] pt-6 mb-8 flex flex-col">
                <span className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-1">Total Pembayaran</span>
                <span className="text-3xl font-bold text-[#3A5034] tracking-tight">{formatIDR(total)}</span>
              </div>

              <button disabled={isProcessing} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#3A5034] disabled:bg-[#5A665A] text-white py-4 rounded-2xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300">
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : "Bayar Sekarang"}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#5A665A] font-light">
                <ShieldCheck size={16} className="text-[#D4A373]" /> Transaksi Aman & Terenkripsi
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}