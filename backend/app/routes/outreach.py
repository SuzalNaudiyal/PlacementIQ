from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.models.student import get_or_create_student
from backend.app.schemas.outreach import GenerateOutreachRequest, OutreachResponse
from backend.app.analytics.outreach_generator import (
    generate_outreach_messages,
    OUTREACH_TEMPLATES,
)

router = APIRouter(prefix="/outreach", tags=["LinkedIn Cold Outreach & Referral Generator"])


@router.get("/templates")
async def get_outreach_templates():
    """
    Returns available outreach communication templates and strategies.
    """
    return {
        "templates": OUTREACH_TEMPLATES,
        "default_companies": [
            "Google",
            "Microsoft",
            "Amazon",
            "Adobe",
            "Uber",
            "Atlassian",
            "TCS",
            "Infosys",
            "Oracle",
            "Salesforce",
        ],
    }


@router.post("/generate", response_model=OutreachResponse)
async def generate_outreach(
    payload: GenerateOutreachRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> OutreachResponse:
    """
    Generate customized LinkedIn and email cold outreach pitches for a specific target company and role.
    Dynamically injects candidate's verified university, CGPA, LeetCode metrics, and project portfolio.
    """
    company = payload.company_name.strip()
    role = payload.job_role.strip()

    if not company or not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name and job role are required to generate personalized outreach pitches.",
        )

    db = get_database()
    student = await get_or_create_student(db, current_user)

    result = generate_outreach_messages(
        company_name=company,
        job_role=role,
        student_doc=student,
        user_doc=current_user,
        job_id=payload.job_id or "",
    )

    return OutreachResponse(**result)

