import { apiClient } from './api-client';
import type { Environment, CreateEnvironmentRequest } from '../types';

export const environmentService = {
  async getAll(projectId?: string): Promise<Environment[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return apiClient.get<Environment[]>(`/admin/environments${query}`);
  },

  async getById(id: string): Promise<Environment> {
    return apiClient.get<Environment>(`/admin/environments/${id}`);
  },

  async create(data: CreateEnvironmentRequest): Promise<Environment> {
    return apiClient.post<Environment>('/admin/environments', data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/environments/${id}`);
  },
};
