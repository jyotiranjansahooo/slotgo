import axios from "axios";
import { authStorage } from "@/lib/auth-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",

  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear();

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;

        const isAuthPage =
          window.location.pathname === "/login" ||
          window.location.pathname === "/register";

        if (!isAuthPage) {
          window.location.replace(
            `/login?session=expired&redirect=${encodeURIComponent(
              currentPath,
            )}`,
          );
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
