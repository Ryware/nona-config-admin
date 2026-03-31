import { apiClient } from './api-client';
import type { Environment, CreateEnvironmentRequest } from '../types';

export const environmentService = {
  async getAll(projectSlug?: string): Promise<Environment[]> {
    return apiClient.get<Environment[]>(`/admin/projects/${projectSlug}/environments`);
  },

  async getById(projectSlug: string, id: string): Promise<Environment> {
    return apiClient.get<Environment>(`/admin/projects/${projectSlug}/environments/${id}`);
  },

  async create(data: CreateEnvironmentRequest): Promise<Environment> {
    return apiClient.post<Environment>(`/admin/projects/${data.projectSlug}/environments`, data);
  },

  async delete(projectSlug: string, id: string): Promise<void> {
    return apiClient.delete(`/admin/projects/${projectSlug}/environments/${id}`);
  },
};
