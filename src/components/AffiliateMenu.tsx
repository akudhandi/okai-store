"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/lib/axios"; // Sesuaikan dengan path axios kamu
import { Users } from "lucide-react";

export default function AffiliateMenu() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Memanggil API yang kita buat di Laravel tadi
        const response = await axios.get("/user/affiliate-status");
        if (response.data.success) {
          setStatus(response.data.status);
        }
      } catch (error) {
        console.error("Gagal mengecek status affiliate", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  // Jika masih loading atau status bukan 'active', jangan tampilkan apa-apa
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