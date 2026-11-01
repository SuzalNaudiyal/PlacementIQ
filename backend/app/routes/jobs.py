"""
Job Postings and Semantic Matching API Endpoints.
Provides campus placement discovery, semantic candidate-job fit evaluation, and eligibility auditing.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.models.jobs import get_all_jobs, get_job_by_id
from backend.app.analytics.job_matcher import (
    evaluate_job_match,
    match_all_jobs_for_candidate,
)
from backend.app.schemas.jobs import (
    JobSummary,
    JobMatchItem,
    JobMatchListResponse,
    CustomJobMatchRequest,
)

router = APIRouter(prefix="/jobs", tags=["Campus Placement Job Matching"])


@router.get("", response_model=List[JobSummary])
async def list_campus_jobs(
    tier: Optional[str] = Query(None, description="Filter by company tier"),
    min_cgpa: Optional[float] = Query(None, description="Filter by max required CGPA"),
):
    """
    List all active campus placement opportunities with optional filtering.
    """
    jobs = get_all_jobs()
    if tier and tier != "All":
        jobs = [j for j in jobs if j.get("company_tier") == tier]
    if min_cgpa is not None:
        jobs = [j for j in jobs if j.get("min_cgpa") <= min_cgpa]

    return [JobSummary(**j) for j in jobs]


@router.get("/match", response_model=JobMatchListResponse)
async def match_jobs_for_authenticated_student(
    eligible_only: bool = Query(False, description="Filter to jobs where candidate meets CGPA criteria"),
    tier: Optional[str] = Query(None, description="Filter by company tier"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Calculates semantic match and skill overlap between authenticated student
    and all campus placement job postings.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    student = await db.students.find_one({"user_id": user_id})

    skills_data = {}
    cgpa = 7.5
    summary_text = ""

    if student:
        skills_data = student.get("skills", {})
        cgpa = float(student.get("cgpa", 7.5))
        # Build rich summary from profile projects and internships
        projects = student.get("projects", [])
        project_text = " ".join([f"{p.get('title', '')} {p.get('tech_stack', '')} {p.get('description', '')}" for p in projects])
        internships = student.get("internships", [])
        intern_text = " ".join([f"{i.get('company', '')} {i.get('role', '')} {i.get('description', '')}" for i in internships])
        summary_text = f"Student pursuing {student.get('branch', 'Computer Science')}. Experience in {project_text} {intern_text}"
    else:
        # Check latest parsed resume
        latest_resume = await db.resumes.find_one(
            {"user_id": user_id}, sort=[("created_at", -1)]
        )
        if latest_resume and latest_resume.get("parsed_data"):
            skills_data = latest_resume["parsed_data"].get("skills", [])
            cgpa = float(latest_resume["parsed_data"].get("cgpa") or 7.5)
            summary_text = latest_resume.get("raw_text", "")[:1000]

    matches = match_all_jobs_for_candidate(
        candidate_skills=skills_data,
        candidate_cgpa=cgpa,
        candidate_summary_text=summary_text,
        filter_eligible_only=eligible_only,
        company_tier_filter=tier,
    )

    eligible_count = sum(1 for m in matches if m["cgpa_eligible"])
    high_match_count = sum(1 for m in matches if m["match_percentage"] >= 70.0)
    top_company = matches[0]["company"] if matches else None

    return JobMatchListResponse(
        matches=[JobMatchItem(**m) for m in matches],
        total_jobs=len(matches),
        eligible_jobs_count=eligible_count,
        high_match_count=high_match_count,
        top_recommended_company=top_company,
    )


@router.post("/match-custom", response_model=JobMatchListResponse)
async def match_custom_candidate_profile(payload: CustomJobMatchRequest):
    """
    Ad-hoc job matching for custom skills, CGPA, and summary.
    Enables candidates to test what companies they qualify for if they gain specific skills.
    """
    matches = match_all_jobs_for_candidate(
        candidate_skills=payload.skills,
        candidate_cgpa=payload.cgpa or 7.5,
        candidate_summary_text=payload.summary_text or "",
        filter_eligible_only=payload.filter_eligible_only or False,
        company_tier_filter=payload.company_tier,
    )

    eligible_count = sum(1 for m in matches if m["cgpa_eligible"])
    high_match_count = sum(1 for m in matches if m["match_percentage"] >= 70.0)
    top_company = matches[0]["company"] if matches else None

    return JobMatchListResponse(
        matches=[JobMatchItem(**m) for m in matches],
        total_jobs=len(matches),
        eligible_jobs_count=eligible_count,
        high_match_count=high_match_count,
        top_recommended_company=top_company,
    )


@router.get("/{job_id}", response_model=JobSummary)
async def get_single_campus_job(job_id: str):
    """
    Retrieve full details of a specific job posting.
    """
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campus job opportunity '{job_id}' not found.",
        )
    return JobSummary(**job)
