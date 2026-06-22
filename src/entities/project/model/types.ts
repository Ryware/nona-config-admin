// Project domain types — source of truth for project-related contracts

export interface Project {
  id: string;
  urlSlug: string;
  name: string;
  description?: string;
  environments: string[];
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

export interface ConfigEntry {
  project: string;
  environment: string;
  key: string;
  value: string;
  contentType: 'text' | 'number' | 'boolean' | 'json';
  scope: 'client' | 'server' | 'all';
  createdAt: string;
  updatedAt: string;
}

export interface CreateConfigEntryRequest {
  projectId: string;
  key: string;
  value: string;
  contentType: 'text' | 'number' | 'boolean' | 'json';
  scope: 'client' | 'server' | 'all';
}

export interface UpdateConfigEntryRequest {
  value: string;
  contentType?: 'text' | 'number' | 'boolean' | 'json';
  scope?: 'client' | 'server' | 'all';
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  project: string;
  environment: string | null;
  scope: 'client' | 'server' | 'all';
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  environment?: string | null;
  scope?: 'client' | 'server' | 'all';
}
