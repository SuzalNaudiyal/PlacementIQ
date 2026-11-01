"""
Skill Gap Analysis API Endpoints.
Provides industry job roles exploration, 3-tier gap analysis, and tailored role recommendations.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.models.job_roles import get_all_roles, get_role_by_id
from backend.app.analytics.skill_gap import analyze_skill_gap, rank_all_roles_for_candidate
from backend.app.schemas.skill_gap import (
    RoleSummary,
    SkillGapAnalysisResponse,
    RoleRankingItem,
    CustomSkillGapRequest,
)

router = APIRouter(prefix="/skill-gap", tags=["Skill Gap Analysis & Role Fit"])


@router.get("/roles", response_model=List[RoleSummary])
async def list_available_job_roles():
    """
    List all supported industry benchmark roles with skill breakdown.
    """
    roles = get_all_roles()
    return [RoleSummary(**r) for r in roles]


@router.get("/roles/{role_id}", response_model=RoleSummary)
async def get_single_job_role(role_id: str):
    """
    Retrieve details and 3-tier skill taxonomy for a specific job role.
    """
    role = get_role_by_id(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job role with ID '{role_id}' not found.",
        )
    return RoleSummary(**role)


@router.get("/analyze/{role_id}", response_model=SkillGapAnalysisResponse)
async def analyze_student_skill_gap(
    role_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Evaluate the authenticated student's profile against a target role.
    Computes 3-tier match percentage, identifies disqualifiers, and estimates prep time.
    """
    role = get_role_by_id(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job role with ID '{role_id}' not found.",
        )

    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    student = await db.students.find_one({"user_id": user_id})

    skills_data = {}
    cgpa = 7.5
    if student:
        skills_data = student.get("skills", {})
        cgpa = float(student.get("cgpa", 7.5))
    else:
        # Check if student has parsed skills from a resume
        latest_resume = await db.resumes.find_one(
            {"user_id": user_id}, sort=[("created_at", -1)]
        )
        if latest_resume and latest_resume.get("parsed_data"):
            skills_data = latest_resume["parsed_data"].get("skills", [])
            cgpa = float(latest_resume["parsed_data"].get("cgpa") or 7.5)

    analysis = analyze_skill_gap(skills_data, role_id, candidate_cgpa=cgpa)
    return SkillGapAnalysisResponse(**analysis)


@router.post("/analyze-custom", response_model=SkillGapAnalysisResponse)
async def analyze_custom_skills(payload: CustomSkillGapRequest):
    """
    Ad-hoc skill gap analysis for any specified list of skills against a target role.
    Allows students or candidates to test "What if I learn these skills?" scenarios.
    """
    role = get_role_by_id(payload.role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job role with ID '{payload.role_id}' not found.",
        )

    analysis = analyze_skill_gap(
        payload.skills, payload.role_id, candidate_cgpa=payload.cgpa or 7.5
    )
    return SkillGapAnalysisResponse(**analysis)


@router.get("/top-roles", response_model=List[RoleRankingItem])
async def rank_roles_for_student(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Ranks all 10 industry benchmark roles by match percentage for current student.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    student = await db.students.find_one({"user_id": user_id})

    skills_data = {}
    cgpa = 7.5
    if student:
        skills_data = student.get("skills", {})
        cgpa = float(student.get("cgpa", 7.5))
    else:
        latest_resume = await db.resumes.find_one(
            {"user_id": user_id}, sort=[("created_at", -1)]
        )
        if latest_resume and latest_resume.get("parsed_data"):
            skills_data = latest_resume["parsed_data"].get("skills", [])
            cgpa = float(latest_resume["parsed_data"].get("cgpa") or 7.5)

    ranked = rank_all_roles_for_candidate(skills_data, candidate_cgpa=cgpa)
    return [RoleRankingItem(**item) for item in ranked]
