export interface PlacementDrive {
  drive_id: string;
  company_name: string;
  job_role: string;
  ctc_lpa: number;
  location: string;
  min_cgpa: number;
  max_backlogs: number;
  eligible_branches: string[];
  min_coding_score: number;
  application_deadline: string;
  drive_date: string;
  description?: string;
  status: string;
  total_eligible_students: number;
  total_applicants: number;
  created_at: string;
}

export interface StudentDriveEligibility {
  drive_id: string;
  company_name: string;
  job_role: string;
  ctc_lpa: number;
  location: string;
  drive_date: string;
  is_eligible: boolean;
  eligibility_reasons: string[];
  predicted_placement_odds: number;
  has_applied: boolean;
  application_status?: string;
}

export interface CreatePlacementDrivePayload {
  company_name: string;
  job_role: string;
  ctc_lpa: number;
  location: string;
  min_cgpa: number;
  max_backlogs: number;
  eligible_branches: string[];
  min_coding_score: number;
  application_deadline: string;
  drive_date: string;
  description?: string;
  status?: string;
}

export interface RosterIngestionReport {
  total_records_processed: number;
  successful_imports: number;
  updated_records: number;
  failed_records: number;
  error_details: string[];
  imported_student_ids: string[];
}

export interface EligibleCandidate {
  student_id: string;
  user_id: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  skills: string[];
  coding_score: number;
  placement_odds: number;
  has_applied: boolean;
  application_status: string;
  applied_at: string | null;
  eligibility_reasons: string[];
}

export interface DriveEligibleCandidatesResponse {
  drive_id: string;
  company_name: string;
  job_role: string;
  ctc_lpa: number;
  total_eligible_count: number;
  candidates: EligibleCandidate[];
}

export interface ApplicationTimelineStage {
  id: string;
  label: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'rejected';
  date?: string | null;
  description?: string | null;
}

export interface StudentApplicationDetail {
  application_id: string;
  drive_id: string;
  company_name: string;
  job_role: string;
  ctc_lpa: number;
  location: string;
  drive_date?: string | null;
  deadline?: string | null;
  applied_at: string;
  status: string;
  current_stage_index: number;
  stages: ApplicationTimelineStage[];
  interview_notes?: string | null;
  interview_date?: string | null;
}

export interface DispatchLog {
  dispatch_id: string;
  id?: string;
  drive_id: string;
  company_name: string;
  job_role: string;
  ctc_lpa: number;
  channel: string;
  recipients_count: number;
  delivered_whatsapp_count: number;
  delivered_email_count: number;
  success_rate: number;
  sender_admin: string;
  note?: string;
  status: string;
  created_at: string;
}
