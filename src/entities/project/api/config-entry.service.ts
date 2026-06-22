import { apiClient } from '../../../shared/api/client';
import type {
  ConfigEntry,
  ConfigEntryVersion,
  RollbackConfigEntryRequest,
  UpdateConfigEntryRequest
} from '../../../types';

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

  async history(projectId: string, environmentName: string, id: string): Promise<ConfigEntryVersion[]> {
    return apiClient.get<ConfigEntryVersion[]>(`/admin/projects/${projectId}/environments/${environmentName}/config-entries/${id}/history`);
  },

  async rollback(projectId: string, environmentName: string, id: string, data: RollbackConfigEntryRequest): Promise<ConfigEntry> {
    return apiClient.post<ConfigEntry>(`/admin/projects/${projectId}/environments/${environmentName}/config-entries/${id}/rollback`, data);
  },

  async delete(projectId: string, environmentName: string, id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/projects/${projectId}/environments/${environmentName}/config-entries/${id}`);
  },
};
