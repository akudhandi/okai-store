"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Heart, Star, TrendingUp, Link as LinkIcon, Wallet, Users } from "lucide-react";
// IMPORT MESIN ANIMASI 🚀
import { motion, Variants } from "framer-motion";
import AffiliateMenu from "@/components/AffiliateMenu";

function AffiliateTracker() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) localStorage.setItem("okai_affiliate_ref", ref);
  }, [searchParams]);
  return null;
}

// Tambahkan titik dua "Variants" agar TypeScript tidak protes
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="overflow-hidden">
      <Suspense fallback={null}><AffiliateTracker /></Suspense>

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 min-h-[90vh]">
        <div className="absolute inset-0 bg-linear-to-b from-[#FDFCF8] to-[#F3EFE4] -z-10 rounded-b-[4rem]"></div>
        
        <motion.div 
          className="flex-1 space-y-8 z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#EAE6D9]">
            <Leaf size={16} className="text-[#3A5034]" />
            <span className="text-[11px] font-bold text-[#5A665A] tracking-[0.15em] uppercase">100% Organik & Premium</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] text-[#2C352D] font-playfair tracking-tight">
            Lebih Sehat,<br />
            Lebih Mudah <span className="text-[#D4A373] italic">Dicerna.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg text-[#5A665A] leading-relaxed max-w-xl font-light">
            Tingkatkan imunitas dan penuhi nutrisi harian keluarga dengan kebaikan murni susu kambing etawa pilihan dari KAMBI. Tanpa bau prengus, nyaman di lambung.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/product/susu-kambing-original" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-[#3A5034] text-white rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300">
              Beli Sekarang <ArrowRight size={18} />
            </Link>
            <a href="#edukasi" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-transparent text-[#3A5034] rounded-full font-bold text-sm tracking-wide border-2 border-[#3A5034] hover:bg-[#3A5034] hover:text-white transition-all duration-300">
              Pelajari Manfaatnya
            </a>
          </motion.div>
        </motion.div>

        {/* Hero Image (Mengambang / Floating Effect) */}
        <motion.div 
          className="flex-1 relative w-full aspect-square max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 3 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-[#E8E1D3] rounded-full blur-3xl opacity-50"></div>
          {/* Animasi hover & floating infinite */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative h-full w-full bg-white rounded-[2.5rem] shadow-xl border border-white/50 flex flex-col items-center justify-center p-8 hover:rotate-0 transition-transform duration-500"
          >
            <div className="w-24 h-24 bg-[#FDFCF8] rounded-full flex items-center justify-center shadow-inner mb-6">
               <ShieldCheck size={40} className="text-[#D4A373]" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold text-[#2C352D] text-center font-playfair">KAMBI Etawa Premium</h3>
            <p className="text-sm text-[#5A665A] mt-2 font-medium tracking-wide">Box 200g (10 Sachet)</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. EDUKASI (Scroll Reveal) */}
      <section id="edukasi" className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-[#2C352D] font-playfair tracking-tight">Mengapa Memilih Susu Kambing?</h2>
          <p className="text-[#5A665A] max-w-2xl mx-auto text-lg font-light">Fakta nutrisi yang membuat susu kambing lebih unggul dari susu sapi biasa.</p>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { title: "Mudah Dicerna", desc: "Molekul lemak lebih kecil, sangat aman dan nyaman untuk pencernaan sensitif.", icon: <Heart /> },
            { title: "Kaya Nutrisi", desc: "Kalsium dan fosfor lebih tinggi, mendukung pertumbuhan tulang optimal.", icon: <ShieldCheck /> },
            { title: "Ramah Lambung", desc: "Tingkat keasaman mendekati ASI, tidak memicu asam lambung naik.", icon: <Leaf /> },
          ].map((item, idx) => (
            <motion.div key={idx} variants={fadeUp} className="bg-white p-10 rounded-3xl shadow-sm border border-[#EAE6D9]/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#F3EFE4] text-[#3A5034] rounded-2xl flex items-center justify-center mb-8">
                {item.icon}
              </div>
              <h3 className="text-2xl font-semibold text-[#2C352D] mb-4 font-playfair">{item.title}</h3>
              <p className="text-[#5A665A] leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. HIGHLIGHT PRODUK (Scroll Reveal) */}
      <section className="py-24 bg-[#F3EFE4]/40 border-y border-[#EAE6D9]/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold text-[#2C352D] mb-4 font-playfair tracking-tight">Varian Unggulan KAMBI</h2>
              <p className="text-[#5A665A] text-lg font-light">Pilih rasa favorit keluarga Anda, kebaikan murni di setiap seduhannya.</p>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#EAE6D9]/50 group hover:shadow-xl transition-all duration-300">
              <div className="w-full aspect-4/3 bg-[#FDFCF8] rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
                <span className="text-[#D4A373] text-5xl font-bold opacity-10 group-hover:scale-110 transition-transform duration-500 font-playfair">ORIGINAL</span>
              </div>
              <h3 className="text-2xl font-semibold text-[#2C352D] mb-3 font-playfair">KAMBI Premium Original</h3>
              <div className="flex gap-1 text-[#D4A373] mb-6"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/></div>
              <p className="text-2xl font-bold text-[#3A5034] mb-8 tracking-tight">{formatIDR(45000)}</p>
              <Link href="/product/susu-kambing-original" className="w-full flex justify-center py-4 bg-transparent text-[#3A5034] border-2 border-[#3A5034] rounded-xl font-bold tracking-wide hover:bg-[#3A5034] hover:text-white transition-colors">
                Beli Original
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#EAE6D9]/50 group hover:shadow-xl transition-all duration-300">
              <div className="w-full aspect-4/3 bg-[#FDFCF8] rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
                <span className="text-[#513627] text-5xl font-bold opacity-10 group-hover:scale-110 transition-transform duration-500 font-playfair">COKELAT</span>
              </div>
              <h3 className="text-2xl font-semibold text-[#2C352D] mb-3 font-playfair">KAMBI Premium Cokelat</h3>
              <div className="flex gap-1 text-[#D4A373] mb-6"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/></div>
              <p className="text-2xl font-bold text-[#3A5034] mb-8 tracking-tight">{formatIDR(50000)}</p>
              <Link href="/product/susu-kambing-cokelat" className="w-full flex justify-center py-4 bg-transparent text-[#3A5034] border-2 border-[#3A5034] rounded-xl font-bold tracking-wide hover:bg-[#3A5034] hover:text-white transition-colors">
                Beli Cokelat
              </Link>
            </motion.div>
            
            <motion.div variants={fadeUp} className="bg-[#3A5034] p-10 rounded-[2rem] shadow-lg text-white flex flex-col justify-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={120} /></motion.div>
              <h3 className="text-3xl font-semibold mb-4 relative z-10 font-playfair">Paket Sehat Keluarga</h3>
              <p className="text-[#EAE6D9] mb-10 font-light leading-relaxed relative z-10">Beli 4 Box varian apa saja, hemat hingga 15% + Gratis Ongkir ke seluruh Indonesia.</p>
              <Link href="/product/paket-keluarga" className="w-full flex justify-center items-center gap-2 py-4 bg-[#D4A373] text-white rounded-xl font-bold tracking-wide hover:bg-[#C08A45] transition-colors relative z-10">
                Lihat Paket Promo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. PROGRAM AFFILIATE DETAIL */}
      <section id="affiliate" className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gradient-to-br from-[#2C352D] to-[#3A5034] rounded-[3rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10 mb-16 text-center max-w-2xl mx-auto">
            <span className="px-4 py-2 bg-[#D4A373]/20 text-[#D4A373] rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">Peluang Kemitraan</span>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 font-playfair">Program Affiliate KAMBI.</h2>
            <p className="text-[#EAE6D9] font-light text-lg">Bagikan kebaikan sehatnya susu kambing, dan dapatkan komisi tambahan dari setiap pembelian yang berasal dari link Anda.</p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8 relative z-10 mb-16">
            <motion.div variants={fadeUp} className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
              <div className="w-14 h-14 bg-[#D4A373] rounded-2xl flex items-center justify-center mb-6"><Users size={28} className="text-white"/></div>
              <h3 className="text-xl font-bold mb-3 font-playfair">1. Daftar Mitra</h3>
              <p className="text-[#EAE6D9] font-light text-sm">Pendaftaran 100% gratis. Anda akan mendapatkan akses ke Dashboard Khusus Affiliate.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
              <div className="w-14 h-14 bg-[#D4A373] rounded-2xl flex items-center justify-center mb-6"><LinkIcon size={28} className="text-white"/></div>
              <h3 className="text-xl font-bold mb-3 font-playfair">2. Sebar Link Khusus</h3>
              <p className="text-[#EAE6D9] font-light text-sm">Bagikan link referal Anda (misal: /shop?ref=nama-anda) ke sosial media atau WhatsApp.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
              <div className="w-14 h-14 bg-[#D4A373] rounded-2xl flex items-center justify-center mb-6"><Wallet size={28} className="text-white"/></div>
              <h3 className="text-xl font-bold mb-3 font-playfair">3. Nikmati Komisi</h3>
              <p className="text-[#EAE6D9] font-light text-sm">Dapatkan komisi hingga 20% otomatis masuk ke akun Anda setiap kali ada pesanan sukses.</p>
            </motion.div>
          </motion.div>

          <div className="text-center relative z-10">
            <Link href="/register-affiliate" className="inline-flex justify-center items-center gap-2 px-10 py-4 bg-[#D4A373] text-white rounded-full font-bold tracking-wide hover:bg-[#C08A45] hover:scale-105 transition-all shadow-lg">
              Gabung Jadi Affiliate Sekarang
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 5. CLOSING CTA */}
      <section className="py-24 text-center px-4 bg-[#F3EFE4]/40 border-t border-[#EAE6D9]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#2C352D] mb-10 font-playfair tracking-tight">Mulai Hidup Sehat Hari Ini.</h2>
          <Link href="/shop" className="inline-flex justify-center items-center gap-2 px-12 py-5 bg-[#3A5034] text-white rounded-full font-bold tracking-wide shadow-lg hover:bg-[#2C352D] hover:-translate-y-1 transition-all duration-300">
            Lihat Semua Produk KAMBI
          </Link>
        </motion.div>
      </section>

    </div>
  );
}