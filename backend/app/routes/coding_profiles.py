from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import asyncio

from backend.app.database import get_database, persist_db_if_fallback
from backend.app.auth.deps import get_current_user
from backend.app.schemas.coding_profiles import (
    CodingProfileVerifyRequest,
    CodingProfileResponse,
    GitHubStats,
    LeetCodeStats,
    BadgeItem,
)
from backend.app.models.student import get_or_create_student
from backend.app.analytics.coding_scraper import (
    fetch_github_profile,
    fetch_leetcode_profile,
    compute_code_quality_index,
)

router = APIRouter(prefix="/coding-profiles", tags=["Coding Profiles & Scraper"])


@router.post("/verify", response_model=CodingProfileResponse)
async def verify_coding_profiles(
    payload: CodingProfileVerifyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> CodingProfileResponse:
    """
    Scrape and verify public GitHub repositories and LeetCode problem solving metrics.
    Calculates Code Quality Index (CQI), awards verified badges, and synchronizes
    the candidate's coding assessment benchmark in MongoDB.
    """
    db = get_database()
    student = await get_or_create_student(db, current_user)
    user_id = str(current_user["id"])

    github_user = (payload.github_username or "").strip()
    leetcode_user = (payload.leetcode_username or "").strip()

    if not github_user and not leetcode_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least one valid GitHub or LeetCode username.",
        )

    # Concurrently fetch both coding profiles
    github_task = fetch_github_profile(github_user) if github_user else None
    leetcode_task = fetch_leetcode_profile(leetcode_user) if leetcode_user else None

    gh_res, lc_res = None, None
    if github_task and leetcode_task:
        gh_res, lc_res = await asyncio.gather(github_task, leetcode_task)
    elif github_task:
        gh_res = await github_task
        lc_res = {
            "username": "",
            "total_solved": 0,
            "easy_solved": 0,
            "medium_solved": 0,
            "hard_solved": 0,
            "ranking": 0,
            "acceptance_rate": 0.0,
            "contest_rating": None,
            "source": "none",
        }
    elif leetcode_task:
        lc_res = await leetcode_task
        gh_res = {
            "username": "",
            "avatar_url": "",
            "public_repos": 0,
            "stars_received": 0,
            "followers": 0,
            "top_languages": [],
            "recent_commits_30d": 0,
            "account_age_years": 0,
            "source": "none",
        }

    cqi_summary = compute_code_quality_index(gh_res, lc_res)

    synced_at = datetime.now(timezone.utc).isoformat()
    coding_profile_data = {
        "github_username": github_user or None,
        "leetcode_username": leetcode_user or None,
        "github_stats": gh_res if github_user else None,
        "leetcode_stats": lc_res if leetcode_user else None,
        "code_quality_index": cqi_summary["code_quality_index"],
        "calibrated_coding_score": cqi_summary["calibrated_coding_score"],
        "dsa_score_contribution": cqi_summary["dsa_score_contribution"],
        "git_score_contribution": cqi_summary["git_score_contribution"],
        "badges": cqi_summary["badges"],
        "last_synced_at": synced_at,
    }

    # Atomically update student record with new coding_profiles and calibrated coding_score
    current_assessments = student.get("assessments") or {}
    current_assessments["coding_score"] = cqi_summary["calibrated_coding_score"]

    await db.students.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "coding_profiles": coding_profile_data,
                "assessments.coding_score": cqi_summary["calibrated_coding_score"],
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    await persist_db_if_fallback()

    return CodingProfileResponse(**coding_profile_data)


@router.get("/me", response_model=CodingProfileResponse)
async def get_my_coding_profiles(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> CodingProfileResponse:
    """
    Retrieve verified GitHub and LeetCode analytics for the current student.
    """
    db = get_database()
    student = await get_or_create_student(db, current_user)
    saved = student.get("coding_profiles")

    if saved:
        return CodingProfileResponse(**saved)

    return CodingProfileResponse(
        github_username=None,
        leetcode_username=None,
        github_stats=None,
        leetcode_stats=None,
        code_quality_index=0.0,
        calibrated_coding_score=student.get("assessments", {}).get("coding_score", 70.0),
        dsa_score_contribution=0.0,
        git_score_contribution=0.0,
        badges=[],
        last_synced_at=datetime.now(timezone.utc).isoformat(),
    )

