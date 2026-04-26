import { apiClient } from "./api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RegisterResult,
  SsoConfig,
  InvitationDetails,
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

  async requestPasswordReset(_data: ForgotPasswordRequest): Promise<void> {
    // TODO: Implement when backend endpoint is ready
    // await apiClient.post('/auth/forgot-password', data);
    throw new Error(
      "Password reset functionality is not yet implemented on the backend"
    );
  },

  async resetPassword(_data: ResetPasswordRequest): Promise<void> {
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

  async getSsoConfig(): Promise<SsoConfig> {
    return apiClient.get("/auth/sso/config");
  },

  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/sso/google", { idToken });
  },

  async loginWithMicrosoft(idToken: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/sso/microsoft", { idToken });
  },

  async getInvitation(token: string): Promise<InvitationDetails> {
    return apiClient.get(`/auth/invitations/${token}`);
  },

  async completeInvitationWithPassword(token: string, newPassword: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`/auth/invitations/${token}/password`, { newPassword });
  },

  async completeInvitationWithGoogle(token: string, idToken: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`/auth/invitations/${token}/sso/google`, { idToken });
  },

  async completeInvitationWithMicrosoft(token: string, idToken: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`/auth/invitations/${token}/sso/microsoft`, { idToken });
  },
};
