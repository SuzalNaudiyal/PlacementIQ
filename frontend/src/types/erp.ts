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
}

export interface RosterIngestionReport {
  total_records_processed: number;
  successful_imports: number;
  updated_records: number;
  failed_records: number;
  error_details: string[];
  imported_student_ids: string[];
}
