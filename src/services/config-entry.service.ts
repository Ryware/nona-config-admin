import { apiClient } from './api-client';
import type { ConfigEntry, CreateConfigEntryRequest, UpdateConfigEntryRequest } from '../types';

export const configEntryService = {
  async getAll(projectId?: string, environmentId?: string): Promise<ConfigEntry[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (environmentId) params.append('environmentId', environmentId);
    
    const query = params.toString() ? `?${params}` : '';
    return apiClient.get<ConfigEntry[]>(`/admin/projects/${projectId}/environments/${environmentId}/config-entries${query}`);
  },

  async getById(projectId: string, environmentId: string, id: string): Promise<ConfigEntry> {
    return apiClient.get<ConfigEntry>(`/admin/projects/${projectId}/environments/${environmentId}/config-entries/${id}`);
  },

  async create(data: CreateConfigEntryRequest): Promise<ConfigEntry> {
    return apiClient.post<ConfigEntry>(`/admin/projects/${data.projectSlug}/environments/${data.environmentId}/config-entries`, data);
  },

  async update(projectId: string, environmentId: string, id: string, data: UpdateConfigEntryRequest): Promise<ConfigEntry> {
    return apiClient.put<ConfigEntry>(`/admin/projects/${projectId}/environments/${environmentId}/config-entries/${id}`, data);
  },

  async delete(projectId: string, environmentId: string, id: string): Promise<void> {
    return apiClient.delete(`/admin/projects/${projectId}/environments/${environmentId}/config-entries/${id}`);
  },
};
