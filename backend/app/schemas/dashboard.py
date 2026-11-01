"""
Pydantic schemas for Unified Student Analytics Dashboard.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class RadarBenchmarkPoint(BaseModel):
    subject: str
    candidate_score: float = Field(..., ge=0.0, le=100.0)
    industry_benchmark: float = Field(..., ge=0.0, le=100.0)
    full_mark: float = 100.0


class DashboardKpis(BaseModel):
    placement_probability: float
    placement_status: str
    predicted_salary_tier: str
    ats_score: Optional[float] = None
    ats_grade: Optional[str] = None
    top_role_title: str
    top_role_match: float
    top_company_name: str
    top_company_match: float
    roadmap_progress: float
    completed_tasks_count: int
    total_tasks_count: int
    profile_completeness: float


class DashboardSummaryResponse(BaseModel):
    student_name: str
    student_email: str
    branch: str
    cgpa: float
    kpis: DashboardKpis
    radar_benchmarks: List[RadarBenchmarkPoint]
    top_positive_factors: List[str]
    critical_risk_factors: List[str]
    next_recommended_actions: List[Dict[str, str]]
