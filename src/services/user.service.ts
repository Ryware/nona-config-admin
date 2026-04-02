import { apiClient } from "./api-client";
import type { User, CreateUserRequest } from "../types";

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const userService = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>("/admin/users");
  },

  async getById(id: string): Promise<User> {
    return apiClient.get<User>(`/admin/users/${id}`);
  },

  async create(data: CreateUserRequest): Promise<User> {
    return apiClient.post<User>("/admin/users", data);
  },

  async update(id: string, data: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`/admin/users/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/users/${id}`);
  },
};
