"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, Package, ArrowRightLeft, Copy, CheckCircle2, 
  TrendingUp, Link as LinkIcon, ChevronRight, Loader2, Plus, Trash2, Store
} from "lucide-react";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";

export default function AffiliateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  
  // STATE SEMENTARA UNTUK ETALASE (Nanti diganti pakai data API)
  const [myShowcase, setMyShowcase] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statusRes = await api.get("/user/affiliate-status");
        if (statusRes.data.success) {
          setAffiliateData(statusRes.data.data);
        }

        const productsRes = await api.get("/affiliate/available-products");
        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatIDR = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const handleCopyLink = (id: number | string, isCode = false) => {
    let textToCopy = "";
    if (isCode) {
      textToCopy = affiliateData?.affiliate_code || "";
    } else {
      textToCopy = `${window.location.origin}/product/${id}?ref=${affiliateData?.affiliate_code}`;
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- FUNGSI MOCKUP ETALASE (SEMENTARA) ---
  const addToShowcase = (product: any) => {
    if (!myShowcase.find((p) => p.id === product.id)) {
      setMyShowcase([...myShowcase, product]);
      // Nanti di sini dikasih fungsi API post ke backend
    }
  };

  const removeFromShowcase = (productId: number) => {
    setMyShowcase(myShowcase.filter((p) => p.id !== productId));
    // Nanti di sini dikasih fungsi API delete ke backend
  };

  const isProductInShowcase = (productId: number) => {
    return myShowcase.some((p) => p.id === productId);
  };
  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#FDFCF8]">
        <Loader2 className="animate-spin text-[#D4A373] mb-4" size={48} />
        <p className="text-[#5A665A] font-medium tracking-wide">Menyiapkan Dashboard Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-8 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <span className="px-3 py-1.5 bg-[#D4A373]/20 text-[#D4A373] rounded-md text-xs font-bold uppercase tracking-widest mb-4 inline-block">
              Mitra Aktif
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2C352D] font-playfair tracking-tight mb-2">
              Dashboard <span className="text-[#D4A373] italic">Afiliasi.</span>
            </h1>
            <p className="text-[#5A665A] font-light">Halo, {affiliateData?.full_name || 'Mitra'}. Pantau performa Anda di sini.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE6D9] shadow-sm flex items-center gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#5A665A] uppercase tracking-widest mb-1">Kode Referral Anda</p>
              <p className="text-lg font-bold text-[#2C352D]">{affiliateData?.affiliate_code || "---"}</p>
            </div>
            <button 
              onClick={() => handleCopyLink('code', true)}
              className="p-3 bg-[#F3EFE4] text-[#D4A373] rounded-xl hover:bg-[#D4A373] hover:text-white transition-all"
            >
              {copiedId === 'code' ? <CheckCircle2 size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION BARU */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-white p-2 rounded-2xl border border-[#EAE6D9] shadow-sm">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<TrendingUp size={18}/>} label="Ringkasan" />
          <TabButton active={activeTab === "marketplace"} onClick={() => setActiveTab("marketplace")} icon={<Package size={18}/>} label="Bursa Produk" />
          <TabButton active={activeTab === "showcase"} onClick={() => setActiveTab("showcase")} icon={<Store size={18}/>} label="Etalase Saya" />
          <TabButton active={activeTab === "withdraw"} onClick={() => setActiveTab("withdraw")} icon={<ArrowRightLeft size={18}/>} label="Tarik Komisi" />
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Saldo Tersedia" value={formatIDR(0)} icon={<Wallet />} color="text-[#3A5034]" bg="bg-[#3A5034]/10" />
                <StatCard title="Total Komisi" value={formatIDR(0)} icon={<CheckCircle2 />} color="text-[#D4A373]" bg="bg-[#D4A373]/10" />
                <StatCard title="Total Klik Link" value="0 Klik" icon={<LinkIcon />} color="text-blue-600" bg="bg-blue-50" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
                   <h3 className="text-xl font-semibold text-[#2C352D] font-playfair mb-8">Performa 7 Hari Terakhir</h3>
                   <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={[{name: 'Sen', k: 0}, {name: 'Min', k: 0}]}>
                        <XAxis dataKey="name" hide />
                        <Tooltip formatter={(val: any) => formatIDR(Number(val))} />
                        <Area type="monotone" dataKey="k" stroke="#D4A373" fill="#D4A373" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
                  <h3 className="text-xl font-semibold text-[#2C352D] font-playfair mb-6">Aktivitas Terakhir</h3>
                  <p className="text-sm text-[#5A665A] italic text-center py-10">Belum ada aktivitas transaksi.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BURSA PRODUK (SEMUA PRODUK DARI ADMIN) */}
          {activeTab === "marketplace" && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-semibold text-[#2C352D] font-playfair">Produk Tersedia ({products.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? products.map((prod: any) => {
                  const inShowcase = isProductInShowcase(prod.id);
                  return (
                    <div key={prod.id} className="bg-white rounded-[2rem] border border-[#EAE6D9] shadow-sm overflow-hidden group flex flex-col">
                      <div className="h-48 bg-[#F3EFE4] flex items-center justify-center relative shrink-0">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={48} className="text-[#D4A373]/50" />
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#D4A373] shadow-sm">
                          Komisi {prod.affiliate_commission || 15}%
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h4 className="font-bold text-[#2C352D] mb-2 line-clamp-2">{prod.name}</h4>
                        <p className="text-[#5A665A] font-medium mb-6 flex-1">{formatIDR(prod.price)}</p>
                        
                        <button 
                          onClick={() => addToShowcase(prod)}
                          disabled={inShowcase}
                          className={`w-full py-3 px-4 border rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold ${
                            inShowcase 
                            ? "bg-[#F3EFE4] border-[#EAE6D9] text-[#5A665A] cursor-not-allowed" 
                            : "bg-[#3A5034] border-[#3A5034] text-white hover:bg-[#2C352D] hover:shadow-lg"
                          }`}
                        >
                          {inShowcase ? (
                            <><CheckCircle2 size={18}/> Tersimpan di Etalase</>
                          ) : (
                            <><Plus size={18}/> Tambahkan ke Etalase</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-[#EAE6D9]">
                    <Package size={48} className="mx-auto text-[#EAE6D9] mb-4" />
                    <p className="text-[#5A665A]">Belum ada produk yang diaktifkan untuk afiliasi.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ETALASE SAYA (HANYA PRODUK YANG DIPILIH) */}
          {activeTab === "showcase" && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-semibold text-[#2C352D] font-playfair">Etalase Saya ({myShowcase.length})</h3>
                <p className="text-sm text-[#5A665A]">Pilih produk dari Bursa untuk ditambahkan ke sini.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myShowcase.length > 0 ? myShowcase.map((prod: any) => (
                  <div key={prod.id} className="bg-white rounded-[2rem] border border-[#EAE6D9] shadow-sm overflow-hidden group flex flex-col">
                    <div className="h-48 bg-[#F3EFE4] flex items-center justify-center relative shrink-0">
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={48} className="text-[#D4A373]/50" />
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#D4A373] shadow-sm">
                        Komisi {prod.affiliate_commission || 15}%
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="font-bold text-[#2C352D] mb-2 line-clamp-2">{prod.name}</h4>
                      <p className="text-[#5A665A] font-medium mb-6 flex-1">{formatIDR(prod.price)}</p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleCopyLink(prod.id)}
                          className="flex-1 py-3 px-4 bg-[#FDFCF8] border border-[#EAE6D9] rounded-xl flex items-center justify-center gap-2 hover:border-[#D4A373] hover:text-[#D4A373] transition-all text-sm font-bold text-[#5A665A]"
                        >
                          {copiedId === prod.id ? <CheckCircle2 size={18} className="text-green-600"/> : <LinkIcon size={18}/>} 
                          {copiedId === prod.id ? "Tersalin!" : "Salin Link"}
                        </button>
                        <button 
                          onClick={() => removeFromShowcase(prod.id)}
                          className="p-3 border border-[#EAE6D9] rounded-xl text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                          title="Hapus dari Etalase"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-[#EAE6D9]">
                    <Store size={48} className="mx-auto text-[#EAE6D9] mb-4" />
                    <p className="text-[#5A665A] mb-2">Etalase Anda masih kosong.</p>
                    <button onClick={() => setActiveTab("marketplace")} className="text-[#D4A373] font-bold text-sm hover:underline">
                      Cari produk di Bursa
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: WITHDRAW */}
          {activeTab === "withdraw" && (
             <div className="max-w-2xl mx-auto py-10 text-center">
                <Wallet size={64} className="mx-auto text-[#D4A373] mb-6 opacity-20" />
                <h3 className="text-2xl font-playfair text-[#2C352D] mb-2">Fitur Pencairan Dana</h3>
                <p className="text-[#5A665A] font-light">Kumpulkan komisi Anda minimal {formatIDR(50000)} untuk melakukan penarikan.</p>
             </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

// Komponen Reusable Tetap Sama
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${active ? "bg-[#2C352D] text-white shadow-md" : "text-[#5A665A] hover:bg-[#F3EFE4]"}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-[#EAE6D9] shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-[#5A665A] uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-xl font-bold text-[#2C352D]">{value}</h3>
      </div>
    </div>
  );
}