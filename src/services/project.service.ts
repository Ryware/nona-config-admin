import { apiClient } from './api-client';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../types';

export const projectService = {
  async getAll(): Promise<Project[]> {
    return apiClient.get<Project[]>('/admin/projects');
  },

  async getById(id: string): Promise<Project> {
    return apiClient.get<Project>(`/admin/projects/${id}`);
  },

  async create(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>('/admin/projects', data);
  },

  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    return apiClient.put<Project>(`/admin/projects/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/projects/${id}`);
  },
};
