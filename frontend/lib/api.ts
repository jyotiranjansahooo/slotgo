import axios from "axios";

import { authStorage } from "@/lib/auth-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message;

      if (
        message === "jwt expired" ||
        message === "Token expired" ||
        message === "Unauthorized"
      ) {
        authStorage.clear();

        if (typeof window !== "undefined") {
          const currentPath =
            window.location.pathname;

          if (currentPath !== "/login") {
            window.location.href = `/login?redirect=${encodeURIComponent(
              currentPath,
            )}`;
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear();

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;

        const isAlreadyOnAuthPage =
          currentPath === "/login" || currentPath === "/register";

        if (!isAlreadyOnAuthPage) {
          window.location.replace(
            `/login?session=expired&redirect=${encodeURIComponent(currentPath)}`,
          );
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
