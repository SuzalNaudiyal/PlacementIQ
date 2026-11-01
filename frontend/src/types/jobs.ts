export interface JobSummary {
  id: string;
  title: string;
  company: string;
  company_tier: string;
  logo_text: string;
  location: string;
  salary_range: string;
  min_cgpa: number;
  job_type: string;
  deadline: string;
  description: string;
  experience_level: string;
  required_skills: string[];
  preferred_skills: string[];
}

export interface JobMatchItem {
  job_id: string;
  title: string;
  company: string;
  company_tier: string;
  logo_text: string;
  location: string;
  salary_range: string;
  min_cgpa: number;
  candidate_cgpa: number;
  cgpa_eligible: boolean;
  job_type: string;
  deadline: string;
  description: string;
  experience_level: string;
  match_percentage: number;
  fit_status: string;
  badge_color: string;
  fit_rationale: string;
  semantic_similarity_score: number;
  required_skills_acquired: string[];
  required_skills_missing: string[];
  preferred_skills_acquired: string[];
  preferred_skills_missing: string[];
}

export interface JobMatchListResponse {
  matches: JobMatchItem[];
  total_jobs: number;
  eligible_jobs_count: number;
  high_match_count: number;
  top_recommended_company?: string | null;
}

export interface CustomJobMatchRequest {
  skills: string[];
  cgpa?: number;
  summary_text?: string;
  filter_eligible_only?: boolean;
  company_tier?: string | null;
}
