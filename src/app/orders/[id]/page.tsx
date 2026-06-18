"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Receipt, Package, Loader2, Truck } from "lucide-react";
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
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#D4A373]" size={40}/></div>;
  }

  if (!order) return null;

  // Normalisasi data dari backend (karena beda nama field)
  const orderTotal = Number(order.total_price || order.total || 0);
  const orderItems = order.items || [];
  const orderStatus = (order.status || "").toLowerCase();

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
                <a 
                  href={order.payment_url} 
                  target="_blank" 
                  className="w-full sm:w-auto px-8 py-3 bg-[#D4A373] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:bg-[#b0865c] transition-all text-center"
                >
                  Bayar Sekarang
                </a>
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

                  return (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="font-semibold text-[#2C352D]">{itemName}</p>
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