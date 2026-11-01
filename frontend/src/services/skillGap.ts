import { apiClient } from './api';
import type {
  RoleSummary,
  SkillGapAnalysisResponse,
  RoleRankingItem,
  CustomSkillGapRequest,
} from '../types/skillGap';

export const skillGapService = {
  async getJobRoles(): Promise<RoleSummary[]> {
    const res = await apiClient.get<RoleSummary[]>('/skill-gap/roles');
    return res.data;
  },

  async getRole(roleId: string): Promise<RoleSummary> {
    const res = await apiClient.get<RoleSummary>(`/skill-gap/roles/${roleId}`);
    return res.data;
  },

  async analyzeRole(roleId: string): Promise<SkillGapAnalysisResponse> {
    const res = await apiClient.get<SkillGapAnalysisResponse>(`/skill-gap/analyze/${roleId}`);
    return res.data;
  },

  async analyzeCustom(data: CustomSkillGapRequest): Promise<SkillGapAnalysisResponse> {
    const res = await apiClient.post<SkillGapAnalysisResponse>('/skill-gap/analyze-custom', data);
    return res.data;
  },

  async getTopRoles(): Promise<RoleRankingItem[]> {
    const res = await apiClient.get<RoleRankingItem[]>('/skill-gap/top-roles');
    return res.data;
  },
};
