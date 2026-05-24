// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username?: string;
  role: string;
  expiresAt: string;
}

export interface SsoProviderConfig {
  enabled: boolean;
  clientId: string | null;
  authority?: string | null;
  tenantId?: string | null;
}

export interface SsoConfig {
  google: SsoProviderConfig;
  microsoft: SsoProviderConfig;
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

export interface InvitationDetails {
  email: string;
  name: string;
}

// Project Types
export interface Project {
  id: string;
  urlSlug: string;
  name: string;
  description?: string;
  serverApiKey: string | null;
  clientApiKey: string | null;
  environments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RerollApiKeysRequest {
  keyType: 'Server' | 'Client';
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
  project: string;
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
  projectId: string;
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
export interface ProjectAccess {
  projectName: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  role: string;
  name: string;
  scope?: string;
  projects?: ProjectAccess[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
  scope?: string;
}

export interface CreateUserResponse {
  user: User;
  invitationToken: string;
}

// API Response Types
export interface ApiError {
  error: string;
  message?: string;
  errorCode?: string;
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

// Audit Log Types
export interface AuditLog {
  id: string;
  actor: string;
  actorIsSystem: boolean;
  action: string;
  target: string;
  project: string | null;
  environment: string | null;
  createdAt: string;
}
