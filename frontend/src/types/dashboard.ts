export interface RadarBenchmarkPoint {
  subject: string;
  candidate_score: number;
  industry_benchmark: number;
  full_mark: number;
}

export interface DashboardKpis {
  placement_probability: number;
  placement_status: string;
  predicted_salary_tier: string;
  ats_score?: number | null;
  ats_grade?: string | null;
  top_role_title: string;
  top_role_match: number;
  top_company_name: string;
  top_company_match: number;
  roadmap_progress: number;
  completed_tasks_count: number;
  total_tasks_count: number;
  profile_completeness: number;
}

export interface DashboardSummaryResponse {
  student_name: string;
  student_email: string;
  branch: string;
  cgpa: number;
  kpis: DashboardKpis;
  radar_benchmarks: RadarBenchmarkPoint[];
  top_positive_factors: string[];
  critical_risk_factors: string[];
  next_recommended_actions: { title: string; detail: string }[];
}
