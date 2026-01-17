import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Quiz, Question, QuizAttempt } from "@/types";

export const quizzesApi = {
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
    return response.data;
  },

  getQuestions: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Question[]>>(
      `/quizzes/${id}/questions`
    );
    return response.data;
  },

  submit: async (id: string, answers: Record<string, string> | { question: string; selectedAnswer: number }[]) => {
    const response = await apiClient.post<ApiResponse<QuizAttempt>>(
      `/quizzes/${id}/submit`,
      { answers }
    );
    return response.data;
  },

  getAttempts: async (id: string) => {
    const response = await apiClient.get<PaginatedResponse<QuizAttempt>>(
      `/quizzes/${id}/attempts`
    );
    return response.data;
  },

  update: async (id: string, data: Partial<Quiz>) => {
    const response = await apiClient.put<ApiResponse<Quiz>>(`/quizzes/${id}`, data);
    return response.data;
  },
};
