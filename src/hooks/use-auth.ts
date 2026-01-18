"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, setLoading, logout: storeLogout } = useAuthStore();

  // Fetch current user
  const { data, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync user data with store
  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (error) {
      setUser(null);
    }
    setLoading(isLoading);
  }, [data, error, isLoading, setUser, setLoading]);

  // Logout function - just clear local state (no API call needed for JWT auth)
  const logout = () => {
    storeLogout();
    queryClient.clear();
    router.push("/login");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isLoggingOut: false,
  };
}

export function useRequireAuth(redirectTo: string = "/login") {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { user, isLoading, isAuthenticated };
}

export function useRequireRole(allowedRoles: string[], redirectTo: string = "/dashboard") {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo]);

  return { user, isLoading, isAuthenticated, hasAccess: user ? allowedRoles.includes(user.role) : false };
}

export function useRedirectIfAuthenticated(redirectTo: string = "/dashboard") {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { isLoading, isAuthenticated };
}
