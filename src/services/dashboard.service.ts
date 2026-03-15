import { apiClient } from './api-client';
import type { DashboardCounts } from '../types';

export const dashboardService = {
  async counts(): Promise<DashboardCounts> {
    return apiClient.get<DashboardCounts>(`/admin/dashboard/counts`);
  },
};
