import axios from "axios";

import { authStorage } from "@/lib/auth-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

/*
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 *
 * Attach access token to every authenticated request.
 */

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

/*
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 *
 * If backend says JWT is expired / invalid:
 *
 * 1. Clear stored authentication
 * 2. Redirect user to login
 *
 * This prevents the application from continuing to operate
 * with an invalid access token.
 */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear();

      if (typeof window !== "undefined") {
        const currentPath =
          window.location.pathname + window.location.search;

        const isAlreadyOnAuthPage =
          currentPath === "/login" ||
          currentPath === "/register";

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