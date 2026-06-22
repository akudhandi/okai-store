"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard, Wallet, Truck, ShieldCheck, Loader2, CheckCircle2, Ticket } from "lucide-react";
// 🚩 UBAH IMPORT: Gunakan getCartDB dari sistem baru
import { getCartDB, CartItem } from "../../lib/cart";
import axiosInstance from "../../lib/axios";
import toast from 'react-hot-toast';
import { formatNumber, parseNumber } from "../../lib/numberFormat";

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val);
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-[#EAE6D9]/50 rounded-xl ${className}`} />
);

export default function CheckoutPage() {
  const router = useRouter();
  
  // State Data
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // State Form
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);

  // State Dropship
  const [isDropship, setIsDropship] = useState(false);
  const [dropshipperName, setDropshipperName] = useState("");
  const [dropshipIntents, setDropshipIntents] = useState<Record<string, boolean>>({});

  // State Affiliate
  const [affiliateCodeInput, setAffiliateCodeInput] = useState("");
  const [isAffiliateValid, setIsAffiliateValid] = useState(false);
  const [isCheckingAffiliate, setIsCheckingAffiliate] = useState(false);

  // State Alamat Terpisah & Telepon
  const [phone_number, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // State Ongkir Real-time
  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingNote, setShippingData] = useState("");
  const [shippingEtd, setShippingEtd] = useState("");

  // State Kupon / Promo
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<any>(null);
  const [couponMessage, setCouponMessage] = useState({ text: "", isError: false });

  // Kalkulasi Harga (Diselaraskan dengan struktur item.product)
  const subtotal = cartItems.reduce((acc, item) => {
    let price = item.product ? Number(item.product.price) : 0;
    
    // Potong Diskon Dropship (Tampilan Frontend)
    const isIntendedDropship = dropshipIntents[item.product_id] === true;
    if (isDropship && isIntendedDropship && item.product?.is_dropship_enabled && item.qty >= (item.product?.dropship_min_qty || 1)) {
      if (item.product?.dropship_discount_type === 'percent') {
        price -= (price * ((item.product?.dropship_discount_value || 0) / 100));
      } else if (item.product?.dropship_discount_type === 'fixed') {
        price -= (item.product?.dropship_discount_value || 0);
      }
      price = Math.max(0, price);
    }
    
    return acc + (price * item.qty);
  }, 0);
  
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

  const total = (subtotal - discountAmount) + shippingFee;

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
        toast.success(`Kupon valid! Diskon ${res.data.data.discount_type === 'percent' ? res.data.data.discount_value + '%' : formatIDR(res.data.data.discount_value)} diterapkan.`);
      } else {
        setActiveCoupon(null);
        setCouponMessage({ text: res.data.message || "Kupon tidak valid.", isError: true });   
        toast.error(res.data.message || "Kupon tidak valid.");
      }
    } catch (err: any) {
      setActiveCoupon(null);
      const errMsg = err.response?.data?.message || "Gagal mengecek kupon. Coba lagi.";
      setCouponMessage({ text: errMsg, isError: true });
      toast.error(errMsg);
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponCode("");
    setCouponMessage({ text: "", isError: false });
    toast.success("Kupon berhasil dihapus.");
  };

  // Trigger hitung ongkir saat alamat lengkap
  useEffect(() => {
    if (!postalCode || !city || !province || cartItems.length === 0) {
      setShippingFee(0);
      setShippingData("");
      setShippingEtd("");
      return;
    }
    if (postalCode.length < 5) {
      setShippingFee(0);
      setShippingData("");
      setShippingEtd("");
      return;
    }

    const fetchShippingRate = async () => {
      setIsCalculatingShipping(true);
      try {
        const res = await axiosInstance.post('/shipping/rate', {
          postal_code: postalCode,
          city: city,
          province: province,
          items: cartItems.map(item => ({
            product_id: item.product_id,
            qty: item.qty
          }))
        });

        if (res.data.success) {
          setShippingFee(res.data.data.price);
          setShippingData(res.data.data.note || "");
          setShippingEtd(res.data.data.estimated_days || "");
          if (res.data.data.note) {
             toast.success("Ongkir berhasil diupdate (Estimasi)");
          }
        }
      } catch (err) {
        console.error("Gagal mengambil ongkir", err);
        setShippingFee(25000); // Fallback
        setShippingData("Flat Rate");
        setShippingEtd("2-3 Hari");
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    const timer = setTimeout(() => {
      fetchShippingRate();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [postalCode, city, province, cartItems]);

  const handleCheckAffiliate = async (codeOverride?: string) => {
    // Pastikan code adalah string, hindari React Event object jika dipanggil dari onClick tanpa wrapper
    const code = (typeof codeOverride === 'string') ? codeOverride : affiliateCodeInput;
    
    if (!code || typeof code !== 'string') return;
    
    setIsCheckingAffiliate(true);
    try {
      const res = await axiosInstance.post('/affiliate/validate-code', { code: code });
      if (res.data.success) {
        setIsAffiliateValid(true);
        if (typeof codeOverride === 'string') setAffiliateCodeInput(codeOverride);
        toast.success(res.data.message);
      } else {
        setIsAffiliateValid(false);
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error("Affiliate Validation Error:", err);
      setIsAffiliateValid(false);
      toast.error(err.response?.data?.message || "Terjadi kesalahan sistem");
    } finally {
      setIsCheckingAffiliate(false);
    }
  };

  useEffect(() => {
    const fetchCheckoutData = async () => {
      // 1. Cek Login
      const token = localStorage.getItem("kambi_token");
      const userStr = localStorage.getItem("kambi_user");
      
      if (!token) {
        toast.error("Silakan login terlebih dahulu untuk melakukan pembayaran.");
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

      // Ambil intent dropship per produk dari localStorage
      const intentsStr = localStorage.getItem("kambi_dropship_intents");
      const intents = intentsStr ? JSON.parse(intentsStr) : {};
      setDropshipIntents(intents);

      // Cek apakah ada kode afiliasi tersimpan
      const savedRef = localStorage.getItem("kambi_affiliate_ref");
      if (savedRef) {
        handleCheckAffiliate(savedRef);
      }

      // 2. Tarik Data Keranjang dari Basis Data (Asynchronous)
      try {
        const items = await getCartDB();
        if (items.length === 0) {
          router.push("/cart"); // Kalau kosong, balikin ke keranjang
          return;
        }
        setCartItems(items);

        // Validasi Dropship: Harus ada minimal 1 produk di keranjang yang memenuhi syarat minimal dropship (qty >= dropship_min_qty) DAN niat awalnya ditambahkan sebagai dropship
        const hasValidDropshipItem = items.some((item) => 
          item.product?.is_dropship_enabled && item.qty >= (item.product?.dropship_min_qty || 1) && intents[item.product_id] === true
        );

        setIsDropship(hasValidDropshipItem);
      } catch (error) {
        console.error("Gagal mengambil data keranjang", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchCheckoutData();
  }, [router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!street || !district || !city || !province || !postalCode || !phone_number) {
      toast.error("Mohon lengkapi seluruh data alamat dan nomor telepon untuk pengiriman.");
      setIsProcessing(false);
      return;
    }

    if (isDropship && !dropshipperName.trim()) {
      toast.error("Nama Toko Dropshipper wajib diisi.");
      setIsProcessing(false);
      return;
    }

    const combinedAddress = `${street}, ${district}, ${city}, ${province}, ${postalCode}`;
    const affiliateCodeToUse = isAffiliateValid ? affiliateCodeInput : null;

    try {
      // 1. Update user profile dengan nomor telepon dan alamat baru (opsional tapi disarankan)
      if (user?.id) {
        try {
          await axiosInstance.put(`/users/${user.id}`, {
            name: user.name,
            email: user.email,
            phone_number: phone_number,
            address: combinedAddress
          });
        } catch (updateErr) {
          console.error("Gagal sinkronisasi data user saat checkout", updateErr);
        }
      }

      // 2. Buat pesanan
      const response = await axiosInstance.post("/orders", {
        address: combinedAddress,
        payment_method: paymentMethod,
        total_price: total,
        items: cartItems, 
        affiliate_code: affiliateCodeToUse,
        is_dropship: isDropship,
        dropshipper_name: dropshipperName,
        promotion_code: activeCoupon ? activeCoupon.code : null, 
        discount_amount: discountAmount 
      });

      if (response.data.success) {
        localStorage.removeItem("kambi_affiliate_ref");
        localStorage.removeItem("kambi_is_dropship");
        window.dispatchEvent(new Event("cartUpdated"));

        const orders = response.data.orders || [];
        setCreatedOrders(orders);

        if (paymentMethod === 'cod') {
          setIsProcessing(false);
          setIsSuccess(true);
          
          setTimeout(() => {
            router.push("/orders");
          }, 3000);
        } else {
          if (orders.length === 1) {
            window.location.href = orders[0].payment_url || response.data.payment_url;
          } else {
            setIsProcessing(false);
            setIsSuccess(true);
          }
        }
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      toast.error("Gagal memproses pesanan. Silakan coba lagi.");
      setIsProcessing(false);
    }
  };



  // LAYAR SUKSES
  if (isSuccess) {
    const isSplitPayment = paymentMethod !== 'cod' && createdOrders.length > 1;

    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-xl border border-[#EAE6D9] text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold font-playfair text-[#2C352D] mb-4">
            {isSplitPayment ? "Pesanan Terbagi!" : "Pesanan Berhasil!"}
          </h2>
          
          {isSplitPayment ? (
            <>
              <p className="text-[#5A665A] mb-6 leading-relaxed text-sm">
                Terima kasih, <strong>{user?.name}</strong>. Karena produk Anda dikirim dari lokasi gudang yang berbeda, pesanan Anda dipisah menjadi <strong>{createdOrders.length} bagian</strong> dengan pembayaran terpisah. Silakan bayar masing-masing bagian di bawah ini:
              </p>
              
              <div className="space-y-4 mb-8 text-left max-h-[300px] overflow-y-auto pr-1">
                {createdOrders.map((order, idx) => (
                  <div key={order.id || idx} className="p-4 bg-[#FDFCF8] border border-[#EAE6D9] rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider">
                        Gudang: {order.warehouse?.name || `Gudang #${order.warehouse_id}`}
                      </p>
                      <p className="text-xs text-[#5A665A] mt-0.5">{order.invoice_no}</p>
                      <p className="text-sm font-bold text-[#3A5034] mt-0.5">{formatIDR(order.total_price)}</p>
                    </div>
                    {order.payment_url ? (
                      <a
                        href={order.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-[#3A5034] hover:bg-[#2C352D] text-white text-xs font-bold rounded-xl text-center shadow-md transition-all whitespace-nowrap"
                      >
                        Bayar Sekarang
                      </a>
                    ) : (
                      <span className="text-xs text-green-600 font-bold">Lunas / COD</span>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-[#5A665A] mb-8 leading-relaxed">
                Tautan pembayaran di atas juga dapat Anda akses kapan saja melalui halaman <Link href="/orders" className="text-[#D4A373] hover:underline font-semibold">Riwayat Pesanan</Link>.
              </p>
            </>
          ) : (
            <p className="text-[#5A665A] mb-8 leading-relaxed">
              Terima kasih, <strong>{user?.name}</strong>. Pesanan Anda sedang kami proses. Invoice telah dikirim ke email Anda.
            </p>
          )}

          {!isSplitPayment ? (
            <div className="flex items-center justify-center gap-2 text-sm text-[#D4A373] animate-pulse">
              Mengalihkan ke riwayat pesanan...
            </div>
          ) : (
            <button
              onClick={() => router.push("/orders")}
              className="w-full bg-[#D4A373] hover:bg-[#b0865c] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all"
            >
              Lihat Riwayat Pesanan
            </button>
          )}
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
              
              {!isLoaded ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nama Penerima</label>
                      <Skeleton className="h-12 w-full mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nomor Telepon</label>
                      <Skeleton className="h-12 w-full mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Nama Jalan / Gedung / Patokan</label>
                    <Skeleton className="h-20 w-full mt-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Kecamatan</label>
                      <Skeleton className="h-12 w-full mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Kota / Kabupaten</label>
                      <Skeleton className="h-12 w-full mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Provinsi</label>
                      <Skeleton className="h-12 w-full mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest pl-1">Kode Pos</label>
                      <Skeleton className="h-12 w-full mt-1" />
                    </div>
                  </div>
                </div>
              ) : (
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
                    <input required type="text" value={postalCode} onChange={(e) => setPostalCode(parseNumber(e.target.value))} placeholder="Contoh: 12160" className="w-full bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none transition-all mt-1" />
                  </div>
                </div>

                {isDropship && (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <label className="text-xs font-bold text-orange-800 uppercase tracking-widest pl-1 flex items-center gap-2 mb-2">
                      <Truck size={14} /> Nama Toko Pengirim (Dropshipper)
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={dropshipperName} 
                      onChange={(e) => setDropshipperName(e.target.value)} 
                      placeholder="Masukkan nama toko Anda..." 
                      className="w-full bg-white border border-orange-200 rounded-xl px-4 py-3.5 text-[#2C352D] focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" 
                    />
                    <p className="text-xs text-orange-600 mt-2 font-medium">✨ Karena Anda membeli sebagai dropshipper, paket akan dikirim menggunakan nama toko ini.</p>
                  </div>
                )}
              </div>
            )}
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
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: Ringkasan & Tombol Bayar */}
          <div className="w-full lg:w-[400px]">
            {/* Box Affiliate Code */}
            <div className="bg-white p-6 rounded-[2rem] border border-[#EAE6D9] shadow-sm mb-6">
              <h3 className="text-sm font-bold text-[#2C352D] uppercase tracking-widest mb-3">Kode Referral (Opsional)</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={affiliateCodeInput}
                  onChange={(e) => {
                    setAffiliateCodeInput(e.target.value);
                    setIsAffiliateValid(false);
                  }}
                  placeholder="Masukkan kode..."
                  className="flex-1 bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-3 text-sm text-[#2C352D] focus:outline-none focus:border-[#D4A373] transition-all"
                  disabled={isAffiliateValid}
                />
                <button
                  type="button"
                  onClick={isAffiliateValid ? () => { setAffiliateCodeInput(""); setIsAffiliateValid(false); } : () => handleCheckAffiliate()}
                  disabled={!affiliateCodeInput || isCheckingAffiliate}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${isAffiliateValid ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-[#F3EFE4] text-[#3A5034] hover:bg-[#EAE6D9]"}`}
                >
                  {isCheckingAffiliate ? <Loader2 size={16} className="animate-spin" /> : (isAffiliateValid ? "Batal" : "Gunakan")}
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE6D9] shadow-sm sticky top-28">
              <h3 className="text-xl font-bold text-[#2C352D] font-playfair mb-6 border-b border-[#EAE6D9] pb-4">Ringkasan Pesanan</h3>
              
              {/* List Item Kecil */}
              {!isLoaded ? (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
                  {cartItems.map(item => {
                  let displayPrice = item.product ? Number(item.product.price) : 0;
                  const isIntendedDropship = dropshipIntents[item.product_id] === true;
                  const isItemDropshipValid = isDropship && isIntendedDropship && item.product?.is_dropship_enabled && item.qty >= (item.product?.dropship_min_qty || 1);
                  
                  if (isItemDropshipValid) {
                    if (item.product?.dropship_discount_type === 'percent') {
                      displayPrice -= (displayPrice * ((item.product?.dropship_discount_value || 0) / 100));
                    } else if (item.product?.dropship_discount_type === 'fixed') {
                      displayPrice -= (item.product?.dropship_discount_value || 0);
                    }
                  }

                  return (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#2C352D] line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-[#5A665A]">
                          {formatNumber(item.qty)} x {formatIDR(displayPrice)}
                          {isItemDropshipValid && <span className="ml-1 text-[10px] text-orange-600 font-bold">(Dropship)</span>}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#3A5034]">{formatIDR(displayPrice * item.qty)}</p>
                    </div>
                  );
                })}
              </div>
            )}

              {/* Box Input Kupon Promo */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket size={16} className="text-[#D4A373]" />
                  <label className="text-xs font-bold text-[#5A665A] uppercase tracking-widest">Punya Kode Kupon?</label>
                </div>

                {activeCoupon ? (
                  <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-xl transition-all">
                    <div>
                      <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Kupon Dipakai:</p>
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
                      className="flex-1 bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl px-4 py-2 text-sm text-[#2C352D] focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] outline-none uppercase font-bold transition-all"
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
              </div>

              {/* Rincian Harga */}
              <div className="space-y-3 mb-6 text-[#5A665A] font-light text-sm border-t border-[#EAE6D9] pt-4">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  {!isLoaded ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    <span className="font-medium text-[#2C352D]">{formatIDR(subtotal)}</span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span>Ongkos Kirim</span>
                    {!isLoaded ? (
                      <Skeleton className="h-4 w-16" />
                    ) : isCalculatingShipping ? (
                      <Loader2 size={14} className="animate-spin text-[#D4A373]" />
                    ) : (
                      <span className="font-medium text-[#2C352D]">{formatIDR(shippingFee)}</span>
                    )}
                  </div>
                  {shippingNote && !isCalculatingShipping && isLoaded && (
                    <div className="flex justify-between items-center text-[11px] text-[#D4A373] font-medium">
                      <span>Ekspedisi: {shippingNote}</span>
                      {shippingEtd && <span>Estimasi: {shippingEtd}</span>}
                    </div>
                  )}
                </div>

                {discountAmount > 0 && isLoaded && (
                  <div className="flex justify-between text-green-600 font-medium pt-1">
                    <span>Diskon Promo ({activeCoupon?.code})</span>
                    <span>- {formatIDR(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Total Akhir */}
              <div className="border-t border-[#EAE6D9] pt-6 mb-8 flex flex-col">
                <span className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-1">Total Pembayaran</span>
                {!isLoaded ? (
                  <Skeleton className="h-8 w-32 mt-1" />
                ) : (
                  <span className="text-3xl font-bold text-[#3A5034] tracking-tight">{formatIDR(total)}</span>
                )}
              </div>

              <button disabled={!isLoaded || isProcessing} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#3A5034] disabled:bg-[#5A665A] text-white py-4 rounded-2xl font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300">
                {!isLoaded ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isProcessing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  "Bayar Sekarang"
                )}
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