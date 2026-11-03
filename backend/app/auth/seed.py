import logging
from datetime import datetime, timezone
from backend.app.database import get_database
from backend.app.auth.security import get_password_hash
from backend.app.schemas.auth import UserRole

logger = logging.getLogger("uvicorn.error")

DEMO_STUDENT = {
    "name": "Demo Student",
    "username": "student_demo",
    "email": "student@placementiq.ai",
    "password": "Student@1234",
    "role": UserRole.STUDENT.value,
    "is_active": True,
}

DEMO_ADMIN = {
    "name": "Suzal",
    "username": "Suzal",
    "email": "suzal.php@gmail.com",
    "password": "suzal@358",
    "role": UserRole.ADMIN.value,
    "is_active": True,
}

LEGACY_ADMIN = {
    "name": "Platform Administrator",
    "username": "admin",
    "email": "admin@placementiq.ai",
    "password": "Admin@1234",
    "role": UserRole.ADMIN.value,
    "is_active": True,
}


async def seed_demo_users() -> None:
    """
    Ensure default Student and Admin accounts exist in the database for instant evaluation.
    Guarantees that Suzal (suzal.php@gmail.com / suzal@358) has full Administrator access.
    """
    try:
        db = get_database()
        
        # 1. Seed or Update Primary Admin (Suzal)
        existing_suzal = await db.users.find_one({"email": DEMO_ADMIN["email"]})
        if not existing_suzal:
            suzal_doc = {
                "name": DEMO_ADMIN["name"],
                "username": DEMO_ADMIN["username"],
                "email": DEMO_ADMIN["email"],
                "password_hash": get_password_hash(DEMO_ADMIN["password"]),
                "role": DEMO_ADMIN["role"],
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
            }
            await db.users.insert_one(suzal_doc)
            logger.info("Admin account seeded (suzal.php@gmail.com / suzal@358 / username: Suzal)")
        else:
            # Refresh password hash and admin role to ensure access
            await db.users.update_one(
                {"_id": existing_suzal["_id"]},
                {
                    "$set": {
                        "name": "Suzal",
                        "username": "Suzal",
                        "password_hash": get_password_hash(DEMO_ADMIN["password"]),
                        "role": UserRole.ADMIN.value,
                        "is_active": True,
                    }
                }
            )

        # 2. Seed Legacy Admin for compatibility
        existing_legacy = await db.users.find_one({"email": LEGACY_ADMIN["email"]})
        if not existing_legacy:
            legacy_doc = {
                "name": LEGACY_ADMIN["name"],
                "username": LEGACY_ADMIN["username"],
                "email": LEGACY_ADMIN["email"],
                "password_hash": get_password_hash(LEGACY_ADMIN["password"]),
                "role": LEGACY_ADMIN["role"],
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
            }
            await db.users.insert_one(legacy_doc)

        # 3. Seed Demo Student
        existing_student = await db.users.find_one({"email": DEMO_STUDENT["email"]})
        if not existing_student:
            student_doc = {
                "name": DEMO_STUDENT["name"],
                "username": DEMO_STUDENT["username"],
                "email": DEMO_STUDENT["email"],
                "password_hash": get_password_hash(DEMO_STUDENT["password"]),
                "role": DEMO_STUDENT["role"],
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
            }
            res = await db.users.insert_one(student_doc)
            # Create corresponding student profile stub
            await db.students.update_one(
                {"user_id": str(res.inserted_id)},
                {
                    "$set": {
                        "user_id": str(res.inserted_id),
                        "education": {
                            "degree": "B.Tech",
                            "branch": "Computer Science & Engineering",
                            "university": "Apex Institute of Technology",
                            "graduation_year": 2026,
                        },
                        "cgpa": 7.5,
                        "backlogs": 0,
                        "skills": {
                            "programming": ["Python", "JavaScript", "SQL"],
                            "databases": ["MongoDB", "MySQL"],
                            "frameworks": ["FastAPI", "React"],
                            "tools": ["Excel", "Git"],
                            "soft_skills": ["Problem Solving", "Team Collaboration"],
                        },
                        "projects": [
                            {
                                "title": "E-Commerce Inventory Forecasting",
                                "description": "Time-series forecasting model using ARIMA and Prophet to optimize retail warehouse stock.",
                                "technologies": ["Python", "Pandas", "Prophet"],
                            },
                            {
                                "title": "Real-Time Campus Job Portal",
                                "description": "Full-stack web application with instant notifications and applicant tracking.",
                                "technologies": ["React", "FastAPI", "MongoDB"],
                            },
                        ],
                        "internships": [
                            {
                                "company": "Apex Analytics Lab",
                                "role": "Data Analyst Intern",
                                "duration_months": 3,
                                "description": "Analyzed operational customer churn metrics and built internal reporting dashboards using SQL and Excel.",
                            }
                        ],
                        "certifications": [
                            {"name": "SQL Advanced Queries", "issuer": "HackerRank", "year": 2025},
                            {"name": "Python for Data Science", "issuer": "Coursera", "year": 2024},
                        ],
                        "assessments": {
                            "coding_score": 75,
                            "aptitude_score": 80,
                            "communication_score": 85,
                            "technical_interview_score": 78,
                        },
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
                upsert=True,
            )
            logger.info("Demo Student account seeded (student@placementiq.ai / Student@1234)")

    except Exception as e:
        logger.warning(f"User seeding error: {e}")
