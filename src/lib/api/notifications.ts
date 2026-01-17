import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Notification } from "@/types";

export const notificationsApi = {
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      `/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Notification>>(
      `/notifications/${id}`
    );
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      `/notifications/unread-count`
    );
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/notifications/read-all"
    );
    return response.data;
  },
};
