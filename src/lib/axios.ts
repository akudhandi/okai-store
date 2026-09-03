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

// DEDUPLIKASI REQUEST: Cache promise untuk /user/affiliate-status agar tidak dipanggil berulang-ulang
const originalGet = axiosInstance.get;
const promiseCache = new Map<string, Promise<any>>();

axiosInstance.get = function (url: string, config?: any) {
  const normalizedUrl = url.replace(/^\/|\/$/g, '');
  
  if (normalizedUrl === 'user/affiliate-status') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kambi_token') : null;
    if (!token) {
      return originalGet.call(this, url, config);
    }
    
    const cacheKey = `${normalizedUrl}:${token}`;
    
    if (!promiseCache.has(cacheKey)) {
      const promise = originalGet.call(this, url, config).catch((err) => {
        promiseCache.delete(cacheKey); // Hapus jika error agar bisa dicoba lagi nanti
        throw err;
      });
      promiseCache.set(cacheKey, promise);
    }
    
    return promiseCache.get(cacheKey)!;
  }
  
  return originalGet.call(this, url, config);
};

export default axiosInstance;