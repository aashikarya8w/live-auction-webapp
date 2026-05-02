import axios from "axios";

// 🔥 Base API Instance
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080'
  : `http://${window.location.hostname}:8080`;

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 REQUEST INTERCEPTOR (JWT Token attach karega)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ RESPONSE INTERCEPTOR (Global error handling)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 Token expire ho gaya
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // 🔥 Server error
    if (error.response?.status === 500) {
      console.error("Server Error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default API;