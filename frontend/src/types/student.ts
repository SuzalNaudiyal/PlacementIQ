import type { CodingProfileResponse } from './codingProfiles';

export interface PersonalDetails {
  phone: string;
  location: string;
}

export interface EducationDetails {
  degree: string;
  branch: string;
  university: string;
  graduation_year: number;
}

export interface SkillsGroup {
  programming: string[];
  databases: string[];
  frameworks: string[];
  cloud: string[];
  data_ai: string[];
  soft_skills: string[];
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface InternshipItem {
  company: string;
  role: string;
  duration_months: number;
  description: string;
}

export interface CertificationItem {
  name: string;
  issuer?: string;
  year?: number;
}

export interface AssessmentScores {
  coding_score: number;
  aptitude_score: number;
  communication_score: number;
  technical_interview_score: number;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  personal: PersonalDetails;
  education: EducationDetails;
  cgpa: number;
  backlogs: number;
  skills: SkillsGroup;
  projects: ProjectItem[];
  internships: InternshipItem[];
  certifications: CertificationItem[];
  assessments: AssessmentScores;
  coding_profiles?: CodingProfileResponse;
  completeness_percent: number;
  updated_at: string;
}

export interface StudentProfileUpdatePayload {
  personal: PersonalDetails;
  education: EducationDetails;
  cgpa: number;
  backlogs: number;
  skills: SkillsGroup;
  projects: ProjectItem[];
  internships: InternshipItem[];
  certifications: CertificationItem[];
  assessments: AssessmentScores;
  coding_profiles?: CodingProfileResponse;
}

export interface SkillTaxonomy {
  categories: {
    programming: string[];
    databases: string[];
    frameworks: string[];
    cloud: string[];
    data_ai: string[];
    devops: string[];
    soft_skills: string[];
  };
  total_standard_skills: number;
}
