from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime, timezone


class PersonalDetails(BaseModel):
    phone: Optional[str] = Field(default="", max_length=20, description="Contact phone number")
    location: Optional[str] = Field(default="", max_length=100, description="City, State / Country")


class EducationDetails(BaseModel):
    degree: str = Field(default="B.Tech", max_length=50, description="Degree name (e.g. B.Tech, B.E., BCA, MCA)")
    branch: str = Field(default="Computer Science", max_length=100, description="Specialization / Department")
    university: str = Field(default="", max_length=150, description="College or University name")
    graduation_year: int = Field(default=2026, ge=2020, le=2035, description="Expected graduation year")


class SkillsGroup(BaseModel):
    programming: List[str] = Field(default_factory=list, description="Programming languages (e.g. Python, Java, C++)")
    databases: List[str] = Field(default_factory=list, description="Databases (e.g. SQL, MongoDB, PostgreSQL)")
    frameworks: List[str] = Field(default_factory=list, description="Frameworks (e.g. React, FastAPI, Node.js)")
    cloud: List[str] = Field(default_factory=list, description="Cloud platforms (e.g. AWS, Azure, GCP)")
    data_ai: List[str] = Field(default_factory=list, description="Data & AI tools (e.g. Pandas, NumPy, Power BI)")
    soft_skills: List[str] = Field(default_factory=list, description="Soft skills (e.g. Problem Solving, Teamwork)")


class ProjectItem(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    description: str = Field(default="", max_length=1000)
    technologies: List[str] = Field(default_factory=list)
    link: Optional[str] = Field(default=None, max_length=200)


class InternshipItem(BaseModel):
    company: str = Field(..., min_length=2, max_length=120)
    role: str = Field(..., min_length=2, max_length=100)
    duration_months: int = Field(default=3, ge=1, le=36)
    description: str = Field(default="", max_length=1000)


class CertificationItem(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    issuer: Optional[str] = Field(default="", max_length=100)
    year: Optional[int] = Field(default=None, ge=2015, le=2030)

    @model_validator(mode="before")
    @classmethod
    def parse_from_string_or_dict(cls, data: Any) -> Any:
        if isinstance(data, str):
            if "(" in data and data.endswith(")"):
                parts = data[:-1].rsplit("(", 1)
                return {"name": parts[0].strip(), "issuer": parts[1].strip(), "year": None}
            return {"name": data.strip(), "issuer": "", "year": None}
        return data


class AssessmentScores(BaseModel):
    coding_score: float = Field(default=70.0, ge=0.0, le=100.0, description="Coding assessment score (0-100)")
    aptitude_score: float = Field(default=75.0, ge=0.0, le=100.0, description="Quantitative & reasoning score (0-100)")
    communication_score: float = Field(default=80.0, ge=0.0, le=100.0, description="Communication score (0-100)")
    technical_interview_score: float = Field(default=75.0, ge=0.0, le=100.0, description="Mock tech interview score (0-100)")


class StudentProfileUpdate(BaseModel):
    """
    Schema for updating student academic and professional profile.
    """
    personal: Optional[PersonalDetails] = Field(default_factory=PersonalDetails)
    education: Optional[EducationDetails] = Field(default_factory=EducationDetails)
    cgpa: float = Field(default=7.0, ge=0.0, le=10.0, description="Cumulative Grade Point Average (0.0 - 10.0)")
    backlogs: int = Field(default=0, ge=0, le=20, description="Number of active academic backlogs")
    skills: Optional[SkillsGroup] = Field(default_factory=SkillsGroup)
    projects: List[ProjectItem] = Field(default_factory=list)
    internships: List[InternshipItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
    assessments: Optional[AssessmentScores] = Field(default_factory=AssessmentScores)


class StudentProfileResponse(BaseModel):
    """
    Complete student profile serialization with calculated completeness and user metadata.
    """
    id: str
    user_id: str
    name: str
    email: str
    personal: PersonalDetails
    education: EducationDetails
    cgpa: float
    backlogs: int
    skills: SkillsGroup
    projects: List[ProjectItem]
    internships: List[InternshipItem]
    certifications: List[CertificationItem]
    assessments: AssessmentScores
    completeness_percent: int = Field(..., ge=0, le=100, description="Profile completeness percentage")
    updated_at: str
