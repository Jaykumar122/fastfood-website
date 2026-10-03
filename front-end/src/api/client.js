import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 12_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      const path = window.location.pathname;
      const target = path.startsWith("/owner") ? "/restaurant/login" : path.startsWith("/delivery") ? "/delivery/login" : path.startsWith("/admin") ? "/admin/login" : "/login";
      if (!/login|register|signup/.test(path)) window.location.replace(target);
    }
    return Promise.reject(error);
  },
);
