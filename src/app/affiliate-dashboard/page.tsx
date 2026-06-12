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
import toast from 'react-hot-toast';

export default function AffiliateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  
  // STATE UNTUK ETALASE (Sekarang akan membaca dari localStorage)
  const [myShowcase, setMyShowcase] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState("");

  const handleWithdraw = async (e: any) => {
    e.preventDefault(); // Mencegah halaman ke-refresh

    // Validasi sederhana
    if (Number(withdrawAmount) < 50000) {
      toast.error("Minimal penarikan adalah Rp 50.000");
      return;
    }
    if (!withdrawMethod || !withdrawAccount) {
      toast.error("Harap lengkapi metode pencairan dan nomor rekening/HP!");
      return;
    }

    try {
      const response = await api.post("/user/affiliate-withdraw", {
        amount: withdrawAmount,
        bank_name: withdrawMethod,
        account_number: withdrawAccount
      });

      if (response.data.success) {
        toast.success("Mantap! Permintaan penarikan berhasil dikirim ke Admin.");
        // Kosongkan form setelah sukses
        setWithdrawAmount("");
        setWithdrawMethod("");
        setWithdrawAccount("");
        
        // (Opsional) Kamu bisa panggil fungsi fetchData() lagi di sini 
        // untuk mengupdate angka saldo tersedia secara otomatis
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengajukan penarikan. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    // 1. Ambil data Etalase dari localStorage saat pertama kali halaman dimuat
    const savedShowcase = localStorage.getItem("kambi_affiliate_showcase");
    if (savedShowcase) {
      setMyShowcase(JSON.parse(savedShowcase));
    }

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

  // --- FUNGSI MENGELOLA ETALASE (Disimpan ke LocalStorage) ---
  const addToShowcase = (product: any) => {
    if (!myShowcase.find((p) => p.id === product.id)) {
      const updatedShowcase = [...myShowcase, product];
      setMyShowcase(updatedShowcase);
      
      // Simpan ke localStorage agar tidak hilang saat di-refresh
      localStorage.setItem("kambi_affiliate_showcase", JSON.stringify(updatedShowcase));
    }
  };

  const removeFromShowcase = (productId: number) => {
    const updatedShowcase = myShowcase.filter((p) => p.id !== productId);
    setMyShowcase(updatedShowcase);
    
    // Perbarui localStorage setelah produk dihapus
    localStorage.setItem("kambi_affiliate_showcase", JSON.stringify(updatedShowcase));
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
                <StatCard 
                  title="Saldo Tersedia" 
                  value={formatIDR(affiliateData?.available_balance || 0)} 
                  icon={<Wallet />} color="text-[#3A5034]" bg="bg-[#3A5034]/10" 
                />
                <StatCard 
                  title="Total Komisi" 
                  value={formatIDR(affiliateData?.total_commission || 0)} 
                  icon={<CheckCircle2 />} color="text-[#D4A373]" bg="bg-[#D4A373]/10" 
                />
                <StatCard 
                  title="Total Klik Link" 
                  value={`${affiliateData?.total_clicks || 0} Klik`} 
                  icon={<LinkIcon />} color="text-blue-600" bg="bg-blue-50" 
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
                   <h3 className="text-xl font-semibold text-[#2C352D] font-playfair mb-8">Performa 7 Hari Terakhir</h3>
                   <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart 
                        data={
                          // Mengecek apakah backend sudah mengirim data grafik mingguan
                          affiliateData?.weekly_chart_data && affiliateData.weekly_chart_data.length > 0 
                            ? affiliateData.weekly_chart_data 
                            : [
                                // Ini Fallback jika backend belum siap (minimal grafiknya rata dulu, nggak error)
                                {name: 'H-6', k: 0}, {name: 'H-5', k: 0}, {name: 'H-4', k: 0},
                                {name: 'H-3', k: 0}, {name: 'H-2', k: 0}, {name: 'H-1', k: 0},
                                {name: 'Hari Ini', k: affiliateData?.total_commission > 0 ? affiliateData.total_commission : 0}
                              ]
                        }
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5A665A' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          formatter={(val: any) => [formatIDR(Number(val)), "Komisi"]} 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="k" 
                          stroke="#3A5034" 
                          strokeWidth={3}
                          fill="#D4A373" 
                          fillOpacity={0.2} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                   </div>
                </div>
                {/* AKTIVITAS TERAKHIR */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[#EAE6D9] shadow-sm flex flex-col h-full">
            <h3 className="text-xl font-playfair font-semibold text-[#2C352D] mb-6">Aktivitas Terakhir</h3>
            
            <div className="flex-1 space-y-4">
              {affiliateData?.recent_activities && affiliateData.recent_activities.length > 0 ? (
                affiliateData.recent_activities.map((act: any) => (
                  <div key={act.id} className="flex items-start justify-between pb-4 border-b border-[#EAE6D9]/50 last:border-0 last:pb-0">
                    <div className="flex gap-3 items-start">
                      <div className={`mt-1 p-2 rounded-full ${act.type === 'commission' ? 'bg-[#3A5034]/10 text-[#3A5034]' : 'bg-[#D4A373]/10 text-[#D4A373]'}`}>
                        {/* Jika komisi icon hijau, jika penarikan icon dompet orange */}
                        {act.type === 'commission' ? <TrendingUp size={14} /> : <Wallet size={14} />}
                      </div>
                      <div>
                        <p className="font-bold text-[#2C352D] text-sm">{act.title}</p>
                        <p className="text-[11px] text-[#5A665A]">
                          {new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${act.type === 'commission' ? 'text-[#3A5034]' : 'text-[#2C352D]'}`}>
                        {act.type === 'commission' ? '+' : '-'} {formatIDR(act.amount)}
                      </p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${act.status === 'approved' ? 'text-green-600' : act.status === 'pending' ? 'text-orange-500' : 'text-gray-400'}`}>
                        {act.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 pt-8">
                  <p className="text-sm font-medium italic">Belum ada aktivitas transaksi.</p>
                </div>
              )}
            </div>
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
            <div className="max-w-2xl mx-auto py-8">
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[#EAE6D9] shadow-sm">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-[#D4A373]/10 text-[#D4A373] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wallet size={40} />
                  </div>
                  <h3 className="text-2xl font-playfair font-semibold text-[#2C352D] mb-2">Tarik Komisi</h3>
                  <p className="text-[#5A665A]">
                    Saldo yang bisa ditarik: <span className="font-bold text-[#3A5034]">{formatIDR(affiliateData?.available_balance || 0)}</span>
                  </p>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-[#5A665A] uppercase tracking-widest mb-2">Nominal Penarikan</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A665A] font-bold">Rp</span>
                      <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Min. 50.000"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#EAE6D9] bg-[#FDFCF8] focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5A665A] uppercase tracking-widest mb-2">Metode / Bank</label>
                      <select 
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl border border-[#EAE6D9] bg-[#FDFCF8] focus:outline-none focus:border-[#D4A373] transition-all font-medium"
                      >
                        <option value="">Pilih Tujuan...</option>
                        <option value="BCA">Transfer BCA</option>
                        <option value="MANDIRI">Transfer Mandiri</option>
                        <option value="GOPAY">Saldo GoPay</option>
                        <option value="DANA">Saldo DANA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5A665A] uppercase tracking-widest mb-2">No. Rekening / HP</label>
                      <input 
                        type="text" 
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                        placeholder="Contoh: 08123456789"
                        className="w-full px-4 py-4 rounded-xl border border-[#EAE6D9] bg-[#FDFCF8] focus:outline-none focus:border-[#D4A373] transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 mt-4 bg-[#3A5034] text-white rounded-xl font-bold hover:bg-[#2C352D] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    Ajukan Penarikan Sekarang
                  </button>
                </form>
              </div>
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