import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";

// API Error Response type
interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
}

/**
 * Extract a user-friendly error message from various error types.
 * Handles Axios errors, API responses, and generic errors.
 */
export function getErrorMessage(error: unknown): string {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    // Check for network errors
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    // Check for timeout
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }

    // Extract error message from API response
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    if (responseData?.error) {
      return responseData.error;
    }
    if (responseData?.message) {
      return responseData.message;
    }

    // Handle common HTTP status codes
    const status = error.response?.status;
    switch (status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with existing data.";
      case 422:
        return "Invalid data provided. Please check your input.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with error/message properties
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.error === "string") return errorObj.error;
    if (typeof errorObj.message === "string") return errorObj.message;
  }

  return "An unexpected error occurred.";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options || defaultOptions);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return formatDate(date);
}

export function getLevelBadgeColor(level: string): string {
  switch (level) {
    case "beginner":
      return "bg-green-100 text-green-800";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "advanced":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "active":
    case "published":
    case "live":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "draft":
    case "scheduled":
      return "bg-yellow-100 text-yellow-800";
    case "expired":
    case "archived":
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Transform media URLs (avatars, uploads) to use the correct backend URL.
 * Handles URLs that may contain localhost, production domains, or relative paths.
 */
export function getMediaUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;

  // Get the base URL (remove /api suffix from NEXT_PUBLIC_API_URL)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  // If it's already a full URL with the correct base, return as-is
  if (baseUrl && url.startsWith(baseUrl)) {
    return url;
  }

  // Replace localhost URLs with the base URL
  if (url.includes("localhost:3001") || url.includes("localhost:3000") || url.includes("localhost:3002")) {
    const path = url.replace(/https?:\/\/localhost:\d+/, "");
    return baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}` : url;
  }

  // Replace production URLs with the base URL (for local dev with production data)
  if (url.includes("apis.movortech.com") || url.includes("api.movortech.com")) {
    const path = url.replace(/https?:\/\/apis?\.movortech\.com/, "");
    return baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}` : url;
  }

  // If it's a relative path starting with /uploads, prepend base URL
  if (url.startsWith("/uploads")) {
    return baseUrl ? `${baseUrl.replace(/\/$/, "")}${url}` : url;
  }

  return url;
}
