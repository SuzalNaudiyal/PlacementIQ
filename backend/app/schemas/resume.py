"""
Pydantic schemas for Resume Parsing and ATS Compatibility Scoring.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ParsedContact(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None


class ParsedEducation(BaseModel):
    degree: Optional[str] = "B.Tech"
    branch: Optional[str] = "Computer Science"
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None


class ATSSectionScore(BaseModel):
    section_name: str
    score: int
    max_score: int
    status: str
    feedback: str


class ATSAnalysis(BaseModel):
    total_score: int = Field(..., ge=0, le=100)
    rating: str
    summary: str
    section_scores: List[ATSSectionScore]
    action_verbs_found: List[str]
    quantified_bullets_count: int
    strengths: List[str]
    critical_improvements: List[str]


class ParsedResumeResponse(BaseModel):
    filename: str
    file_type: str
    total_words: int
    page_count: int
    contact: ParsedContact
    education: ParsedEducation
    skills: Dict[str, List[str]]
    projects_detected: List[Dict[str, Any]]
    experience_detected: List[Dict[str, Any]]
    certifications_detected: List[str]
    ats_analysis: ATSAnalysis
    profile_updated: bool = False
