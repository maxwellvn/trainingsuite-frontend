import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  Course,
  CourseWithModules,
  CourseFilters,
  Rating,
} from "@/types";

export interface CreateCourseData {
  title: string;
  description: string;
  category: string;
  price?: number;
  isFree?: boolean;
  level?: string;
  duration?: number;
  requirements?: string[];
  objectives?: string[];
  tags?: string[];
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  status?: string;
  thumbnail?: string;
  previewVideo?: string;
}

export const coursesApi = {
  getAll: async (filters?: CourseFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get<PaginatedResponse<Course>>(
      `/courses?${params.toString()}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${slug}`);
    return response.data;
  },

  getCurriculum: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CourseWithModules>>(
      `/courses/${id}/curriculum`
    );
    return response.data;
  },

  create: async (data: CreateCourseData) => {
    const response = await apiClient.post<ApiResponse<Course>>("/courses", data);
    return response.data;
  },

  update: async (id: string, data: UpdateCourseData) => {
    const response = await apiClient.put<ApiResponse<Course>>(
      `/courses/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`);
    return response.data;
  },

  enroll: async (id: string) => {
    const response = await apiClient.post<ApiResponse<{ enrollment: unknown }>>(
      `/courses/${id}/enroll`
    );
    return response.data;
  },

  getRatings: async (id: string, page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<Rating>>(
      `/courses/${id}/ratings?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  createRating: async (id: string, data: { rating: number; review?: string }) => {
    const response = await apiClient.post<ApiResponse<Rating>>(
      `/courses/${id}/ratings`,
      data
    );
    return response.data;
  },
};
