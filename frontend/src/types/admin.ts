/**
 * Admin Control Panel and Placement Analytics Data Types.
 */

export interface CohortOverview {
  total_students: number;
  avg_placement_probability: number;
  high_readiness_count: number;
  moderate_count: number;
  at_risk_count: number;
  placement_rate_pct: number;
  avg_cgpa: number;
  avg_ats_score: number;
  avg_projects: number;
  avg_internships: number;
}

export interface BranchStat {
  branch: string;
  student_count: number;
  avg_cgpa: number;
  avg_readiness: number;
  high_readiness_count: number;
}

export interface TargetRoleStat {
  role_id: string;
  role_title: string;
  student_count: number;
  avg_readiness: number;
}

export interface SkillDeficitItem {
  skill: string;
  category: string;
  missing_count: number;
  frequency_pct: number;
}

export interface CohortStatsResponse {
  overview: CohortOverview;
  branches: BranchStat[];
  target_roles: TargetRoleStat[];
  top_missing_skills: SkillDeficitItem[];
  total_jobs: number;
  generated_at: string;
}

export interface AdminStudentListItem {
  user_id: string;
  name: string;
  email: string;
  roll_number?: string | null;
  branch: string;
  semester: number;
  cgpa: number;
  target_role: string;
  placement_probability: number;
  readiness_category: string;
  ats_score: number;
  skills_count: number;
  top_missing_skills: string[];
  roadmap_progress_pct: number;
  completeness_percent: number;
}

export interface AdminStudentsListResponse {
  total: number;
  students: AdminStudentListItem[];
}

export interface AdminStudentDetail {
  user_id: string;
  name: string;
  email: string;
  roll_number?: string | null;
  education: {
    degree?: string;
    branch?: string;
    university?: string;
    graduation_year?: number;
    semester?: number;
  };
  cgpa: number;
  backlogs: number;
  skills: Record<string, string[]>;
  target_role: string;
  placement_probability: number;
  readiness_category: string;
  ats_score: number;
  ats_breakdown?: Record<string, any> | null;
  top_positive_factors: string[];
  top_negative_factors: string[];
  missing_skills: string[];
  matched_jobs_count: number;
  roadmap_completed_tasks: number;
  roadmap_total_tasks: number;
  roadmap_progress_pct: number;
}

export interface JobCreateRequest {
  title: string;
  company: string;
  company_tier: string;
  location: string;
  salary_range: string;
  min_cgpa: number;
  job_type: string;
  deadline: string;
  required_skills: string[];
  preferred_skills?: string[];
  description: string;
  experience_level: string;
}

export interface AdminJobItem {
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
  required_skills: string[];
  preferred_skills: string[];
  description: string;
  experience_level: string;
  eligible_applicants_count: number;
}
