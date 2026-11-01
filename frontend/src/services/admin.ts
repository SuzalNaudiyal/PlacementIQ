/**
 * Admin API service client for institutional analytics, directory search, and campus job drives.
 */

import { apiClient } from './api';
import type {
  CohortStatsResponse,
  AdminStudentsListResponse,
  AdminStudentDetail,
  AdminJobItem,
  JobCreateRequest,
} from '../types/admin';

export const adminService = {
  /**
   * Fetch aggregate placement readiness stats for the entire student cohort.
   */
  async getCohortStats(): Promise<CohortStatsResponse> {
    const response = await apiClient.get<CohortStatsResponse>('/admin/cohort-stats');
    return response.data;
  },

  /**
   * Fetch filterable student directory.
   */
  async getStudentsDirectory(params?: {
    branch?: string;
    min_cgpa?: number;
    max_cgpa?: number;
    readiness_category?: string;
    target_role?: string;
    search?: string;
  }): Promise<AdminStudentsListResponse> {
    const response = await apiClient.get<AdminStudentsListResponse>('/admin/students', { params });
    return response.data;
  },

  /**
   * Fetch deep drill-down dossier for a single student.
   */
  async getStudentDrilldown(userId: string): Promise<AdminStudentDetail> {
    const response = await apiClient.get<AdminStudentDetail>(`/admin/students/${userId}`);
    return response.data;
  },

  /**
   * Fetch all campus placement job drives with applicant match counts.
   */
  async getAdminCampusJobs(): Promise<AdminJobItem[]> {
    const response = await apiClient.get<AdminJobItem[]>('/admin/jobs');
    return response.data;
  },

  /**
   * Post a new campus recruitment drive.
   */
  async createCampusJobDrive(data: JobCreateRequest): Promise<AdminJobItem> {
    const response = await apiClient.post<AdminJobItem>('/admin/jobs', data);
    return response.data;
  },

  /**
   * Delete an existing campus drive.
   */
  async deleteCampusJob(jobId: string): Promise<{ status: string; message: string }> {
    const response = await apiClient.delete<{ status: string; message: string }>(`/admin/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Download institutional cohort report as a CSV file.
   */
  async downloadCohortCsv(): Promise<Blob> {
    const response = await apiClient.get('/admin/export/cohort-csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};
