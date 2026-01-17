import { apiClient } from "./client";
import type { ApiResponse, User } from "@/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      "/auth/register",
      data
    );
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/verify-email",
      { token }
    );
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await apiClient.put<ApiResponse<User>>(
      "/auth/profile",
      data
    );
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post<ApiResponse<null>>("/auth/signout");
    return response.data;
  },
};
