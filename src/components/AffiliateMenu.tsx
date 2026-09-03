"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/lib/axios"; 
import { Users } from "lucide-react";

export default function AffiliateMenu() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get("/user/affiliate-status");
        
        // 👇 UBAH DI BAGIAN INI (tambah .data satu lagi)
        if (response.data.success && response.data.data) {
          setStatus(response.data.data.status);
        }
      } catch (error) {
        console.error("Gagal mengecek status affiliate", error);
      } finally {
        setLoading(false);
      }
    };

    // Pastikan ngecek hanya kalau ada token login (opsional biar nggak error 401 kalau belum login)
    if (localStorage.getItem("kambi_token")) {
      checkStatus();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading || status !== "active") return null;

  return (
    <Link
      href="/affiliate-dashboard"
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#D4A373] bg-[#D4A373]/10 rounded-xl hover:bg-[#D4A373] hover:text-white transition-all border border-[#D4A373]/20"
    >
      <Users size={16} />
      <span>Dashboard Afiliasi</span>
    </Link>
  );
}