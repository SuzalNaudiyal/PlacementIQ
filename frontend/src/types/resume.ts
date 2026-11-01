export interface ParsedContact {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ParsedEducation {
  degree?: string;
  branch?: string;
  university?: string;
  graduation_year?: number;
  cgpa?: number;
}

export interface ATSSectionScore {
  section_name: string;
  score: number;
  max_score: number;
  status: string;
  feedback: string;
}

export interface ATSAnalysis {
  total_score: number;
  rating: string;
  summary: string;
  section_scores: ATSSectionScore[];
  action_verbs_found: string[];
  quantified_bullets_count: number;
  strengths: string[];
  critical_improvements: string[];
}

export interface ParsedResumeResponse {
  filename: string;
  file_type: string;
  total_words: number;
  page_count: number;
  contact: ParsedContact;
  education: ParsedEducation;
  skills: Record<string, string[]>;
  projects_detected: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  experience_detected: Array<{
    company: string;
    role: string;
    duration_months: number;
    description: string;
  }>;
  certifications_detected: string[];
  ats_analysis: ATSAnalysis;
  profile_updated: boolean;
}
