// src/lib/cart.ts
import axiosInstance from "./axios";

// Sesuaikan interface dengan struktur relasi tabel Carts & Products dari backend
export interface CartItem {
  id: number;         // ID dari tabel carts (Primary Key)
  product_id: number; // ID dari tabel products
  qty: number;
  product: {          // Data produk hasil JOIN / Eloquent relasi dari backend
    slug: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string;
  };
}

// Pastikan tipe CartItem sudah terdefinisi di file kamu
// import axiosInstance from "./axios";

export const getCartDB = async (): Promise<CartItem[]> => {
  try {
    const response = await axiosInstance.get("/carts");
    return response.data.data || [];
  } catch (error: any) {
    // Tangkap error 401 secara spesifik
    if (error.response && error.response.status === 401) {
      console.warn("Sesi login kadaluarsa. Mengabaikan penarikan keranjang.");
      
      // Opsional: Kamu bisa otomatis menghapus token yang sudah basi di sini
      // localStorage.removeItem("kambi_token");
      // localStorage.removeItem("kambi_user");
      
      return []; // Return array kosong agar tidak membuat aplikasi crash
    }
    
    console.error("Gagal mengambil keranjang:", error);
    return []; // Pastikan selalu mengembalikan array
  }
};

// 2. Tambah barang ke keranjang Database
export const addToCartDB = async (product_id: number, qty: number) => {
  const response = await axiosInstance.post("/carts", { product_id, qty });
  window.dispatchEvent(new Event("cartUpdated")); // Update indikator angka di Navbar
  return response.data;
};

// 3. Update jumlah (qty) barang
export const updateCartQtyDB = async (cart_id: number, qty: number) => {
  const response = await axiosInstance.put(`/carts/${cart_id}`, { qty });
  window.dispatchEvent(new Event("cartUpdated"));
  return response.data;
};

// 4. Hapus barang dari Database
export const removeFromCartDB = async (cart_id: number) => {
  const response = await axiosInstance.delete(`/carts/${cart_id}`);
  window.dispatchEvent(new Event("cartUpdated"));
  return response.data;
};