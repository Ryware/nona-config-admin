import { apiClient } from "./api-client";
import type { User, CreateUserRequest } from "../types";

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

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/users/${id}`);
  },
};
