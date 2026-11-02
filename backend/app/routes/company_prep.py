from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.models.student import get_or_create_student
from backend.app.analytics.company_prep import (
    COMPANY_CHEAT_SHEETS,
    evaluate_company_readiness,
)

router = APIRouter(prefix="/company-prep", tags=["Company Interview Cheat Sheets"])


@router.get("")
async def get_all_company_prep_sheets(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieve all company interview cheat sheets augmented with the authenticated
    student's real-time readiness evaluation, eligibility verification, and DSA focus areas.
    """
    db = get_database()
    student = await get_or_create_student(db, current_user)

    out = []
    for sheet in COMPANY_CHEAT_SHEETS:
        sheet_copy = dict(sheet)
        readiness = evaluate_company_readiness(student, sheet["id"])
        sheet_copy["readiness_evaluation"] = readiness
        out.append(sheet_copy)

    return out


@router.get("/{company_id}")
async def get_company_prep_sheet_detail(
    company_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieve deep-dive interview cheat sheet, OA pattern, top LeetCode questions,
    and STAR behavioral scripts for a specific company.
    """
    db = get_database()
    student = await get_or_create_student(db, current_user)

    sheet = next((c for c in COMPANY_CHEAT_SHEETS if c["id"].lower() == company_id.lower()), None)
    if not sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company cheat sheet for '{company_id}' not found.",
        )

    sheet_copy = dict(sheet)
    sheet_copy["readiness_evaluation"] = evaluate_company_readiness(student, sheet["id"])
    return sheet_copy

