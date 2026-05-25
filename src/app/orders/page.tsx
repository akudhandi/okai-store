"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Clock, Truck, CheckCircle2, ArrowLeft, Loader2, ChevronRight, Star } from "lucide-react";
import axiosInstance from "../../lib/axios";
import ReviewModal from "../../components/ReviewModal";

interface OrderItem {
  id: number;
  name: string;
  qty: number;
  price: number;
  is_reviewed?: boolean; // ✅ Tambahan flag sudah dinilai dari Backend
}

interface Order {
  id: string;
  raw_id: number;
  customer: string;
  items: OrderItem[];
  total: number;
  method: string;
  status: string;
  date: string;
}

const TABS = [
  { id: 'semua', label: 'Semua Pesanan' },
  { id: 'pending', label: 'Menunggu Pembayaran' },
  { id: 'shipped', label: 'Dikirim' }, 
  { id: 'delivered', label: 'Selesai' },
  { id: 'butuh_penilaian', label: 'Butuh Penilaian' }
];

export default function OrdersPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("semua");
  const [orders, setOrders] = useState<Order[]>([]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ orderId: string; productId: number; name: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("kambi_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("/orders");
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil pesanan", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { label: 'Menunggu Pembayaran', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Clock };
      case 'paid': return { label: 'Diproses', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Package };
      case 'shipped': return { label: 'Dikirim', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck };
      case 'delivered': return { label: 'Selesai', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 };
      default: return { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Package };
    }
  };

  // ✅ LOGIKA KEDALUWARSA ULASAN & CEK SUDAH DINILAI
  const canBeReviewed = (orderDateStr: string, status: string, isReviewed?: boolean) => {
    if (isReviewed) return false; // Kalau sudah dinilai, jangan munculkan tombol
    if (status.toLowerCase() !== "delivered") return false;

    const completedDate = new Date(orderDateStr);
    if (isNaN(completedDate.getTime())) return true; 

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - completedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 30;
  };

  // ✅ LOGIKA FILTERING TAB "BUTUH PENILAIAN"
  const filteredOrders = orders.filter((order) => {
    const dbStatus = order.status.toLowerCase();
    
    if (activeTab === "semua") return true;
    
    if (activeTab === "butuh_penilaian") {
      // Pastikan order ini masih punya minimal 1 barang yang belum dinilai
      return order.items.some(item => canBeReviewed(order.date, order.status, item.is_reviewed));
    }
    
    if (activeTab === "shipped") return dbStatus === "paid" || dbStatus === "shipped";
    
    return dbStatus === activeTab;
  });

  const handleReviewSubmit = async (reviewData: { rating: number; comment: string; images: File[] }) => {
    try {
      const formData = new FormData();
      formData.append("order_id", selectedProduct?.orderId || "");
      formData.append("product_id", selectedProduct?.productId.toString() || "");
      formData.append("rating", reviewData.rating.toString());
      formData.append("comment", reviewData.comment);

      reviewData.images.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      const response = await axiosInstance.post("/reviews", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("Ulasan Anda berhasil dikirim! Terima kasih.");
        window.location.reload(); 
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal mengirim ulasan. Silakan coba lagi.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#D4A373]" size={40}/></div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/profile" className="inline-flex items-center gap-2 text-[#5A665A] hover:text-[#D4A373] transition-colors mb-8 font-medium text-sm">
          <ArrowLeft size={16} /> Kembali ke Profil
        </Link>

        <h1 className="text-3xl font-semibold text-[#2C352D] font-playfair mb-8">Riwayat Pesanan</h1>

        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-2 ${
                activeTab === tab.id 
                ? 'bg-[#3A5034] text-white border-[#3A5034] shadow-md' 
                : 'bg-white text-[#5A665A] border-[#EAE6D9] hover:border-[#D4A373]'
              }`}
            >
              {tab.id === 'butuh_penilaian' && <Star size={14} className={activeTab === tab.id ? "text-orange-300 fill-orange-300" : "text-orange-500 fill-orange-500"} />}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-4xl border border-[#EAE6D9] p-12 text-center text-[#5A665A]">
              <Package size={48} className="mx-auto mb-4 text-[#EAE6D9]" />
              <p className="font-medium text-lg text-[#2C352D]">Belum ada pesanan</p>
              <p className="font-light text-sm">
                {activeTab === 'butuh_penilaian' ? "Hore! Semua pesanan sudah Anda nilai." : "Tidak ada transaksi untuk status ini."}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const StatusIcon = getStatusConfig(order.status).icon;
              
              return (
                <div key={order.id} className="bg-white rounded-4xl border border-[#EAE6D9] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE6D9] pb-4 mb-6">
                    <div>
                      <p className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-1">{order.date}</p>
                      <p className="text-sm font-medium text-[#2C352D]">{order.id}</p>
                    </div>
                    <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusConfig(order.status).color}`}>
                      <StatusIcon size={14} /> {getStatusConfig(order.status).label}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-[#F3EFE4] rounded-xl flex items-center justify-center shrink-0 border border-[#EAE6D9]">
                            <span className="text-[#D4A373] font-bold font-playfair text-xs uppercase">ITEM</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#2C352D] line-clamp-1">{item.name}</h4>
                            <p className="text-sm text-[#5A665A]">{item.qty} x {formatIDR(item.price)}</p>
                          </div>
                        </div>

                        {/* ✅ PERUBAHAN TOMBOL TELAH DINILAI */}
                        {item.is_reviewed ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold w-full sm:w-auto text-center flex items-center justify-center gap-1.5 cursor-not-allowed"
                          >
                            <CheckCircle2 size={14} className="text-green-500" /> Telah Dinilai
                          </button>
                        ) : (
                          canBeReviewed(order.date, order.status, item.is_reviewed) && (
                            <button
                              onClick={() => {
                                setSelectedProduct({ orderId: order.raw_id.toString(), productId: item.id, name: item.name });
                                setIsReviewModalOpen(true);
                              }}
                              className="px-4 py-2 bg-orange-50 text-[#E65100] border border-orange-200 hover:bg-[#E65100] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap w-full sm:w-auto text-center flex items-center justify-center gap-1.5"
                            >
                              <Star size={14} className="fill-current" /> Nilai Produk
                            </button>
                          )
                        )}

                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-4 border-t border-[#EAE6D9]">
                    <div>
                      <p className="text-xs text-[#5A665A] mb-1">Total Belanja</p>
                      <p className="text-lg font-bold text-[#3A5034]">{formatIDR(order.total)}</p>
                    </div>
                    <Link href={`/orders/${order.raw_id}`} className="flex items-center justify-center gap-2 bg-[#FDFCF8] text-[#3A5034] border border-[#EAE6D9] hover:border-[#D4A373] px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-white">
                      Lihat Detail <ChevronRight size={16} />
                    </Link>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedProduct(null);
        }}
        orderId={selectedProduct?.orderId || ""}
        productName={selectedProduct?.name || ""}
        onSubmitReview={handleReviewSubmit}
      />
      
    </div>
  );
}