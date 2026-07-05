/**
 * API Service Layer
 * Centralized HTTP client with axios for all API requests
 */

import axios from "axios";

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Generic request methods (without interceptors to avoid type issues)
export const apiRequest = {
  get: async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.get<ApiResponse<T>>(url);
    return response.data;
  },

  post: async <T = unknown, R = unknown>(
    url: string,
    data?: R
  ): Promise<ApiResponse<T>> => {
    const response = await api.post<ApiResponse<T>>(url, data);
    return response.data;
  },

  put: async <T = unknown, R = unknown>(
    url: string,
    data?: R
  ): Promise<ApiResponse<T>> => {
    const response = await api.put<ApiResponse<T>>(url, data);
    return response.data;
  },

  patch: async <T = unknown, R = unknown>(
    url: string,
    data?: R
  ): Promise<ApiResponse<T>> => {
    const response = await api.patch<ApiResponse<T>>(url, data);
    return response.data;
  },

  delete: async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.delete<ApiResponse<T>>(url);
    return response.data;
  },
};

// Auth-specific API endpoints
export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiRequest.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    apiRequest.post("/auth/login", data),

  logout: () => apiRequest.post("/auth/logout"),

  getCurrentUser: () => apiRequest.get("/auth/me"),

  verifyEmail: (data: { token: string }) =>
    apiRequest.post("/auth/verify-email", data),

  forgotPassword: (data: { email: string }) =>
    apiRequest.post("/auth/forgot-password", data),

  resetPassword: (data: { token: string; password: string }) =>
    apiRequest.post("/auth/reset-password", data),

  resendVerification: (data: { email: string }) =>
    apiRequest.post("/auth/resend-verification-email", data),

  refreshAccessToken: () => apiRequest.post("/auth/refresh-token"),
};

export default api;