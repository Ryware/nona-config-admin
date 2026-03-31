import { apiClient } from "./api-client";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../types";

export const projectService = {
  async getAll(): Promise<Project[]> {
    return apiClient.get<Project[]>("/admin/projects");
  },

  async getById(slug: string): Promise<Project> {
    return apiClient.get<Project>(`/admin/projects/${slug}`);
  },

  async create(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>("/admin/projects", data);
  },

  async update(slug: string, data: UpdateProjectRequest): Promise<Project> {
    return apiClient.put<Project>(`/admin/projects/${slug}`, data);
  },

  async delete(slug: string): Promise<void> {
    return apiClient.delete(`/admin/projects/${slug}`);
  },
};
