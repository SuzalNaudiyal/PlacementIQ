"""
Pydantic Schemas for University ERP & Bulk Student Roster Sync.
Covers batch CSV ingestion, placement drive lifecycle, and eligibility audits.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class StudentRosterRecord(BaseModel):
    roll_number: str = Field(..., description="Unique university roll number / registration ID")
    name: str = Field(..., min_length=2)
    email: str = Field(...)
    branch: str = Field(default="Computer Science")
    batch_year: int = Field(default=2026)
    cgpa: float = Field(..., ge=0.0, le=10.0)
    backlogs: int = Field(default=0, ge=0)
    attendance_percentage: float = Field(default=85.0, ge=0.0, le=100.0)
    coding_score: float = Field(default=75.0, ge=0.0, le=100.0)
    internships_count: int = Field(default=0, ge=0)
    projects_count: int = Field(default=1, ge=0)
    certifications_count: int = Field(default=0, ge=0)
    soft_skills_rating: float = Field(default=7.0, ge=1.0, le=10.0)
    preferred_roles: List[str] = Field(default_factory=lambda: ["full-stack-developer"])


class RosterIngestionReport(BaseModel):
    total_records_processed: int
    successful_imports: int
    updated_records: int
    failed_records: int
    error_details: List[str] = []
    imported_student_ids: List[str] = []


class CreatePlacementDriveRequest(BaseModel):
    company_name: str = Field(..., min_length=2)
    job_role: str = Field(..., min_length=2)
    ctc_lpa: float = Field(..., gt=0.0, description="Package in Lakhs Per Annum")
    location: str = Field(default="Bangalore, India")
    min_cgpa: float = Field(default=7.0, ge=0.0, le=10.0)
    max_backlogs: int = Field(default=0, ge=0)
    eligible_branches: List[str] = Field(
        default_factory=lambda: ["Computer Science", "Information Technology", "Electronics"]
    )
    min_coding_score: float = Field(default=60.0, ge=0.0, le=100.0)
    application_deadline: str
    drive_date: str
    description: Optional[str] = None


class UpdatePlacementDriveRequest(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2)
    job_role: Optional[str] = Field(None, min_length=2)
    ctc_lpa: Optional[float] = Field(None, gt=0.0)
    location: Optional[str] = None
    min_cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)
    max_backlogs: Optional[int] = Field(None, ge=0)
    eligible_branches: Optional[List[str]] = None
    min_coding_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    application_deadline: Optional[str] = None
    drive_date: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class PlacementDriveOut(BaseModel):
    drive_id: str
    company_name: str
    job_role: str
    ctc_lpa: float
    location: str
    min_cgpa: float
    max_backlogs: int
    eligible_branches: List[str]
    min_coding_score: float
    application_deadline: str
    drive_date: str
    description: Optional[str] = None
    status: str = "Active"  # Active, In Progress, Completed
    total_eligible_students: int = 0
    total_applicants: int = 0
    created_at: datetime


class StudentDriveEligibilityOut(BaseModel):
    drive_id: str
    company_name: str
    job_role: str
    ctc_lpa: float
    location: str
    drive_date: str
    is_eligible: bool
    eligibility_reasons: List[str] = []
    predicted_placement_odds: float = 75.0
    has_applied: bool = False
    application_status: Optional[str] = None


class ApplyDriveRequest(BaseModel):
    drive_id: str


class UpdateApplicationStatusRequest(BaseModel):
    status: str = Field(..., description="Application stage e.g. Shortlisted for Round 1, Technical Interview, Offer Extended, Not Selected")
    notes: Optional[str] = Field(None, description="Optional feedback or interview details from DCPD / Recruiter")
    interview_date: Optional[str] = Field(None, description="Date/time of scheduled interview round")


class ApplicationTimelineStage(BaseModel):
    id: str
    label: str
    status: str  # completed, in_progress, upcoming, rejected
    date: Optional[str] = None
    description: Optional[str] = None


class StudentApplicationDetailOut(BaseModel):
    application_id: str
    drive_id: str
    company_name: str
    job_role: str
    ctc_lpa: float = 12.0
    location: str = "Bangalore / Hybrid"
    drive_date: Optional[str] = None
    deadline: Optional[str] = None
    applied_at: datetime
    status: str = "Applied"
    current_stage_index: int = 1
    stages: List[ApplicationTimelineStage] = []
    interview_notes: Optional[str] = None
    interview_date: Optional[str] = None

