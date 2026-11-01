import { apiClient } from './api';
import type { DashboardSummaryResponse } from '../types/dashboard';

export const dashboardService = {
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const res = await apiClient.get<DashboardSummaryResponse>('/student/dashboard-summary');
    return res.data;
  },
};
