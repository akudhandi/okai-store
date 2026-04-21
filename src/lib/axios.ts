import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api", 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true, 
});

// INTERCEPTOR AKTIF: Otomatis bawa Token ke setiap API yang butuh Login!
axiosInstance.interceptors.request.use((config) => {
  // Hanya jalan di client-side (browser)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem('kambi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosInstance;