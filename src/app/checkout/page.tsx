"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// 👇 IMPORT TAMBAHAN: Users untuk icon Referral
import { ArrowLeft, MapPin, CreditCard, Wallet, ShieldCheck, Loader2, CheckCircle2, Ticket, Users } from "lucide-react";
import { getCartDB, CartItem } from "../../lib/cart";
import axiosInstance from "../../lib/axios";

export default function CheckoutPage() {
  const router = useRouter();
  
  // State Data
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // State Form Pembayaran
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // State Alamat Terpisah & Telepon
  const [phone_number, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // =========================================
  // STATE & LOGIKA KUPON PROMO
  // =========================================
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<any>(null); 
  const [couponMessage, setCouponMessage] = useState({ text: "", isError: false });

  // =========================================
  // STATE KODE REFERRAL (AFFILIATE) 🔥
  // =========================================
  const [affiliateCode, setAffiliateCode] = useState("");

  // Kalkulasi Harga Dasar
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product ? Number(item.product.price) : 0;
    return acc + (price * item.qty);
  }, 0);
  
  const ongkir = 25000; // Contoh ongkir flat

  // Kalkulasi Diskon Berdasarkan Kupon Aktif
  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.discount_type === 'percent') {
      discountAmount = (subtotal * activeCoupon.discount_value) / 100;
      if (activeCoupon.max_discount && discountAmount > activeCoupon.max_discount) {
        discountAmount = activeCoupon.max_discount;
      }
    } else if (activeCoupon.discount_type === 'fixed') {
      discountAmount = activeCoupon.discount_value;
    }
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  // Kalkulasi Total Akhir
  const total = (subtotal - discountAmount) + ongkir;

  // Fungsi untuk mengecek kupon ke Backend
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCheckingCoupon(true);
    setCouponMessage({ text: "", isError: false });

    try {
      const res = await axiosInstance.post("/promotions/check", {
        code: couponCode,
        total_amount: subtotal
      });

      if (res.data.success) {
        setActiveCoupon(res.data.data);
        setCouponMessage({ text: "Kupon berhasil digunakan!", isError: false });
      } else {
        setActiveCoupon(null);
        setCouponMessage({ text: res.data.message || "Kupon tidak valid.", isError: true });
      }
    } catch (err: any) {
      setActiveCoupon(null);
      setCouponMessage({ 
        text: err.response?.data?.message || "Gagal mengecek kupon. Coba lagi.", 
        isError: true 
      });
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponCode("");
    setCouponMessage({ text: "", isError: false });
  };

  useEffect(() => {
    const fetchCheckoutData = async () => {
      // 1. Cek Login
      const token = localStorage.getItem("kambi_token");
      const userStr = localStorage.getItem("kambi_user");
      
      if (!token) {
        alert("Silakan login terlebih dahulu untuk melakukan pembayaran.");
        router.push("/login");
        return;
      }
      
      let currentUser = null;
      if (userStr) {
        currentUser = JSON.parse(userStr);
        setUser(currentUser);
      }

      // Tarik alamat dan nomor telepon user dari backend untuk pre-fill
      if (currentUser?.id) {
        try {
          const res = await axiosInstance.get(`/users/${currentUser.id}`);
          const userData = res.data.data;
          
          if (userData.phone_number) setPhoneNumber(userData.phone_number);
          
          if (userData.address) {
            const parts = userData.address.split(",").map((p: string) => p.trim());
            if (parts.length >= 5) {
              setPostalCode(parts.pop() || "");
              setProvince(parts.pop() || "");
              setCity(parts.pop() || "");
              setDistrict(parts.pop() || "");
              setStreet(parts.join(", ") || "");
            } else {
              setStreet(userData.address);
            }
          }
        } catch (e) {
          console.error("Gagal mengambil detail user", e);
        }
      }

      // 🔥 CEK LINK REFERRAL: Kalau ada di localStorage, jadikan default value
      const savedAffiliate = localStorage.getItem("kambi_affiliate_ref");
      if (savedAffiliate) {
        setAffiliateCode(savedAffiliate);
      }

      // 2. Tarik Data Keranjang dari Basis Data
      try {
        const items = await getCartDB();
        if (items.length === 0) {
          router.push("/cart"); 
          return;
        }
        setCartItems(items);
      } catch (error) {
        console.error("Gagal mengambil data keranjang", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchCheckoutData();
  }, [router]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!street || !district || !city || !province || !postalCode || !phone_number) {
      alert("Mohon lengkapi seluruh data alamat dan nomor telepon untuk pengiriman.");
      setIsProcessing(false);
      return;
    }

    const combinedAddress = `${street}, ${district}, ${city}, ${province}, ${postalCode}`;

    try {
      // 1. Update user profile dengan nomor telepon dan alamat baru
      if (user?.id) {
        try {
          await axiosInstance.put(`/users/${user.id}`, {
            name: user.name,
            email: user.email,
            phone_number: phone_number,
            address: combinedAddress
          });
        } catch (updateErr) {
          console.error("Gagal sinkronisasi data user", updateErr);
        }
      }

      // 2. Buat pesanan (Kirim State affiliateCode langsung!)
      const response = await axiosInstance.post("/orders", {
        address: combinedAddress,
        payment_method: paymentMethod,
        total_price: total, 
        items: cartItems, 
        affiliate_code: affiliateCode, // 👈 KIRIM INPUTAN REFERRAL KE BACKEND
        promotion_code: activeCoupon ? activeCoupon.code : null, 
        discount_amount: discountAmount 
      });

      if (response.data.success) {
        // Hapus jejak referral setelah sukses checkout
        localStorage.removeItem("kambi_affiliate_ref");
        window.dispatchEvent(new Event("cartUpdated"));

        if (response.data.payment_url) {
          window.location.href = response.data.payment_url;
        } else {
          setIsProcessing(false);
          setIsSuccess(true);
          
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Gagal memproses pesanan. Silakan coba lagi.");
      setIsProcessing(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]"><Loader2 className="animate-spin text-[#D4A373]" size={40}/></div>;

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
                <MapPin className="text-[#D4A373]"/> Alamat Pengiriman & Kontak
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nama Penerima</label>
                    <input type="text" value={user?.name || ""} disabled className="w-full bg-[#F3EFE4] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#5A665A] cursor-not-allowed mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nomor Telepon</label>
                    <input required type="text" placeholder="08..." value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all mt-1" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nama Jalan / Gedung / Patokan</label>
                  <textarea required rows={2} placeholder="Nama Jalan, Gedung, No. Rumah, RT/RW..." value={street} onChange={(e) => setStreet(e.target.value)} className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all mt-1 resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Kecamatan</label>
                    <input required type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Contoh: Kebayoran Baru" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Kota / Kabupaten</label>
                    <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Contoh: Jakarta Selatan" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Provinsi</label>
                    <input required type="text" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Contoh: DKI Jakarta" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Kode Pos</label>
                    <input required type="number" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Contoh: 12160" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all mt-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Box Metode Pembayaran */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
              <h2 className="text-xl font-bold font-playfair text-[#2C352D] mb-6 flex items-center gap-2">
                <Wallet className="text-[#D4A373]"/> Metode Pembayaran
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'transfer_bank' ? 'border-[#3A5034] bg-[#3A5034]/5' : 'border-[#EAE6D9] hover:border-[#D4A373]/50'}`}>
                  <input type="radio" name="payment" value="transfer_bank" checked={paymentMethod === 'transfer_bank'} onChange={() => setPaymentMethod('transfer_bank')} className="hidden" />
                  <CreditCard size={28} className={paymentMethod === 'transfer_bank' ? 'text-[#3A5034]' : 'text-[#5A665A]'}/>
                  <span className={`font-semibold text-sm ${paymentMethod === 'transfer_bank' ? 'text-[#3A5034]' : 'text-[#5A665A]'}`}>Transfer Bank Virtual Account</span>
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
                      <p className="text-sm font-semibold text-[#2C352D] line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-[#5A665A]">{item.qty} x {formatIDR(item.product?.price || 0)}</p>
                    </div>
                    <p className="text-sm font-bold text-[#3A5034]">{formatIDR((item.product?.price || 0) * item.qty)}</p>
                  </div>
                ))}
              </div>

              {/* Box Input Kupon Promo */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket size={16} className="text-[#D4A373]" />
                  <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Punya Kode Kupon?</label>
                </div>
                
                {activeCoupon ? (
                  <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-green-700">Kode Diterapkan:</p>
                      <p className="text-sm font-black text-green-600 uppercase">{activeCoupon.code}</p>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-500 font-bold hover:underline">Hapus</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                      placeholder="Masukkan kode promo" 
                      className="flex-1 bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-2 text-sm text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none uppercase font-bold"
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      disabled={isCheckingCoupon || !couponCode}
                      className="px-4 py-2 bg-[#D4A373] text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-[#c29260] transition-colors"
                    >
                      {isCheckingCoupon ? <Loader2 size={16} className="animate-spin" /> : "Pakai"}
                    </button>
                  </div>
                )}
                
                {/* Pesan status kupon */}
                {couponMessage.text && (
                  <p className={`text-xs font-bold mt-2 ${couponMessage.isError ? 'text-red-500' : 'text-green-600'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* 👇 BOX BARU: Input Referral Code 👇 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-[#D4A373]" />
                  <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Kode Referral (Opsional)</label>
                </div>
                <input 
                  type="text" 
                  value={affiliateCode} 
                  onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())} 
                  placeholder="Kode mitra afiliasi..." 
                  className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-2 text-sm text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none uppercase font-bold"
                />
                <p className="text-[10px] text-[#5A665A] mt-1">
                  *Mendukung kreator KAMBI favoritmu.
                </p>
              </div>

              {/* Rincian Harga */}
              <div className="space-y-3 mb-6 text-[#5A665A] font-light text-sm border-t border-[#EAE6D9] pt-4">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-[#2C352D]">{formatIDR(subtotal)}</span>
                </div>
                
                {/* Tampilkan baris diskon hanya jika ada potongan */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Diskon Promo</span>
                    <span>- {formatIDR(discountAmount)}</span>
                  </div>
                )}

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