// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}

export interface LoginResult {
  success: boolean;
  response: LoginResponse | null;
  error: string | null;
}

export interface RegisterResult {
  success: boolean;
  response: LoginResponse | null;
  error: string | null;
}

export interface RegisterRequest {
  username: string;
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
  projectId: string;
  name: string;
}

// Config Entry Types
export interface ConfigEntry {
  id: string;
  projectId: string;
  environmentId?: string;
  key: string;
  value: string;
  valueType: 'string' | 'number' | 'boolean' | 'json';
  scope: 'global' | 'environment';
  createdAt: string;
  updatedAt: string;
}

export interface CreateConfigEntryRequest {
  projectId: string;
  environmentId?: string;
  key: string;
  value: string;
  valueType: 'string' | 'number' | 'boolean' | 'json';
  scope: 'global' | 'environment';
}

export interface UpdateConfigEntryRequest {
  value: string;
  valueType: 'string' | 'number' | 'boolean' | 'json';
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
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
