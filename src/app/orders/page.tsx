"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Clock, Truck, CheckCircle2, ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import axiosInstance from "../../lib/axios"; // ✅ Import Axios sudah dimasukkan

// ✅ Mendefinisikan tipe data agar TypeScript tidak protes (Error 'any' type)
interface OrderItem {
  id: number;
  name: string;
  qty: number;
  price: number;
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

export default function OrdersPage() {
  const router = useRouter();
  
  // ✅ Semua state sudah dideklarasikan dengan benar
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("semua");
  const [orders, setOrders] = useState<Order[]>([]);

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
    switch (status) {
      case 'pending': return { label: 'Menunggu Pembayaran', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Clock };
      case 'processing': return { label: 'Diproses', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Package };
      case 'shipped': return { label: 'Dikirim', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck };
      case 'delivered': return { label: 'Selesai', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 };
      case 'completed': return { label: 'Selesai', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 };
      default: return { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Package };
    }
  };

  // ✅ Mengganti 'mockOrders' dengan state 'orders' yang didapat dari Database
  const filteredOrders = activeTab === "semua" 
    ? orders 
    : orders.filter((order) => order.status === activeTab);

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

        {/* TABS KATEGORI STATUS */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 hide-scrollbar">
          {/* Menambahkan 'delivered' karena di screenshot DB Akang statusnya delivered */}
          {['semua', 'pending', 'processing', 'shipped', 'delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                activeTab === tab 
                ? 'bg-[#3A5034] text-white border-[#3A5034] shadow-md' 
                : 'bg-white text-[#5A665A] border-[#EAE6D9] hover:border-[#D4A373]'
              }`}
            >
              {tab === 'semua' ? 'Semua Pesanan' : getStatusConfig(tab).label}
            </button>
          ))}
        </div>

        {/* LIST PESANAN */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            // ✅ Mengganti rounded-[2rem] menjadi rounded-4xl sesuai saran Tailwind
            <div className="bg-white rounded-4xl border border-[#EAE6D9] p-12 text-center text-[#5A665A]">
              <Package size={48} className="mx-auto mb-4 text-[#EAE6D9]" />
              <p className="font-medium text-lg text-[#2C352D]">Belum ada pesanan</p>
              <p className="font-light text-sm">Tidak ada transaksi untuk status ini.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const StatusIcon = getStatusConfig(order.status).icon;
              
              return (
                // ✅ Mengganti rounded-[2rem] menjadi rounded-4xl
                <div key={order.id} className="bg-white rounded-4xl border border-[#EAE6D9] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Header Card */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE6D9] pb-4 mb-6">
                    <div>
                      <p className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-1">{order.date}</p>
                      <p className="text-sm font-medium text-[#2C352D]">{order.id}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusConfig(order.status).color}`}>
                      <StatusIcon size={14} /> {getStatusConfig(order.status).label}
                    </div>
                  </div>

                  {/* Produk Preview */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#F3EFE4] rounded-xl flex items-center justify-center shrink-0 border border-[#EAE6D9]">
                      <span className="text-[#D4A373] font-bold font-playfair text-xs">SUSU</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#2C352D] line-clamp-1">{order.items[0]?.name || 'Produk'}</h4>
                      <p className="text-sm text-[#5A665A]">{order.items[0]?.qty || 0} x {formatIDR(order.items[0]?.price || 0)}</p>
                      {order.items.length > 1 && (
                        <p className="text-xs text-[#D4A373] mt-1 font-medium italic">
                          + {order.items.length - 1} produk lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-4 border-t border-[#EAE6D9]">
                    <div>
                      <p className="text-xs text-[#5A665A] mb-1">Total Belanja</p>
                      <p className="text-lg font-bold text-[#3A5034]">{formatIDR(order.total)}</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-[#FDFCF8] text-[#3A5034] border border-[#EAE6D9] hover:border-[#D4A373] px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-white">
                      Lihat Detail <ChevronRight size={16} />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}