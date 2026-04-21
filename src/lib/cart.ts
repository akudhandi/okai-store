// src/lib/cart.ts

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  qty: number;
  image_url: string | null;
  category: string;
}

// 1. Ambil isi keranjang saat ini
export const getCart = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const cart = localStorage.getItem("kambi_cart");
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

// 2. Tambah barang ke keranjang
export const addToCart = (item: CartItem) => {
  const cart = getCart();
  const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

  if (existingItemIndex > -1) {
    // Kalau barang sudah ada, tambahkan jumlahnya (qty)
    cart[existingItemIndex].qty += item.qty;
  } else {
    // Kalau barang baru, masukkan ke daftar
    cart.push(item);
  }

  localStorage.setItem("kambi_cart", JSON.stringify(cart));
  
  // Beritahu Navbar (dan komponen lain) bahwa keranjang baru saja diupdate!
  window.dispatchEvent(new Event("cartUpdated"));
};

// 3. Hapus barang
export const removeFromCart = (id: number) => {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== id);
  localStorage.setItem("kambi_cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cartUpdated"));
};

// 4. Hitung total qty (untuk angka merah di Navbar)
export const getCartTotalQty = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.qty, 0);
};