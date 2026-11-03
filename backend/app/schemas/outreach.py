from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional


class GenerateOutreachRequest(BaseModel):
    company_name: str = Field(..., example="Google")
    job_role: str = Field(..., example="Software Development Engineer - I")
    job_id: Optional[str] = Field(None, example="REQ-104928")


class CandidateSummary(BaseModel):
    name: str
    cgpa: float
    top_skills: str
    primary_language: str
    top_project_name: str
    top_project_tech: str
    total_solved: int
    cqi: float
    university: str
    branch: str
    graduation_year: int


class OutreachResponse(BaseModel):
    company_name: str
    job_role: str
    candidate_summary: Dict[str, Any]
    subject_lines: List[str]
    messages: Dict[str, str]
    tips: List[str]

