import React, { useState, useRef } from 'react';
import { Star, X, Image as ImageIcon, Send, Loader2, Trash2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | number;
  productName: string;
  onSubmitReview: (reviewData: { rating: number; comment: string; images: File[] }) => Promise<void>;
}

export default function ReviewModal({ isOpen, onClose, orderId, productName, onSubmitReview }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Referensi untuk memicu input file yang disembunyikan
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handler untuk menambah foto (Maksimal 3 foto)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles].slice(0, 3)); // Batasi max 3 foto ala Shopee
    }
  };

  // Handler untuk menghapus preview foto
  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Mohon berikan bintang penilaian terlebih dahulu ya!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReview({ rating, comment, images });
      setRating(0);
      setComment('');
      setImages([]);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-[#FDFCF8] w-full max-w-lg rounded-[2rem] p-6 md:p-8 shadow-2xl border border-[#EAE6D9] animate-in fade-in zoom-in duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#2C352D] font-playfair">Nilai Produk</h3>
            <p className="text-xs text-[#5A665A] mt-1 line-clamp-1">Pesanan #{orderId} - {productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#EAE6D9] rounded-xl text-[#5A665A] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section Bintang */}
          <div className="flex flex-col items-center justify-center py-4 bg-white rounded-2xl border border-[#EAE6D9] shadow-sm">
            <span className="text-sm font-bold text-[#2C352D] mb-3">Bagaimana kualitas produk ini?</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star size={36} className={`transition-colors duration-200 ${star <= (hoverRating || rating) ? "fill-[#E65100] text-[#E65100]" : "fill-slate-100 text-slate-200"}`} />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-[#E65100] mt-3 h-4">
              {rating === 1 && "Sangat Buruk 😞"}
              {rating === 2 && "Buruk 😕"}
              {rating === 3 && "Cukup 😐"}
              {rating === 4 && "Bagus 🙂"}
              {rating === 5 && "Sangat Bagus! 😍"}
            </span>
          </div>

          {/* Section Komentar */}
          <div>
            <label className="text-[10px] font-black text-[#5A665A] uppercase tracking-widest block mb-2">Tulis Ulasan Anda (Opsional)</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan kepuasanmu atau kualitas barang ini..."
              className="w-full p-4 bg-white border border-[#EAE6D9] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#E65100]/20 focus:border-[#E65100] transition-all resize-none placeholder:text-slate-400 text-[#2C352D]"
            ></textarea>
          </div>

          {/* Section Upload Foto */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-[10px] font-black text-[#5A665A] uppercase tracking-widest block">Tambahkan Foto (Opsional)</label>
              <span className="text-[10px] text-slate-400 font-bold">{images.length}/3 Foto</span>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              {/* Tombol Tambah (Hilang kalau sudah 3 foto) */}
              {images.length < 3 && (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 bg-white border-2 border-dashed border-[#EAE6D9] rounded-xl flex flex-col items-center justify-center text-[#5A665A] hover:bg-orange-50 hover:border-[#E65100] hover:text-[#E65100] transition-all"
                >
                  <ImageIcon size={20} className="mb-1" />
                  <span className="text-[9px] font-bold">Tambah</span>
                </button>
              )}

              {/* Input File Tersembunyi */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                multiple 
                className="hidden" 
              />

              {/* Preview Foto */}
              {images.map((file, index) => (
                <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#EAE6D9] group">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Kirim */}
          <button type="submit" disabled={isSubmitting || rating === 0} className="w-full py-4 bg-[#3A5034] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#2C352D] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> MENGIRIM...</> : <><Send size={16} /> KIRIM ULASAN</>}
          </button>
        </form>
      </div>
    </div>
  );
}