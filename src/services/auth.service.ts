import { apiClient } from "./api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RegisterResult,
} from "../types";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return response;
  },

  async register(data: RegisterRequest): Promise<RegisterResult> {
    const response = await apiClient.post<RegisterResult>(
      "/auth/register",
      data
    );
    return response;
  },

  async requestPasswordReset(data: ForgotPasswordRequest): Promise<void> {
    // TODO: Implement when backend endpoint is ready
    // await apiClient.post('/auth/forgot-password', data);
    throw new Error(
      "Password reset functionality is not yet implemented on the backend"
    );
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    // TODO: Implement when backend endpoint is ready
    // await apiClient.post('/auth/reset-password', data);
    throw new Error(
      "Password reset functionality is not yet implemented on the backend"
    );
  },

  logout() {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  async firstTime(): Promise<boolean> {
    return apiClient.get("/auth/first-time");
  },
};
