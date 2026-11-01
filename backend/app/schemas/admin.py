"""
Admin Control Panel and Cohort Analytics Schemas.
Data models for cohort placement intelligence, applicant tracking, student drill-downs, and campus job drives.
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field


class CohortOverview(BaseModel):
    total_students: int = Field(..., description="Total student cohort size")
    avg_placement_probability: float = Field(..., description="Average placement readiness probability across cohort")
    high_readiness_count: int = Field(..., description="Students with probability >= 0.70")
    moderate_count: int = Field(..., description="Students with probability 0.40 - 0.69")
    at_risk_count: int = Field(..., description="Students with probability < 0.40")
    placement_rate_pct: float = Field(..., description="Percentage of students with high readiness")
    avg_cgpa: float = Field(..., description="Cohort average CGPA")
    avg_ats_score: float = Field(..., description="Cohort average ATS resume score")
    avg_projects: float = Field(..., description="Cohort average project count")
    avg_internships: float = Field(..., description="Cohort average internship count")


class BranchStat(BaseModel):
    branch: str = Field(..., description="Engineering department / branch")
    student_count: int = Field(..., description="Number of students in this branch")
    avg_cgpa: float = Field(..., description="Average CGPA for this branch")
    avg_readiness: float = Field(..., description="Average placement readiness percentage")
    high_readiness_count: int = Field(..., description="Count of placement-ready students")


class TargetRoleStat(BaseModel):
    role_id: str = Field(..., description="Target role identifier")
    role_title: str = Field(..., description="Role title")
    student_count: int = Field(..., description="Number of students targeting this role")
    avg_readiness: float = Field(..., description="Average readiness for this role")


class SkillDeficitItem(BaseModel):
    skill: str = Field(..., description="Skill name")
    category: str = Field(..., description="Skill category")
    missing_count: int = Field(..., description="Number of students missing this skill")
    frequency_pct: float = Field(..., description="Percentage of students missing this required skill")


class CohortStatsResponse(BaseModel):
    overview: CohortOverview
    branches: List[BranchStat]
    target_roles: List[TargetRoleStat]
    top_missing_skills: List[SkillDeficitItem]
    total_jobs: int
    generated_at: str


class AdminStudentListItem(BaseModel):
    user_id: str
    name: str
    email: str
    roll_number: Optional[str] = None
    branch: str
    semester: int
    cgpa: float
    target_role: str
    placement_probability: float
    readiness_category: str
    ats_score: float
    skills_count: int
    top_missing_skills: List[str]
    roadmap_progress_pct: float
    completeness_percent: float


class AdminStudentsListResponse(BaseModel):
    total: int
    students: List[AdminStudentListItem]


class AdminStudentDetail(BaseModel):
    user_id: str
    name: str
    email: str
    roll_number: Optional[str] = None
    education: Dict[str, Any]
    cgpa: float
    backlogs: int
    skills: Dict[str, List[str]]
    target_role: str
    placement_probability: float
    readiness_category: str
    ats_score: float
    ats_breakdown: Optional[Dict[str, Any]] = None
    top_positive_factors: List[Union[str, Dict[str, Any]]] = Field(default_factory=list)
    top_negative_factors: List[Union[str, Dict[str, Any]]] = Field(default_factory=list)
    missing_skills: List[str] = []
    matched_jobs_count: int = 0
    roadmap_completed_tasks: int = 0
    roadmap_total_tasks: int = 0
    roadmap_progress_pct: float = 0.0


class JobCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    company: str = Field(..., min_length=2, max_length=100)
    company_tier: str = Field(default="Tier 1 Product")
    location: str = Field(default="Bangalore / Hybrid")
    salary_range: str = Field(default="₹12.0 - 18.0 LPA")
    min_cgpa: float = Field(default=7.0, ge=0.0, le=10.0)
    job_type: str = Field(default="Full-time")
    deadline: str = Field(default="2026-12-31")
    required_skills: List[str] = Field(..., min_length=1)
    preferred_skills: List[str] = Field(default_factory=list)
    description: str = Field(..., min_length=10)
    experience_level: str = Field(default="Entry Level")


class AdminJobItem(BaseModel):
    id: str
    title: str
    company: str
    company_tier: str
    logo_text: str = "JOB"
    location: str
    salary_range: str
    min_cgpa: float
    job_type: str
    deadline: str
    required_skills: List[str]
    preferred_skills: List[str]
    description: str
    experience_level: str
    eligible_applicants_count: int = 0
