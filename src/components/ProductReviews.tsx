import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Loader2 } from 'lucide-react';
import axiosInstance from '../lib/axios'; // Sesuaikan path-nya

interface Review {
  id: number;
  user: { name: string }; // Asumsi backend mengembalikan relasi user
  rating: number;
  comment: string | null;
  images: string[] | null;
  admin_reply: string | null;
  created_at: string;
}

export default function ProductReviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Asumsi kamu/Naufal bikin endpoint ini di Laravel
        const response = await axiosInstance.get(`/products/${productId}/reviews`);
        if (response.data.success) {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil ulasan", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) fetchReviews();
  }, [productId]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star key={index} size={14} className={`${index < rating ? "fill-orange-400 text-orange-400" : "fill-slate-100 text-slate-200"}`} />
    ));
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-orange-500" /></div>;

  if (reviews.length === 0) return (
    <div className="bg-white rounded-[2rem] p-10 border border-[#EAE6D9] shadow-sm mt-12 text-center">
      <MessageSquare size={40} className="mx-auto text-slate-300 mb-4" />
      <p className="text-[#5A665A] font-medium">Belum ada ulasan untuk produk ini. Jadilah yang pertama!</p>
    </div>
  );

  const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-[#EAE6D9] shadow-sm mt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-orange-100 text-[#E65100] rounded-xl"><MessageSquare size={20} /></div>
        <h3 className="text-xl font-bold text-[#2C352D]">Ulasan Pembeli</h3>
      </div>

      <div className="bg-[#F9F8F3] border border-[#EAE6D9] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10 mb-10">
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <div className="flex items-end gap-2 text-[#E65100]">
            <span className="text-5xl font-black">{averageRating}</span>
            <span className="text-xl font-bold opacity-40 mb-1">/ 5</span>
          </div>
          <div className="flex gap-1.5 mt-3">{renderStars(Math.round(parseFloat(averageRating)))}</div>
          <p className="text-xs text-[#5A665A] mt-3 font-medium">Dari {reviews.length} ulasan valid</p>
        </div>
      </div>

      <div className="divide-y divide-[#EAE6D9]/50">
        {reviews.map((review) => (
          <div key={review.id} className="py-8 first:pt-0 last:pb-0">
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-full bg-[#3A5034]/10 text-[#3A5034] font-bold flex items-center justify-center shrink-0 border border-[#3A5034]/20">
                {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-[#2C352D]">{review.user?.name || 'Anonim'}</span>
                  <span className="text-[11px] text-[#5A665A]">{new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div className="flex gap-1 mt-1 mb-4">{renderStars(review.rating)}</div>
                <p className="text-[#5A665A] text-sm leading-relaxed mb-4">{review.comment}</p>

                {/* Tampilkan Foto Jika Ada */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-3 mb-4">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#EAE6D9] cursor-pointer">
                        <img src={img} alt="Review" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Tampilkan Balasan Admin Jika Adaa */}
{review.admin_reply && (
  <div className="mt-4 bg-[#F3EFE4]/50 p-4 rounded-2xl border-l-4 border-[#D4A373]">
    <div className="flex items-center gap-2 mb-1">
      <span className="font-black text-[10px] text-[#D4A373] uppercase tracking-widest">Admin KAMBI</span>
    </div>
    <p className="text-[#5A665A] text-sm italic">"{review.admin_reply}"</p>
  </div>
)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}