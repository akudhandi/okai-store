"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Receipt, Package, Loader2, Truck, CreditCard, Smartphone, QrCode, Store, ArrowRightLeft, Landmark, ShieldCheck } from "lucide-react";
import axiosInstance from "../../../lib/axios";
import ReviewModal from "../../../components/ReviewModal"; // <-- Import Modal Ulasan
import toast from 'react-hot-toast';

interface OrderDetail {
  id: string;
  raw_id: number;
  invoice_no: string;
  status: string;
  date: string;
  total_price: number; // 👈 Gunakan field asli backend
  total: number;       // Fallback
  payment_method: string; // 👈 Gunakan field asli backend
  method: string;      // Fallback
  address: string;
  customer: string;
  payment_url?: string;
  items: Array<{ 
    id: number; 
    name: string; 
    product?: { name: string }; // 👈 Handle nested product
    quantity: number; // 👈 Gunakan field asli backend
    qty: number;      // Fallback
    price: number; 
  }>;
  tracking?: {
    waybill_id: string;
    status: string;
    courier: string;
    link: string;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null); // Gunakan any dulu untuk fleksibilitas data backend
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // --- STATE UNTUK REVIEW MODAL ---
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductToReview, setSelectedProductToReview] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${params.id}`);
        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil detail pesanan", err);
        toast.error("Pesanan tidak ditemukan atau akses ditolak.");
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [params.id, router]);

  const formatIDR = (val: any) => {
    const number = Number(val);
    if (isNaN(number)) return "Rp 0";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  // --- FUNGSI SUBMIT ULASAN (Menunggu API Backend) ---
  const handleReviewSubmit = async (reviewData: { rating: number; comment: string; images: File[] }) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Nanti ganti console.log ini dengan Axios POST ke backend
        console.log("Mengirim ulasan:", {
          order_id: order?.id,
          product_id: selectedProductToReview?.id,
          ...reviewData
        });
        toast.success("Terima kasih! Ulasan kamu berhasil disimpan.");
        resolve();
      }, 1000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] pt-10 pb-24 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="max-w-3xl mx-auto">
          
          <div className="w-48 h-5 bg-gray-200 rounded-lg mb-8"></div>

          {/* INVOICE CARD SKELETON */}
          <div className="bg-white rounded-3xl border border-[#EAE6D9] shadow-sm overflow-hidden">
            
            {/* Header Status */}
            <div className="bg-[#3A5034]/50 p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAE6D9]">
              <div>
                <div className="w-32 h-4 bg-gray-200 rounded-lg mb-2"></div>
                <div className="w-40 h-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="text-left sm:text-right">
                <div className="w-32 h-4 bg-gray-200 rounded-lg mb-2"></div>
                <div className="w-32 h-6 bg-gray-200 rounded-lg"></div>
              </div>
            </div>

            <div className="p-8">
              {/* Tracking / Payment skeleton */}
              <div className="mb-8 p-6 bg-gray-100 rounded-2xl h-32"></div>

              {/* Info Resi & Invoice */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pb-8 border-b border-[#EAE6D9]">
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="w-48 h-5 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="w-48 h-5 bg-gray-200 rounded-lg"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded-lg"></div>
                </div>
              </div>

              {/* List Produk */}
              <div className="py-8 border-b border-[#EAE6D9]">
                <div className="w-32 h-4 bg-gray-200 rounded-lg mb-6"></div>
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-50">
                      <div className="space-y-2 flex-1">
                        <div className="w-48 h-5 bg-gray-200 rounded-lg"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded-lg"></div>
                      </div>
                      <div className="w-24 h-6 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Pembayaran */}
              <div className="pt-8">
                <div className="space-y-4 mb-6 border-b border-[#EAE6D9] pb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="w-32 h-4 bg-gray-200 rounded-lg"></div>
                      <div className="w-24 h-5 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-100 rounded-2xl border border-[#EAE6D9]">
                  <div className="w-32 h-5 bg-gray-200 rounded-lg"></div>
                  <div className="w-40 h-8 bg-gray-200 rounded-lg"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  // Normalisasi data dari backend (karena beda nama field)
  const orderTotal = Number(order.total_price || order.total || 0);
  const orderItems = order.items || [];
  const orderStatus = (order.status || "").toLowerCase();

  if (showPaymentSelection) {
    const paymentCategories = [
      {
        id: "bank_transfer",
        title: "Transfer Bank / Virtual Account",
        icon: Landmark,
        description: "Bayar otomatis melalui Mobile/Internet Banking atau ATM.",
        channels: [
          { name: "BCA Virtual Account", code: "bca", logo: "BCA", color: "bg-blue-50 text-blue-800 border-blue-200" },
          { name: "Mandiri Virtual Account", code: "mandiri", logo: "Mandiri", color: "bg-yellow-50 text-yellow-800 border-yellow-200" },
          { name: "BNI Virtual Account", code: "bni", logo: "BNI", color: "bg-orange-50 text-orange-800 border-orange-200" },
          { name: "BRI Virtual Account", code: "bri", logo: "BRI", color: "bg-blue-50 text-blue-900 border-blue-300" },
          { name: "Permata Virtual Account", code: "permata", logo: "Permata", color: "bg-green-50 text-green-800 border-green-200" },
        ]
      },
      {
        id: "credit_card",
        title: "Kartu Kredit / Debit",
        icon: CreditCard,
        description: "Menerima semua kartu dengan logo Visa, Mastercard, JCB, dan AMEX.",
        channels: [
          { name: "Visa", code: "visa", logo: "VISA", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
          { name: "Mastercard", code: "mastercard", logo: "MC", color: "bg-red-50 text-red-800 border-red-200" },
          { name: "JCB", code: "jcb", logo: "JCB", color: "bg-green-50 text-green-900 border-green-300" },
          { name: "American Express", code: "amex", logo: "AMEX", color: "bg-cyan-50 text-cyan-800 border-cyan-200" }
        ]
      },
      {
        id: "ewallet",
        title: "E-Wallet",
        icon: Smartphone,
        description: "Bayar cepat menggunakan saldo e-wallet favorit Anda.",
        channels: [
          { name: "DANA", code: "dana", logo: "DANA", color: "bg-sky-50 text-sky-800 border-sky-200" },
          { name: "OVO", code: "ovo", logo: "OVO", color: "bg-purple-50 text-purple-800 border-purple-200" },
          { name: "LinkAja", code: "linkaja", logo: "LinkAja", color: "bg-red-50 text-red-900 border-red-300" },
          { name: "ShopeePay", code: "shopeepay", logo: "ShopeePay", color: "bg-orange-50 text-orange-900 border-orange-300" }
        ]
      },
      {
        id: "qr_payment",
        title: "QR Payment",
        icon: QrCode,
        description: "Scan kode QRIS menggunakan aplikasi pembayaran pilihan Anda.",
        channels: [
          { name: "QRIS", code: "qris", logo: "QRIS", color: "bg-pink-50 text-pink-800 border-pink-200" }
        ]
      },
      {
        id: "retail_outlet",
        title: "Gerai Retail",
        icon: Store,
        description: "Bayar tunai di minimarket terdekat.",
        channels: [
          { name: "Alfamart", code: "alfamart", logo: "Alfamart", color: "bg-red-50 text-red-700 border-red-200" },
          { name: "Indomaret", code: "indomaret", logo: "Indomaret", color: "bg-blue-50 text-blue-700 border-blue-200" }
        ]
      },
      {
        id: "direct_debit",
        title: "Direct Debit",
        icon: ArrowRightLeft,
        description: "Debit instan langsung dari rekening bank Anda.",
        channels: [
          { name: "BCA KlikPay", code: "bca_klikpay", logo: "KlikPay", color: "bg-teal-50 text-teal-800 border-teal-200" },
          { name: "BRI Direct Debit", code: "bri_dd", logo: "BRI DD", color: "bg-sky-50 text-sky-900 border-sky-300" }
        ]
      }
    ];

    const handleSelectChannel = async (channel: any) => {
      setSelectedChannel(channel);
      setIsRedirecting(true);
      
      try {
        const res = await axiosInstance.post(`/orders/${order.id}/recreate-invoice`, {
          payment_method: channel.code
        });

        if (res.data.success && res.data.payment_url) {
          window.location.href = res.data.payment_url;
        } else {
          toast.error("Gagal mendapatkan link pembayaran.");
          setIsRedirecting(false);
        }
      } catch (err) {
        console.error("Gagal memproses metode pembayaran:", err);
        toast.error("Terjadi kesalahan sistem saat menghubungi Xendit.");
        setIsRedirecting(false);
      }
    };

    const handleBack = () => {
      setShowPaymentSelection(false);
      setSelectedChannel(null);
      setIsRedirecting(false);
    };

    return (
      <div className="min-h-screen bg-[#FDFCF8] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors font-medium text-sm cursor-pointer"
            >
              <ArrowLeft size={16} /> Kembali ke Detail Pesanan
            </button>
            <div className="text-right">
              <span className="text-xs text-[#5A665A] font-light">Status Pesanan:</span>
              <span className="ml-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Menunggu Pembayaran
              </span>
            </div>
          </div>

          {/* Info Card Pesanan */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-[#EAE6D9] shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest mb-1">Informasi Pembayaran</p>
              <h2 className="text-xl font-bold font-playfair text-[#2C352D]">{order.invoice_no}</h2>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 border-[#EAE6D9] pt-4 md:pt-0 w-full md:w-auto">
              <p className="text-xs font-semibold text-[#5A665A] uppercase tracking-wider">Total Tagihan</p>
              <p className="text-3xl font-black text-[#3A5034] tracking-tight mt-1">{formatIDR(orderTotal)}</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold font-playfair text-[#2C352D] mb-6">Pilih Metode Pembayaran</h3>

          {/* Grid Kategori Pembayaran */}
          <div className="space-y-6">
            {paymentCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.id} className="bg-white p-6 rounded-[2.5rem] border border-[#EAE6D9] shadow-sm hover:border-[#D4A373]/50 transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-[#3A5034]/5 text-[#3A5034] rounded-2xl">
                      <CategoryIcon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-playfair text-[#2C352D]">{category.title}</h4>
                      <p className="text-xs text-[#5A665A] mt-0.5 font-light leading-relaxed">{category.description}</p>
                    </div>
                  </div>

                  {/* Grid Saluran/Channels */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                    {category.channels.map((channel) => (
                      <button
                        key={channel.code}
                        type="button"
                        onClick={() => handleSelectChannel(channel)}
                        disabled={isRedirecting}
                        className="group flex flex-col justify-between items-center text-center p-4 border border-[#EAE6D9] rounded-2xl hover:border-[#3A5034] hover:bg-[#3A5034]/5 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[90px]"
                      >
                        <div className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase border mb-2 ${channel.color} group-hover:scale-105 transition-transform`}>
                          {channel.logo}
                        </div>
                        <span className="text-[11px] font-semibold text-[#5A665A] group-hover:text-[#3A5034] transition-colors line-clamp-1 leading-none">
                          {channel.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#5A665A] font-light">
            <ShieldCheck size={16} className="text-[#D4A373]" /> Pembayaran diamankan secara enkripsi penuh oleh Xendit
          </div>

        </div>

        {/* Loading Overlay */}
        {isRedirecting && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE6D9] shadow-2xl text-center max-w-sm w-full mx-4">
              <div className="w-16 h-16 bg-[#3A5034]/5 text-[#3A5034] rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="animate-spin" size={32} />
              </div>
              <h4 className="text-xl font-bold font-playfair text-[#2C352D] mb-2">Mengalihkan Pembayaran</h4>
              <p className="text-xs text-[#5A665A] leading-relaxed mb-4">
                Kami sedang menghubungkan Anda secara aman ke halaman pembayaran Xendit untuk metode <strong>{selectedChannel?.name}</strong>.
              </p>
              <div className="text-[10px] font-bold text-[#D4A373] tracking-widest uppercase animate-pulse">
                Mohon Tunggu...
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/orders" className="inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors mb-8 font-medium text-sm">
          <ArrowLeft size={16} /> Kembali ke Daftar Pesanan
        </Link>

        {/* INVOICE CARD */}
        <div className="bg-white rounded-3xl border border-[#EAE6D9] shadow-sm overflow-hidden">
          
          {/* Header Status */}
          <div className="bg-[#3A5034] p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Status Pesanan</p>
              <h2 className="text-2xl font-bold font-playfair uppercase tracking-wider">{orderStatus}</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-white/70 text-sm font-medium mb-1">Tanggal Pembelian</p>
              <p className="font-semibold">{order.date || new Date(order.created_at).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          <div className="p-8">

            {/* INFO PEMBAYARAN (XENDIT BUTTON) */}
            {orderStatus === 'pending' && order.payment_url && (
              <div className="mb-8 p-6 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-[#3A5034] font-bold">Menunggu Pembayaran</p>
                  <p className="text-xs text-[#5A665A]">Silakan selesaikan pembayaran agar pesanan segera diproses.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPaymentSelection(true)}
                  className="w-full sm:w-auto px-8 py-3 bg-[#D4A373] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:bg-[#b0865c] transition-all text-center cursor-pointer"
                >
                  Bayar Sekarang
                </button>
              </div>
            )}

            {/* INFO TRACKING (BITESHIP) */}
            {order.tracking && (
              <div className="mb-8 p-6 bg-[#F3EFE4]/30 border border-[#EAE6D9] rounded-2xl">
                <p className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Truck size={16} className="text-[#D4A373]"/> Informasi Pelacakan
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#5A665A] uppercase font-bold">Nomor Resi</p>
                    <p className="font-black text-[#3A5034] tracking-wider">{order.tracking.waybill_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#5A665A] uppercase font-bold">Status Paket</p>
                    <p className="font-bold text-[#2C352D] capitalize">{order.tracking.status}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#EAE6D9]">
                  <a 
                    href={order.tracking.link} 
                    target="_blank" 
                    className="text-xs font-bold text-[#D4A373] hover:underline flex items-center gap-1"
                  >
                    Lihat Dokumen Pengiriman & Histori Lengkap
                  </a>
                </div>
              </div>
            )}

            {/* Info Resi & Invoice */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pb-8 border-b border-[#EAE6D9]">
              <div>
                <p className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Receipt size={16} className="text-[#D4A373]"/> No. Invoice
                </p>
                <p className="text-[#2C352D] font-medium">{order.invoice_no || order.id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-[#D4A373]"/> Alamat Pengiriman
                </p>
                <p className="text-[#2C352D] text-sm leading-relaxed max-w-xs">{order.address}</p>
                <p className="text-[#5A665A] text-sm mt-1 font-medium">{order.customer || order.user?.name}</p>
                {order.is_dropship && (
                  <p className="text-xs text-orange-600 mt-2 font-bold flex items-center gap-1">
                    🚀 Dikirim via Dropshipper: {order.dropshipper_name || "-"}
                  </p>
                )}
              </div>
            </div>

            {/* List Produk & Tombol Ulasan */}
            <div className="py-8 border-b border-[#EAE6D9]">
              <p className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Package size={16} className="text-[#D4A373]"/> Rincian Produk
              </p>
              <div className="space-y-6">
                {orderItems.map((item: any, idx: number) => {
                  const itemQty = Number(item.quantity || item.qty || 0);
                  const itemPrice = Number(item.price || 0);
                  const itemName = item.product?.name || item.name || "Produk";
                  const isItemDropship = order.is_dropship && item.product?.is_dropship_enabled && itemQty >= (item.product?.dropship_min_qty || 1);

                  return (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="font-semibold text-[#2C352D] flex items-center gap-2">
                          {itemName}
                          {isItemDropship && (
                            <span className="inline-block text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                              Dropship
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-[#5A665A] mt-1">{itemQty} x {formatIDR(itemPrice)}</p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                        <p className="font-bold text-[#3A5034]">{formatIDR(itemQty * itemPrice)}</p>
                        
                        {/* ❌ Tombol Review (Hanya muncul jika status delivered) ❌ */}
                        {(orderStatus === 'delivered' || orderStatus === 'completed') && (
                          <button 
                            onClick={() => {
                              setSelectedProductToReview({ id: item.product_id || item.id, name: itemName });
                              setIsReviewModalOpen(true);
                            }}
                            className="text-xs font-bold bg-orange-50 text-[#E65100] border border-orange-200 px-4 py-2 rounded-xl hover:bg-[#E65100] hover:text-white transition-all shadow-sm w-full sm:w-auto"
                          >
                            Nilai Produk
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="pt-8">
              {(() => {
                const subtotal = orderItems.reduce((acc: number, item: any) => {
                  const q = Number(item.quantity || item.qty || 0);
                  const p = Number(item.price || 0);
                  return acc + (p * q);
                }, 0);
                const ongkir = Number(order.shipping_cost || 0);
                const discount = Number(order.discount_amount || 0);
                const promoCode = order.promotion?.code;

                // Hitung Diskon Dropship
                let dropshipDiscount = 0;
                if (order.is_dropship) {
                  dropshipDiscount = orderItems.reduce((acc: number, item: any) => {
                    const prod = item.product;
                    const q = Number(item.quantity || item.qty || 0);
                    if (prod && prod.is_dropship_enabled && q >= (prod.dropship_min_qty || 1)) {
                      let discountVal = 0;
                      const price = Number(item.price || 0);
                      if (prod.dropship_discount_type === 'percent') {
                        discountVal = (price * ((prod.dropship_discount_value || 0) / 100)) * q;
                      } else if (prod.dropship_discount_type === 'fixed') {
                        discountVal = (prod.dropship_discount_value || 0) * q;
                      }
                      return acc + discountVal;
                    }
                    return acc;
                  }, 0);
                }

                return (
                  <div className="space-y-3 mb-6 border-b border-[#EAE6D9] pb-6">
                    <div className="flex justify-between items-center text-sm text-[#5A665A]">
                      <p>Subtotal Produk</p>
                      <p className="font-semibold text-[#2C352D]">{formatIDR(subtotal)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm text-[#5A665A]">
                      <p>Ongkos Kirim</p>
                      <p className="font-semibold text-[#2C352D]">{formatIDR(ongkir)}</p>
                    </div>
                    {dropshipDiscount > 0 && (
                      <div className="flex justify-between items-center text-sm text-orange-600">
                        <p>Diskon Dropship</p>
                        <p className="font-semibold">- {formatIDR(dropshipDiscount)}</p>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <p>Diskon Promo {promoCode && `(${promoCode})`}</p>
                        <p className="font-semibold">- {formatIDR(discount)}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-[#5A665A]">
                      <p>Metode Pembayaran</p>
                      <p className="font-semibold text-[#2C352D] uppercase">
                        {(order.payment_method || order.method || "Transfer Bank").toString().replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between items-center p-4 bg-[#FDFCF8] rounded-2xl border border-[#EAE6D9]">
                <p className="font-bold text-[#2C352D]">Total Pembayaran</p>
                <p className="text-2xl font-bold text-[#3A5034] tracking-tight">{formatIDR(orderTotal)}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RENDER MODAL ULASAN */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedProductToReview(null);
        }}
        orderId={order.invoice_no || order.id}
        productName={selectedProductToReview?.name || ""}
        onSubmitReview={handleReviewSubmit}
      />

    </div>
  );
}