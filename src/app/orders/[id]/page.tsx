"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
// 👇 IMPORT TRUCK SUDAH DIKEMBALIKAN 👇
import { ArrowLeft, MapPin, Receipt, Package, Loader2, Ticket, Truck } from "lucide-react";
import axiosInstance from "../../../lib/axios";
import ReviewModal from "../../../components/ReviewModal"; 

interface OrderDetail {
  id: string;
  raw_id: number;
  invoice_no: string;
  status: string;
  date: string;
  total: number;
  method: string;
  address: string;
  customer: string;
  payment_url?: string;
  discount_amount?: number; 
  promo_code?: string;      
  items: Array<{ id: number; name: string; qty: number; price: number }>;
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
  const [order, setOrder] = useState<OrderDetail | null>(null);
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
        alert("Pesanan tidak ditemukan atau akses ditolak.");
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [params.id, router]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // --- FUNGSI SUBMIT ULASAN (Menunggu API Backend) ---
  const handleReviewSubmit = async (reviewData: { rating: number; comment: string; images: File[] }) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Mengirim ulasan:", {
          order_id: order?.id,
          product_id: selectedProductToReview?.id,
          ...reviewData
        });
        alert("Terima kasih! Ulasan kamu berhasil disimpan.");
        resolve();
      }, 1000);
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#D4A373]" size={40}/></div>;
  }

  if (!order) return null;

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
              <h2 className="text-2xl font-bold font-playfair uppercase tracking-wider">{order.status}</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-white/70 text-sm font-medium mb-1">Tanggal Pembelian</p>
              <p className="font-semibold">{order.date}</p>
            </div>
          </div>

          <div className="p-8">

            {/* INFO PEMBAYARAN (XENDIT BUTTON) */}
            {order.status === 'pending' && order.payment_url && (
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
                <p className="text-[#5A665A] text-sm mt-1 font-medium">{order.customer}</p>
              </div>
            </div>

            {/* List Produk & Tombol Ulasan */}
            <div className="py-8 border-b border-[#EAE6D9]">
              <p className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Package size={16} className="text-[#D4A373]"/> Rincian Produk
              </p>
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-semibold text-[#2C352D]">{item.name}</p>
                      <p className="text-sm text-[#5A665A] mt-1">{item.qty} x {formatIDR(item.price)}</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                      <p className="font-bold text-[#3A5034]">{formatIDR(item.qty * item.price)}</p>
                      
                      {/* Tombol Review */}
                      {order.status.toLowerCase() === 'completed' && (
                        <button 
                          onClick={() => {
                            setSelectedProductToReview({ id: item.id, name: item.name });
                            setIsReviewModalOpen(true);
                          }}
                          className="text-xs font-bold bg-orange-50 text-[#E65100] border border-orange-200 px-4 py-2 rounded-xl hover:bg-[#E65100] hover:text-white transition-all shadow-sm w-full sm:w-auto"
                        >
                          Nilai Produk
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Pembayaran & Diskon */}
            <div className="pt-8">
              {(() => {
                // 👇 PASTIKAN SEMUA DI-CONVERT KE NUMBER DULU 👇
                const subtotal = order.items.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0);
                const discount = Number(order.discount_amount) || 0;
                const total = Number(order.total) || 0;
                
                // Hitung ongkir (Sekarang dijamin aman dari string concatenation)
                const ongkir = total - subtotal + discount;

                return (
                  <div className="space-y-3 mb-6 border-b border-[#EAE6D9] pb-6">
                    <div className="flex justify-between items-center text-sm text-[#5A665A]">
                      <p>Subtotal Produk</p>
                      <p className="font-semibold text-[#2C352D]">{formatIDR(subtotal)}</p>
                    </div>
                    
                    {/* Baris Khusus Diskon */}
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                        <p className="flex items-center gap-1">
                          <Ticket size={14}/> Diskon Promo {order.promo_code ? `(${order.promo_code})` : ''}
                        </p>
                        <p className="font-bold">- {formatIDR(discount)}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-[#5A665A]">
                      <p>Ongkos Kirim</p>
                      <p className="font-semibold text-[#2C352D]">{formatIDR(ongkir)}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-[#5A665A] pt-2">
                      <p>Metode Pembayaran</p>
                      <p className="font-semibold text-[#2C352D] uppercase">{order.method.replace('_', ' ')}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between items-center p-4 bg-[#FDFCF8] rounded-2xl border border-[#EAE6D9]">
                <p className="font-bold text-[#2C352D]">Total Pembayaran</p>
                <p className="text-2xl font-bold text-[#3A5034] tracking-tight">{formatIDR(order.total)}</p>
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