import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, EnrollmentWithCourse } from "@/types";

export const enrollmentsApi = {
  getAll: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);

    const response = await apiClient.get<PaginatedResponse<EnrollmentWithCourse>>(
      `/enrollments?${params.toString()}`
    );
    return response.data;
  },

  getMyEnrollments: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);

    const response = await apiClient.get<PaginatedResponse<EnrollmentWithCourse>>(
      `/enrollments?${params.toString()}`
    );
    return response.data;
  },

  getByCourse: async (courseId: string) => {
    const response = await apiClient.get<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments/course/${courseId}`
    );
    return response.data;
  },

  getEnrollmentByCourse: async (courseId: string) => {
    const response = await apiClient.get<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments/course/${courseId}`
    );
    return response.data;
  },

  enroll: async (courseId: string) => {
    const response = await apiClient.post<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments`,
      { courseId }
    );
    return response.data;
  },

  updateProgress: async (enrollmentId: string, lessonId: string, progress: number) => {
    const response = await apiClient.patch<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments/${enrollmentId}/progress`,
      { lessonId, progress }
    );
    return response.data;
  },
};
