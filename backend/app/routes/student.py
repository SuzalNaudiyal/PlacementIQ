from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from typing import Dict, Any

from backend.app.database import get_database, persist_db_if_fallback
from backend.app.auth.deps import get_current_user
from backend.app.schemas.student import StudentProfileUpdate, StudentProfileResponse
from backend.app.schemas.dashboard import DashboardSummaryResponse, DashboardKpis, RadarBenchmarkPoint
from backend.app.models.student import student_entity, get_or_create_student
from backend.app.models.skills_taxonomy import SKILL_TAXONOMY
from ml.inference.predictor import get_predictor
from backend.app.analytics.skill_gap import rank_all_roles_for_candidate
from backend.app.analytics.job_matcher import match_all_jobs_for_candidate

router = APIRouter(prefix="/student", tags=["Student Profile"])


@router.get("/profile", response_model=StudentProfileResponse)
async def get_my_student_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> StudentProfileResponse:
    """
    Retrieve the authenticated student's academic and skills profile.
    Automatically initializes a default record if one does not exist yet.
    """
    db = get_database()
    student = await get_or_create_student(db, current_user)
    return StudentProfileResponse(**student_entity(student, current_user))


@router.put("/profile", response_model=StudentProfileResponse)
async def update_student_profile(
    payload: StudentProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> StudentProfileResponse:
    """
    Update student profile including academic history, skills taxonomy, projects, and assessment scores.
    Recalculates profile completeness score and timestamp.
    """
    db = get_database()
    user_id = str(current_user["id"])

    update_dict = payload.model_dump()
    update_dict["updated_at"] = datetime.now(timezone.utc)

    # Perform atomic upsert on students collection
    await db.students.update_one(
        {"user_id": user_id},
        {"$set": update_dict},
        upsert=True,
    )

    # Persist updated profile to snapshot on disk if in fallback mode
    await persist_db_if_fallback()

    updated_doc = await db.students.find_one({"user_id": user_id})
    return StudentProfileResponse(**student_entity(updated_doc, current_user))


@router.get("/taxonomy")
async def get_skill_taxonomy():
    """
    Retrieve standardized technical and soft skill taxonomy categorized by domain.
    """
    return {
        "categories": SKILL_TAXONOMY,
        "total_skills": sum(len(v) for v in SKILL_TAXONOMY.values()),
    }


@router.get("/dashboard-summary", response_model=DashboardSummaryResponse)
@router.get("/dashboard-summary/", response_model=DashboardSummaryResponse, include_in_schema=False)
async def get_student_dashboard_summary(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> DashboardSummaryResponse:
    """
    Unified executive telemetry synthesizing ML placement readiness, ATS audit score,
    top role fit, semantic job match, roadmap sprint status, and radar competency benchmarks.
    Resilient: auto-initializes baseline profile if user has not yet completed profile setup.
    """
    db = get_database()
    user_id = str(current_user["id"])

    # 1. Fetch or auto-initialize Student Profile (prevents 404 for any valid authenticated user)
    student = await get_or_create_student(db, current_user)

    profile_data = student_entity(student, current_user)
    skills = student.get("skills", {})
    cgpa = float(student.get("cgpa", 7.5))

    # 2. ML Prediction Telemetry
    predictor = get_predictor()
    eval_result = predictor.predict(student)

    # 3. Latest Resume ATS Score
    latest_resume = await db.resumes.find_one(
        {"user_id": user_id}, sort=[("created_at", -1)]
    )
    ats_score = None
    ats_grade = None
    if latest_resume and latest_resume.get("ats_analysis"):
        ats_score = latest_resume["ats_analysis"].get("overall_score")
        ats_grade = latest_resume["ats_analysis"].get("grade")

    # 4. Top Matched Role
    ranked_roles = rank_all_roles_for_candidate(skills, cgpa)
    top_role = ranked_roles[0] if ranked_roles else {
        "role_title": "Full Stack Developer",
        "match_percentage": 75.0,
    }

    # 5. Top Matched Company Job
    matched_jobs = match_all_jobs_for_candidate(skills, cgpa)
    top_job = matched_jobs[0] if matched_jobs else {
        "company": "Swiggy",
        "match_percentage": 78.0,
    }

    # 6. Active Roadmap Progress
    roadmap = await db.roadmaps.find_one({"user_id": user_id})
    roadmap_progress = 0.0
    completed_tasks = 0
    total_tasks = 24
    if roadmap:
        roadmap_progress = float(roadmap.get("progress_percentage", 0.0))
        completed_tasks = int(roadmap.get("completed_tasks", 0))
        total_tasks = int(roadmap.get("total_tasks", 24))

    # 7. Radar Competency Benchmarks (6 Axes scaled 0-100)
    # Axis 1: Core CS (Languages & Algorithms)
    programming_count = len(skills.get("programming", []))
    coding_score = float(student.get("assessments", {}).get("coding_score", 70.0))
    core_cs_score = min(100.0, round(programming_count * 15.0 * 0.4 + coding_score * 0.6, 1))

    # Axis 2: Modern Frameworks & Web
    framework_count = len(skills.get("frameworks", []))
    framework_score = min(100.0, round(framework_count * 20.0 + 30.0, 1))

    # Axis 3: Databases & Persistence
    db_count = len(skills.get("databases", []))
    db_score = min(100.0, round(db_count * 25.0 + 25.0, 1))

    # Axis 4: Problem Solving & Interviews
    tech_score = float(student.get("assessments", {}).get("technical_interview_score", 75.0))
    apt_score = float(student.get("assessments", {}).get("aptitude_score", 75.0))
    problem_solving_score = round((coding_score * 0.5 + tech_score * 0.3 + apt_score * 0.2), 1)

    # Axis 5: Cloud & Infrastructure
    cloud_count = len(skills.get("cloud", []))
    cloud_score = min(100.0, round(cloud_count * 22.0 + 20.0, 1))

    # Axis 6: Practical Experience & Projects
    projects_count = len(student.get("projects", []))
    internships_count = len(student.get("internships", []))
    certs_count = len(student.get("certifications", []))
    practical_score = min(100.0, round(projects_count * 20.0 + internships_count * 30.0 + certs_count * 10.0 + 10.0, 1))

    radar_points = [
        RadarBenchmarkPoint(subject="Core CS", candidate_score=core_cs_score, industry_benchmark=80.0),
        RadarBenchmarkPoint(subject="Frameworks", candidate_score=framework_score, industry_benchmark=75.0),
        RadarBenchmarkPoint(subject="Databases", candidate_score=db_score, industry_benchmark=70.0),
        RadarBenchmarkPoint(subject="Problem Solving", candidate_score=problem_solving_score, industry_benchmark=85.0),
        RadarBenchmarkPoint(subject="Cloud & Tools", candidate_score=cloud_score, industry_benchmark=65.0),
        RadarBenchmarkPoint(subject="Practical Projects", candidate_score=practical_score, industry_benchmark=75.0),
    ]

    # Actionable Recommendations
    next_actions = [
        {"title": "Bridge Critical Disqualifier", "detail": f"Eliminate mandatory missing requirements for {top_role['role_title']}."},
        {"title": "Target Fast-Track Application", "detail": f"Apply to {top_job['company']} ({top_job['match_percentage']}% match fit)."},
        {"title": "Advance 8-Week Roadmap", "detail": f"Complete remaining tasks to boost placement readiness toward 95%+."},
    ]

    return DashboardSummaryResponse(
        student_name=current_user.get("name", "Student"),
        student_email=current_user.get("email", ""),
        branch=profile_data["education"]["branch"],
        cgpa=cgpa,
        kpis=DashboardKpis(
            placement_probability=eval_result["placement_percentage"],
            placement_status=eval_result["readiness_status"],
            predicted_salary_tier=eval_result["predicted_salary_tier"],
            ats_score=ats_score,
            ats_grade=ats_grade,
            top_role_title=top_role["role_title"],
            top_role_match=top_role["match_percentage"],
            top_company_name=top_job["company"],
            top_company_match=top_job["match_percentage"],
            roadmap_progress=roadmap_progress,
            completed_tasks_count=completed_tasks,
            total_tasks_count=total_tasks,
            profile_completeness=float(profile_data.get("completeness_percent") or profile_data.get("completeness_percentage") or 70.0),
        ),
        radar_benchmarks=radar_points,
        top_positive_factors=eval_result.get("positive_factors", []),
        critical_risk_factors=eval_result.get("risk_factors", []),
        next_recommended_actions=next_actions,
    )
