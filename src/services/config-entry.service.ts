import { apiClient } from './api-client';
import type { ConfigEntry, UpdateConfigEntryRequest } from '../types';

export const configEntryService = {
  async getAll(projectId?: string, environmentName?: string): Promise<ConfigEntry[]> {
    return apiClient.get<ConfigEntry[]>(`/admin/projects/${projectId}/environments/${environmentName}/config-entries`);
  },

  async getById(projectId: string, environmentName: string, id: string): Promise<ConfigEntry> {
    return apiClient.get<ConfigEntry>(`/admin/projects/${projectId}/environments/${environmentName}/config-entries/${id}`);
  },

  async upsert(projectId: string, environmentName: string, id: string, data: UpdateConfigEntryRequest): Promise<ConfigEntry> {
    return apiClient.put<ConfigEntry>(`/admin/projects/${projectId}/environments/${environmentName}/config-entries/${id}`, data);
  },

  async delete(projectId: string, environmentName: string, id: string): Promise<void> {
    return apiClient.delete(`/admin/projects/${projectId}/environments/${environmentName}/config-entries/${id}`);
  },
};
