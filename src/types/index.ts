// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  expiresAt: string;
}

export interface RegisterResult {
  success: boolean;
  response: LoginResponse | null;
  error: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Project Types
export interface Project {
  id: string;
  urlSlug: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
}

// Environment Types
export interface Environment {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentRequest {
  projectSlug: string;
  name: string;
}

// Config Entry Types
export interface ConfigEntry {
  project: string;
  environment: string;
  key: string;
  value: string;
  contentType: 'string' | 'number' | 'boolean' | 'json';
  scope: 'client' | 'server' | 'all';
  createdAt: string;
  updatedAt: string;
}

export interface CreateConfigEntryRequest {
  projectSlug: string;
  key: string;
  value: string;
  contentType: 'string' | 'number' | 'boolean' | 'json';
  scope: 'client' | 'server' | 'all';
}

export interface UpdateConfigEntryRequest {
  value: string;
  contentType?: 'string' | 'number' | 'boolean' | 'json';
  scope?: 'client' | 'server' | 'all';
}

// User Types
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  role: string;
  name: string;
  resetPasswordToken?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  role?: string;
}

// API Response Types
export interface ApiError {
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardCounts {
  projects: number;
  configEntries: number;
  users: number;
}
