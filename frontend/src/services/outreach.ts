import { apiClient } from './api';

export interface GenerateOutreachPayload {
  company_name: string;
  job_role: string;
  job_id?: string;
}

export interface OutreachData {
  company_name: string;
  job_role: string;
  candidate_summary: {
    name: string;
    cgpa: number;
    top_skills: string;
    primary_language: string;
    top_project_name: string;
    top_project_tech: string;
    total_solved: number;
    cqi: number;
    university: string;
    branch: string;
    graduation_year: number;
  };
  subject_lines: string[];
  messages: {
    alumni_referral: string;
    recruiter_dm: string;
    hiring_manager: string;
    quick_inmail: string;
  };
  tips: string[];
}

export interface OutreachTemplatesResponse {
  templates: Record<string, { title: string; tone: string; description: string }>;
  default_companies: string[];
}

export const fetchOutreachTemplates = async (): Promise<OutreachTemplatesResponse> => {
  const res = await apiClient.get<OutreachTemplatesResponse>('/outreach/templates');
  return res.data;
};

export const generateOutreachPitches = async (payload: {
  company_name: string;
  job_role: string;
  job_id?: string;
}): Promise<OutreachData> => {
  const res = await apiClient.post<OutreachData>('/outreach/generate', payload);
  return res.data;
};
