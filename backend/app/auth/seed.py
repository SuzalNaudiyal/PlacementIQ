import logging
from datetime import datetime, timezone
from backend.app.database import get_database
from backend.app.auth.security import get_password_hash
from backend.app.schemas.auth import UserRole

logger = logging.getLogger("uvicorn.error")

DEMO_STUDENT = {
    "name": "Demo Student",
    "email": "student@placementiq.ai",
    "password": "Student@1234",
    "role": UserRole.STUDENT.value,
    "is_active": True,
}

DEMO_ADMIN = {
    "name": "Platform Administrator",
    "email": "admin@placementiq.ai",
    "password": "Admin@1234",
    "role": UserRole.ADMIN.value,
    "is_active": True,
}


async def seed_demo_users() -> None:
    """
    Ensure default Demo Student and Demo Admin accounts exist in the database for instant evaluation.
    """
    try:
        db = get_database()
        # Seed Demo Student
        existing_student = await db.users.find_one({"email": DEMO_STUDENT["email"]})
        if not existing_student:
            student_doc = {
                "name": DEMO_STUDENT["name"],
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
                            "SQL Advanced Queries (HackerRank)",
                            "Python for Data Science (Coursera)",
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

        # Seed Demo Admin
        existing_admin = await db.users.find_one({"email": DEMO_ADMIN["email"]})
        if not existing_admin:
            admin_doc = {
                "name": DEMO_ADMIN["name"],
                "email": DEMO_ADMIN["email"],
                "password_hash": get_password_hash(DEMO_ADMIN["password"]),
                "role": DEMO_ADMIN["role"],
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
            }
            await db.users.insert_one(admin_doc)
            logger.info("Demo Admin account seeded (admin@placementiq.ai / Admin@1234)")

    except Exception as e:
        logger.warning(f"Demo user seeding skipped or deferred: {e}")
