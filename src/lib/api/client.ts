import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Paths that should NOT trigger a redirect on 401
const AUTH_CHECK_PATHS = ["/auth/me", "/auth/session"];

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestPath = error.config?.url || "";

    // Only redirect to login for 401 errors on protected routes
    // Don't redirect for auth check endpoints (they're expected to fail when not logged in)
    if (error.response?.status === 401) {
      const isAuthCheckPath = AUTH_CHECK_PATHS.some((path) => requestPath.includes(path));

      if (!isAuthCheckPath && typeof window !== "undefined") {
        // Only redirect if we're on a protected route (dashboard, admin, etc.)
        const currentPath = window.location.pathname;
        const protectedRoutes = ["/dashboard", "/admin", "/instructor", "/my-courses", "/certificates", "/notifications", "/settings"];
        const isProtectedRoute = protectedRoutes.some((route) => currentPath.startsWith(route));

        if (isProtectedRoute) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
