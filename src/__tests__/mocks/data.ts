import type { Project, Environment, ConfigEntry, User, ApiKey } from '../../types';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    urlSlug: 'my-app',
    name: 'my-app',
    description: 'Main application config',
    serverApiKey: 'sk_test_1234567890abcdef',
    clientApiKey: 'ck_test_1234567890abcdef',
    environments: ['production', 'staging'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'proj-2',
    urlSlug: 'backend-api',
    name: 'backend-api',
    description: 'Backend API config',
    serverApiKey: 'sk_test_abcdef1234567890',
    clientApiKey: null,
    environments: ['production'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

export const mockEnvironments: Environment[] = [
  {
    project: 'my-app',
    name: 'production',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    project: 'my-app',
    name: 'staging',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockConfigEntries: ConfigEntry[] = [
  {
    project: 'my-app',
    environment: 'production',
    key: 'API_URL',
    value: 'https://api.example.com',
    contentType: 'string',
    scope: 'server',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    project: 'my-app',
    environment: 'production',
    key: 'MAX_RETRIES',
    value: '3',
    contentType: 'number',
    scope: 'all',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    project: 'my-app',
    environment: 'production',
    key: 'FEATURE_FLAGS',
    value: '{"dark_mode": true}',
    contentType: 'json',
    scope: 'client',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockApiKeys: ApiKey[] = [
  {
    id: 1,
    name: 'Web Client',
    key: 'A'.repeat(64),
    project: 'my-app',
    environment: null,
    scope: 'client',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Production Mobile',
    key: 'B'.repeat(64),
    project: 'my-app',
    environment: 'production',
    scope: 'all',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'alice@example.com',
    name: 'Alice Admin',
    isAdmin: true,
    role: 'editor',
    scope: 'all',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    name: 'Bob Viewer',
    isAdmin: false,
    role: 'viewer',
    scope: 'all',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

export const mockToken = 'mock-jwt-token-abc123';
