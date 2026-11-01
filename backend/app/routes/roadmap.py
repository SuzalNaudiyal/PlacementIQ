"""
Personalized Learning Roadmap API Endpoints.
Provides 8-week milestone curriculum generation, weekly action item tracking, and task completion persistence.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.models.job_roles import get_role_by_id
from backend.app.analytics.roadmap_generator import generate_eight_week_roadmap
from backend.app.schemas.roadmap import (
    RoadmapResponse,
    GenerateRoadmapRequest,
    ToggleTaskRequest,
)

router = APIRouter(prefix="/roadmap", tags=["Personalized 8-Week Learning Roadmap"])


@router.get("", response_model=RoadmapResponse)
async def get_or_create_student_roadmap(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieve the current student's active 8-week learning roadmap.
    If no roadmap exists, automatically synthesizes one based on their profile skills and target role.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))

    # Check for existing roadmap
    existing = await db.roadmaps.find_one({"user_id": user_id})
    if existing and "weeks" in existing:
        return RoadmapResponse(**existing)

    # Fetch student profile for skills & target role
    student = await db.students.find_one({"user_id": user_id})
    skills_data = {}
    cgpa = 7.5
    target_role = "full-stack-developer"

    if student:
        skills_data = student.get("skills", {})
        cgpa = float(student.get("cgpa", 7.5))
        preferred = student.get("preferred_roles", [])
        if preferred and len(preferred) > 0:
            target_role = preferred[0]

    # Generate fresh roadmap
    new_roadmap = generate_eight_week_roadmap(skills_data, target_role, cgpa)
    new_roadmap["user_id"] = user_id
    new_roadmap["updated_at"] = datetime.now(timezone.utc)

    # Persist in DB
    try:
        await db.roadmaps.update_one(
            {"user_id": user_id},
            {"$set": new_roadmap},
            upsert=True,
        )
    except Exception:
        pass

    return RoadmapResponse(**new_roadmap)


@router.post("/generate", response_model=RoadmapResponse)
async def generate_new_roadmap_for_role(
    payload: GenerateRoadmapRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generate or regenerate a customized 8-week roadmap targeting a specific job role.
    """
    role = get_role_by_id(payload.role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target role ID '{payload.role_id}' not found.",
        )

    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    student = await db.students.find_one({"user_id": user_id})

    skills_data = {}
    cgpa = 7.5
    if student:
        skills_data = student.get("skills", {})
        cgpa = float(student.get("cgpa", 7.5))

    new_roadmap = generate_eight_week_roadmap(skills_data, payload.role_id, cgpa)
    new_roadmap["user_id"] = user_id
    new_roadmap["updated_at"] = datetime.now(timezone.utc)

    try:
        await db.roadmaps.update_one(
            {"user_id": user_id},
            {"$set": new_roadmap},
            upsert=True,
        )
    except Exception:
        pass

    return RoadmapResponse(**new_roadmap)


@router.put("/task/toggle", response_model=RoadmapResponse)
async def toggle_roadmap_task(
    payload: ToggleTaskRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Toggle task completion status and recalculate student's progress percentage.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))

    roadmap = await db.roadmaps.find_one({"user_id": user_id})
    if not roadmap or "weeks" not in roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active roadmap found for current student. Please generate one first.",
        )

    task_found = False
    for week in roadmap["weeks"]:
        for task in week.get("tasks", []):
            if task["id"] == payload.task_id:
                task["completed"] = payload.completed
                task_found = True
                break
        if task_found:
            break

    if not task_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task ID '{payload.task_id}' not found in active roadmap.",
        )

    # Recalculate completion metrics
    total_tasks = sum(len(w.get("tasks", [])) for w in roadmap["weeks"])
    completed_tasks = sum(
        sum(1 for t in w.get("tasks", []) if t.get("completed", False))
        for w in roadmap["weeks"]
    )
    roadmap["total_tasks"] = total_tasks
    roadmap["completed_tasks"] = completed_tasks
    roadmap["progress_percentage"] = round(
        (completed_tasks / total_tasks * 100.0) if total_tasks > 0 else 0.0, 1
    )
    roadmap["updated_at"] = datetime.now(timezone.utc)

    try:
        await db.roadmaps.update_one(
            {"user_id": user_id},
            {"$set": roadmap},
        )
    except Exception:
        pass

    return RoadmapResponse(**roadmap)
