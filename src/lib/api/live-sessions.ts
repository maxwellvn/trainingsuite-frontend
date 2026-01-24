import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, LiveSession, LiveAttendance } from "@/types";

export const liveSessionsApi = {
  getAll: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);

    const response = await apiClient.get<PaginatedResponse<LiveSession>>(
      `/live-sessions?${params.toString()}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<LiveSession>>(
      `/live-sessions/${id}`
    );
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    course?: string;
    scheduledAt: string;
    duration?: number;
    streamUrl?: string;
    streamProvider?: string;
    maxAttendees?: number;
    thumbnail?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<LiveSession>>(
      "/live-sessions",
      data
    );
    return response.data;
  },

  update: async (id: string, data: Partial<LiveSession>) => {
    const response = await apiClient.put<ApiResponse<LiveSession>>(
      `/live-sessions/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/live-sessions/${id}`
    );
    return response.data;
  },

  start: async (id: string) => {
    const response = await apiClient.post<ApiResponse<LiveSession>>(
      `/live-sessions/${id}/start`
    );
    return response.data;
  },

  end: async (id: string) => {
    const response = await apiClient.post<ApiResponse<LiveSession>>(
      `/live-sessions/${id}/end`
    );
    return response.data;
  },

  join: async (id: string) => {
    const response = await apiClient.post<ApiResponse<LiveAttendance>>(
      `/live-sessions/${id}/join`
    );
    return response.data;
  },

  recordAttendance: async (id: string) => {
    const response = await apiClient.post<ApiResponse<LiveAttendance>>(
      `/live-sessions/${id}/attendance`
    );
    return response.data;
  },
};
