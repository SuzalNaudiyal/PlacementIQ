export interface RoleSummary {
  id: string;
  title: string;
  category: string;
  industry_demand: string;
  salary_range: string;
  description: string;
  critical_skills: string[];
  important_skills: string[];
  optional_skills: string[];
  min_recommended_cgpa: number;
}

export interface SkillItemDetail {
  name: string;
  tier: 'Critical' | 'Important' | 'Optional';
  badge_color: string;
  status: string;
  urgency: string;
  description: string;
}

export interface TierSummary {
  acquired_count: number;
  total_count: number;
  acquired: string[];
  missing: string[];
}

export interface RoiRecommendation {
  skill: string;
  tier: string;
  roi_impact: string;
  action: string;
}

export interface SkillGapAnalysisResponse {
  role_id: string;
  role_title: string;
  category: string;
  industry_demand: string;
  salary_range: string;
  description: string;
  min_recommended_cgpa: number;
  cgpa_met: boolean;
  match_percentage: number;
  readiness_level: string;
  badge_color: string;
  readiness_desc: string;
  estimated_prep_weeks: number;
  critical_skills_summary: TierSummary;
  important_skills_summary: TierSummary;
  optional_skills_summary: TierSummary;
  acquired_skills: string[];
  missing_critical: SkillItemDetail[];
  missing_important: SkillItemDetail[];
  missing_optional: SkillItemDetail[];
  roi_recommendations: RoiRecommendation[];
}

export interface RoleRankingItem {
  role_id: string;
  role_title: string;
  category: string;
  industry_demand: string;
  salary_range: string;
  match_percentage: number;
  readiness_level: string;
  badge_color: string;
  missing_critical_count: number;
  missing_important_count: number;
  estimated_prep_weeks: number;
}

export interface CustomSkillGapRequest {
  role_id: string;
  skills: string[];
  cgpa?: number;
}
