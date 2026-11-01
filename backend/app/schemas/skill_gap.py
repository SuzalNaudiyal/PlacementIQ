"""
Pydantic schemas for Skill Gap Analysis and Role Recommendations.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class RoleSummary(BaseModel):
    id: str
    title: str
    category: str
    industry_demand: str
    salary_range: str
    description: str
    critical_skills: List[str]
    important_skills: List[str]
    optional_skills: List[str]
    min_recommended_cgpa: float


class SkillItemDetail(BaseModel):
    name: str
    tier: str
    badge_color: str
    status: str
    urgency: str
    description: str


class TierSummary(BaseModel):
    acquired_count: int
    total_count: int
    acquired: List[str]
    missing: List[str]


class RoiRecommendation(BaseModel):
    skill: str
    tier: str
    roi_impact: str
    action: str


class SkillGapAnalysisResponse(BaseModel):
    role_id: str
    role_title: str
    category: str
    industry_demand: str
    salary_range: str
    description: str
    min_recommended_cgpa: float
    cgpa_met: bool
    match_percentage: float = Field(..., ge=0.0, le=100.0)
    readiness_level: str
    badge_color: str
    readiness_desc: str
    estimated_prep_weeks: int
    critical_skills_summary: TierSummary
    important_skills_summary: TierSummary
    optional_skills_summary: TierSummary
    acquired_skills: List[str]
    missing_critical: List[SkillItemDetail]
    missing_important: List[SkillItemDetail]
    missing_optional: List[SkillItemDetail]
    roi_recommendations: List[RoiRecommendation]


class RoleRankingItem(BaseModel):
    role_id: str
    role_title: str
    category: str
    industry_demand: str
    salary_range: str
    match_percentage: float
    readiness_level: str
    badge_color: str
    missing_critical_count: int
    missing_important_count: int
    estimated_prep_weeks: int


class CustomSkillGapRequest(BaseModel):
    role_id: str
    skills: List[str] = Field(default_factory=list)
    cgpa: Optional[float] = Field(default=7.5, ge=0.0, le=10.0)
