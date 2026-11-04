from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional

from backend.app.database import get_database
from backend.app.auth.deps import get_optional_current_user
from backend.app.schemas.copilot import (
    CopilotChatRequest,
    CopilotChatResponse,
    CopilotSuggestionsResponse,
)
from backend.app.models.student import get_or_create_student
from backend.app.analytics.career_copilot import generate_copilot_response
from backend.app.analytics.skill_gap import analyze_skill_gap
from backend.app.models.job_roles import JOB_ROLES, get_role_by_id
from ml.inference.predictor import get_predictor

router = APIRouter(prefix="/copilot", tags=["Career Copilot (Chatbot)"])


@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_career_copilot(
    payload: CopilotChatRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> CopilotChatResponse:
    """
    Interact with the context-aware HireMatrix Career Copilot.
    Supports both authenticated students (injecting live CGPA, backlogs, ML readiness,
    LeetCode metrics, and skill voids) and public webpage visitors inquiring about
    HireMatrix capabilities, SVAR voice tests, and placement prep.
    """
    db = get_database()
    if current_user:
        student = await get_or_create_student(db, current_user)
    else:
        # Default guest candidate profile for public webpage visitors
        student = {
            "name": "Candidate",
            "cgpa": 7.5,
            "backlogs": 0,
            "education": {"branch": "Computer Science & Engineering"},
            "skills": {"python": 3, "data_structures": 3, "sql": 3},
            "assessments": {"coding_score": 70.0, "communication_score": 75.0},
        }

    # 1. Evaluate ML Placement Readiness if predictor is ready
    prediction_summary = None
    try:
        predictor = get_predictor()
        pred_res = predictor.predict(student)
        prediction_summary = {
            "readiness_percentage": pred_res.get("placement_probability_pct", 75),
            "tier": pred_res.get("predicted_tier", "Tier 2"),
        }
    except Exception:
        prediction_summary = {"readiness_percentage": 75, "tier": "Tier 2"}

    # 2. Evaluate target role skill gaps
    role_key = (payload.target_role or "software_engineer").lower().replace(" ", "_").replace("-", "_")
    if not get_role_by_id(role_key):
        role_key = "software_engineer"

    skills = student.get("skills", {})
    cgpa = float(student.get("cgpa", 7.0))
    skill_gap_summary = None
    try:
        gap_res = analyze_skill_gap(skills, role_id=role_key, candidate_cgpa=cgpa)
        skill_gap_summary = {
            "target_role": gap_res.get("role_title", "Software Engineer"),
            "missing_critical": [s["skill"] for s in gap_res.get("missing_skills", {}).get("critical", [])],
            "missing_important": [s["skill"] for s in gap_res.get("missing_skills", {}).get("important", [])],
            "match_percentage": gap_res.get("overall_match_percentage", 65),
        }
    except Exception:
        skill_gap_summary = {
            "target_role": "Software Engineer",
            "missing_critical": ["System Design", "Advanced Algorithms"],
            "missing_important": ["Docker", "PostgreSQL"],
            "match_percentage": 65,
        }

    # 3. Resume ATS summary check if stored in student profile
    resume_summary = student.get("resume_summary")

    copilot_result = generate_copilot_response(
        query=payload.message,
        student_profile=student,
        skill_gap_summary=skill_gap_summary,
        prediction_summary=prediction_summary,
        resume_summary=resume_summary,
        history=payload.history,
    )

    return CopilotChatResponse(**copilot_result)


@router.get("/suggestions", response_model=CopilotSuggestionsResponse)
async def get_copilot_suggestions(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> CopilotSuggestionsResponse:
    """
    Retrieve starter question chips based on student profile and platform capabilities.
    """
    suggestions = [
        "What is HireMatrix AI?",
        "How does the SVAR Voice test work?",
        "How can I boost my placement readiness past 90%?",
    ]

    if current_user:
        db = get_database()
        student = await get_or_create_student(db, current_user)
        backlogs = student.get("backlogs", 0)
        cgpa = student.get("cgpa", 7.0)
        coding_profiles = student.get("coding_profiles") or {}
        has_leetcode = bool(coding_profiles.get("leetcode_username"))

        if backlogs > 0:
            suggestions.append("How should I explain my backlogs to campus interviewers?")
        else:
            suggestions.append(f"Which top companies recruit with {cgpa} CGPA?")

        if has_leetcode:
            suggestions.append("Give me a 30-day DSA roadmap for LeetCode Mediums")
        else:
            suggestions.append("Show ATS resume bullet formula (Google XYZ format)")
    else:
        suggestions.append("Show all features on this webpage")
        suggestions.append("How to get started on HireMatrix")

    return CopilotSuggestionsResponse(suggestions=suggestions)
