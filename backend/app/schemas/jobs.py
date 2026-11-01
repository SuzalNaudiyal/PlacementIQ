"""
Pydantic schemas for Job Listings, Semantic Job Matching, and Applications.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class JobSummary(BaseModel):
    id: str
    title: str
    company: str
    company_tier: str
    logo_text: str
    location: str
    salary_range: str
    min_cgpa: float
    job_type: str
    deadline: str
    description: str
    experience_level: str
    required_skills: List[str]
    preferred_skills: List[str] = Field(default_factory=list)


class JobMatchItem(BaseModel):
    job_id: str
    title: str
    company: str
    company_tier: str
    logo_text: str
    location: str
    salary_range: str
    min_cgpa: float
    candidate_cgpa: float
    cgpa_eligible: bool
    job_type: str
    deadline: str
    description: str
    experience_level: str
    match_percentage: float = Field(..., ge=0.0, le=100.0)
    fit_status: str
    badge_color: str
    fit_rationale: str
    semantic_similarity_score: float
    required_skills_acquired: List[str]
    required_skills_missing: List[str]
    preferred_skills_acquired: List[str]
    preferred_skills_missing: List[str]


class JobMatchListResponse(BaseModel):
    matches: List[JobMatchItem]
    total_jobs: int
    eligible_jobs_count: int
    high_match_count: int
    top_recommended_company: Optional[str] = None


class CustomJobMatchRequest(BaseModel):
    skills: List[str] = Field(default_factory=list)
    cgpa: Optional[float] = Field(default=7.5, ge=0.0, le=10.0)
    summary_text: Optional[str] = Field(default="")
    filter_eligible_only: Optional[bool] = Field(default=False)
    company_tier: Optional[str] = Field(default=None)
