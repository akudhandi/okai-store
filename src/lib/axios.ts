import axios from "axios";

// Membuat instance axios khusus untuk E-Commerce
const axiosInstance = axios.create({
  // Ganti port 8000 jika Laravel kamu jalan di port lain
  baseURL: "http://localhost:8000/api", 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  // Izinkan pengiriman cookies/session dari Laravel Sanctum (Penting untuk Auth!)
  withCredentials: true, 
});

// Interceptor untuk menyisipkan Token (Jika pakai Sanctum/JWT)
axiosInstance.interceptors.request.use((config) => {
  // Nanti kita akan ambil token dari localStorage / cookies di sini
  // const token = localStorage.getItem('kambi_token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export default axiosInstance;