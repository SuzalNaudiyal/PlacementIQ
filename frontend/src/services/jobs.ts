import { apiClient } from './api';
import type {
  JobSummary,
  JobMatchListResponse,
  CustomJobMatchRequest,
} from '../types/jobs';

export const jobsService = {
  async getJobs(tier?: string, minCgpa?: number): Promise<JobSummary[]> {
    const params: Record<string, any> = {};
    if (tier && tier !== 'All') params.tier = tier;
    if (minCgpa !== undefined) params.min_cgpa = minCgpa;

    const res = await apiClient.get<JobSummary[]>('/jobs', { params });
    return res.data;
  },

  async getJob(jobId: string): Promise<JobSummary> {
    const res = await apiClient.get<JobSummary>(`/jobs/${jobId}`);
    return res.data;
  },

  async getMatchedJobs(eligibleOnly: boolean = false, tier?: string): Promise<JobMatchListResponse> {
    const params: Record<string, any> = { eligible_only: eligibleOnly };
    if (tier && tier !== 'All') params.tier = tier;

    const res = await apiClient.get<JobMatchListResponse>('/jobs/match', { params });
    return res.data;
  },

  async matchCustom(data: CustomJobMatchRequest): Promise<JobMatchListResponse> {
    const res = await apiClient.post<JobMatchListResponse>('/jobs/match-custom', data);
    return res.data;
  },
};
