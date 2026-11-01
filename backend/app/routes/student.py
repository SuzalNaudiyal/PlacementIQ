from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from typing import Dict, Any

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.schemas.student import StudentProfileUpdate, StudentProfileResponse
from backend.app.models.student import student_entity
from backend.app.models.skills_taxonomy import SKILL_TAXONOMY

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
    user_id = str(current_user["id"])

    student = await db.students.find_one({"user_id": user_id})
    if not student:
        # Initialize default student document
        new_student_doc = {
            "user_id": user_id,
            "personal": {"phone": "", "location": ""},
            "education": {
                "degree": "B.Tech",
                "branch": "Computer Science",
                "university": "",
                "graduation_year": 2026,
            },
            "cgpa": 7.0,
            "backlogs": 0,
            "skills": {
                "programming": [],
                "databases": [],
                "frameworks": [],
                "cloud": [],
                "data_ai": [],
                "soft_skills": [],
            },
            "projects": [],
            "internships": [],
            "certifications": [],
            "assessments": {
                "coding_score": 70.0,
                "aptitude_score": 75.0,
                "communication_score": 80.0,
                "technical_interview_score": 75.0,
            },
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        res = await db.students.insert_one(new_student_doc)
        new_student_doc["_id"] = res.inserted_id
        student = new_student_doc

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
