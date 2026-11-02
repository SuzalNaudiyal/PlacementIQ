from datetime import datetime, timezone
from typing import Dict, Any, Optional


def calculate_profile_completeness(doc: Dict[str, Any]) -> int:
    """
    Calculate an objective profile completeness score (0 - 100%)
    based on the presence of essential academic, skill, and project sections.
    """
    score = 0

    # 1. Personal contact details (15 pts)
    personal = doc.get("personal", {})
    if personal.get("phone") or personal.get("location"):
        score += 15

    # 2. Education & Academic Standing (25 pts)
    edu = doc.get("education", {})
    if edu.get("university") and edu.get("branch"):
        score += 15
    if doc.get("cgpa", 0) > 0:
        score += 10

    # 3. Technical Skills Breadth (25 pts)
    skills = doc.get("skills", {})
    total_skills = 0
    if isinstance(skills, dict):
        for cat_list in skills.values():
            if isinstance(cat_list, list):
                total_skills += len(cat_list)
    elif isinstance(skills, list):
        total_skills = len(skills)

    if total_skills >= 5:
        score += 25
    elif total_skills >= 2:
        score += 15
    elif total_skills >= 1:
        score += 5

    # 4. Projects (15 pts)
    projects = doc.get("projects", [])
    if len(projects) >= 2:
        score += 15
    elif len(projects) >= 1:
        score += 10

    # 5. Internships & Experience (10 pts)
    internships = doc.get("internships", [])
    if len(internships) >= 1:
        score += 10

    # 6. Assessment Scores (10 pts)
    assessments = doc.get("assessments", {})
    if assessments.get("coding_score") is not None and assessments.get("aptitude_score") is not None:
        score += 10

    return min(100, max(0, score))


def student_entity(doc: Optional[Dict[str, Any]], user_doc: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """
    Transform raw MongoDB student document into standard StudentProfileResponse format.
    """
    if not doc:
        return None

    updated_at = doc.get("updated_at")
    if isinstance(updated_at, datetime):
        updated_at_str = updated_at.isoformat()
    elif isinstance(updated_at, str):
        updated_at_str = updated_at
    else:
        updated_at_str = datetime.now(timezone.utc).isoformat()

    name = user_doc.get("name", "") if user_doc else doc.get("name", "")
    email = user_doc.get("email", "") if user_doc else doc.get("email", "")

    completeness = calculate_profile_completeness(doc)

    raw_certs = doc.get("certifications", [])
    normalized_certs = []
    for c in raw_certs:
        if isinstance(c, str):
            if "(" in c and c.endswith(")"):
                parts = c[:-1].rsplit("(", 1)
                normalized_certs.append({"name": parts[0].strip(), "issuer": parts[1].strip(), "year": None})
            else:
                normalized_certs.append({"name": c.strip(), "issuer": "", "year": None})
        elif isinstance(c, dict):
            normalized_certs.append(c)

    return {
        "id": str(doc.get("_id", "")),
        "user_id": str(doc.get("user_id", "")),
        "name": name,
        "email": email,
        "personal": doc.get("personal") or {
            "phone": doc.get("phone", ""),
            "location": doc.get("location", ""),
        },
        "education": doc.get("education") or {
            "degree": "B.Tech",
            "branch": "Computer Science",
            "university": "",
            "graduation_year": 2026,
        },
        "cgpa": float(doc.get("cgpa", 7.0)),
        "backlogs": int(doc.get("backlogs", 0)),
        "skills": doc.get("skills") or {
            "programming": [],
            "databases": [],
            "frameworks": [],
            "cloud": [],
            "data_ai": [],
            "soft_skills": [],
        },
        "projects": doc.get("projects", []),
        "internships": doc.get("internships", []),
        "certifications": normalized_certs,
        "assessments": doc.get("assessments") or {
            "coding_score": 70.0,
            "aptitude_score": 75.0,
            "communication_score": 80.0,
            "technical_interview_score": 75.0,
        },
        "completeness_percent": completeness,
        "updated_at": updated_at_str,
    }


async def get_or_create_student(db, current_user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Retrieve existing student profile document for authenticated user.
    If not found by user_id, attempts resolution via email (for imported rosters or prior signups).
    If still absent, auto-initializes standard student profile document in DB.
    """
    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_email = (current_user.get("email") or "").strip().lower()

    # 1. Query by primary user_id
    student = None
    if user_id:
        student = await db.students.find_one({"user_id": user_id})

    # 2. Fallback query by email (matches ERP roster imports or legacy registrations)
    if not student and user_email:
        student = await db.students.find_one({
            "$or": [
                {"email": user_email},
                {"personal.email": user_email},
            ]
        })
        if student and user_id:
            await db.students.update_one(
                {"_id": student["_id"]},
                {"$set": {"user_id": user_id, "updated_at": datetime.now(timezone.utc)}},
            )

    # 3. Auto-initialize default student profile if not found
    if not student:
        new_student_doc = {
            "user_id": user_id,
            "personal": {"phone": "", "location": ""},
            "education": {
                "degree": "B.Tech",
                "branch": "Computer Science & Engineering",
                "university": "Apex Institute of Technology",
                "graduation_year": 2026,
            },
            "cgpa": 7.5,
            "backlogs": 0,
            "skills": {
                "programming": ["Python", "SQL", "JavaScript"],
                "databases": ["PostgreSQL", "MongoDB"],
                "frameworks": ["FastAPI", "React"],
                "cloud": ["Docker"],
                "data_ai": [],
                "soft_skills": ["Problem Solving", "Communication"],
            },
            "projects": [],
            "internships": [],
            "certifications": [],
            "assessments": {
                "coding_score": 75.0,
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

    return student
