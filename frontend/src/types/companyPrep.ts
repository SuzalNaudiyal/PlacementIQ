export interface SelectionProcessRound {
  round_num: number;
  name: string;
  duration: string;
  focus: string;
  format: string;
}

export interface DsaPattern {
  pattern: string;
  frequency_pct: number;
}

export interface FrequentLeetCodeQuestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  topic: string;
  leetcode_url: string;
}

export interface CompanyReadinessEvaluation {
  company_id: string;
  company_name: string;
  readiness_percentage: number;
  status_label: string;
  badge_variant: 'emerald' | 'amber' | 'rose' | 'indigo' | string;
  is_eligible: boolean;
  recommendations: string[];
  metrics_comparison: {
    candidate_cgpa: number;
    required_cgpa: number;
    candidate_coding_score: number;
    required_coding_score: number;
    candidate_mediums_solved: number;
    recommended_mediums: number;
  };
}

export interface CompanyCheatSheet {
  id: string;
  company_name: string;
  category: string;
  target_role: string;
  ctc_range: string;
  logo_color: string;
  eligibility: {
    min_cgpa: number;
    max_backlogs: number;
    allowed_branches: string[];
    min_coding_score: number;
    min_leetcode_mediums: number;
  };
  selection_process: SelectionProcessRound[];
  top_dsa_patterns: DsaPattern[];
  frequent_leetcode_questions: FrequentLeetCodeQuestion[];
  core_cs_questions: string[];
  star_behavioral_questions: string[];
  insider_tips: string[];
  readiness_evaluation?: CompanyReadinessEvaluation;
}

