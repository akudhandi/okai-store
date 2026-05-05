"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Receipt, Package, Truck, Loader2 } from "lucide-react";
import axiosInstance from "../../../lib/axios";

interface OrderDetail {
  id: string;
  invoice_no: string;
  status: string;
  date: string;
  total: number;
  method: string;
  address: string;
  customer: string;
  items: Array<{ id: number; name: string; qty: number; price: number }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

            {/* List Produk */}
            <div className="py-8 border-b border-[#EAE6D9]">
              <p className="text-xs font-bold text-[#5A665A] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Package size={16} className="text-[#D4A373]"/> Rincian Produk
              </p>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-[#2C352D]">{item.name}</p>
                      <p className="text-sm text-[#5A665A]">{item.qty} x {formatIDR(item.price)}</p>
                    </div>
                    <p className="font-bold text-[#3A5034]">{formatIDR(item.qty * item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="pt-8">
              
              {/* Hitung subtotal dinamis dari barang */}
              {(() => {
                const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
                const ongkir = order.total - subtotal;

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
                    <div className="flex justify-between items-center text-sm text-[#5A665A]">
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
    </div>
  );
}