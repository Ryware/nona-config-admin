import { apiClient } from "./api-client";
import type { AuditLog } from "../types";

export const auditLogService = {
  async getAll(): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>("/admin/audit-logs");
  },
};
