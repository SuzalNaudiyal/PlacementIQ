import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.auth.seed import seed_demo_users
from backend.app.database import connect_to_mongo


@pytest_asyncio.fixture(autouse=True)
async def initialize_db_and_seed():
    """Ensure database connection and seeds are loaded prior to each test."""
    await connect_to_mongo()
    await seed_demo_users()


async def get_student_auth_token(client: AsyncClient) -> str:
    """Helper to authenticate as Demo Student and return Bearer token."""
    response = await client.post(
        "/api/auth/login",
        json={"email": "student@placementiq.ai", "password": "Student@1234"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_get_skill_taxonomy():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/student/taxonomy")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert "programming" in data["categories"]
        assert "databases" in data["categories"]
        assert "Python" in data["categories"]["programming"]
        assert "SQL" in data["categories"]["databases"]


@pytest.mark.asyncio
async def test_get_demo_student_profile():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_auth_token(client)
        response = await client.get(
            "/api/student/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        profile = response.json()
        assert profile["name"] == "Demo Student"
        assert profile["email"] == "student@placementiq.ai"
        assert profile["cgpa"] == 7.5
        assert profile["completeness_percent"] > 50
        assert "Python" in profile["skills"]["programming"]
        assert len(profile["projects"]) >= 2
        assert len(profile["internships"]) >= 1


@pytest.mark.asyncio
async def test_update_student_profile():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_auth_token(client)

        update_payload = {
            "personal": {"phone": "+1-555-0199", "location": "Austin, TX"},
            "education": {
                "degree": "B.Tech",
                "branch": "Artificial Intelligence & Data Science",
                "university": "Apex Engineering University",
                "graduation_year": 2026,
            },
            "cgpa": 8.4,
            "backlogs": 0,
            "skills": {
                "programming": ["Python", "TypeScript", "SQL", "C++"],
                "databases": ["MongoDB", "PostgreSQL"],
                "frameworks": ["React", "FastAPI"],
                "cloud": ["AWS", "GCP"],
                "data_ai": ["Pandas", "Scikit-learn", "Power BI"],
                "soft_skills": ["Problem Solving", "Agile Workflow"],
            },
            "projects": [
                {
                    "title": "Autonomous Predictive Maintenance",
                    "description": "Anomaly detection pipeline using Scikit-learn and FastAPI.",
                    "technologies": ["Python", "FastAPI", "Scikit-learn"],
                }
            ],
            "internships": [
                {
                    "company": "NextGen Cloud Labs",
                    "role": "Cloud AI Intern",
                    "duration_months": 6,
                    "description": "Engineered automated data ingestion workflows.",
                }
            ],
            "certifications": [
                {"name": "AWS Certified Cloud Practitioner", "issuer": "Amazon", "year": 2025}
            ],
            "assessments": {
                "coding_score": 88.0,
                "aptitude_score": 90.0,
                "communication_score": 85.0,
                "technical_interview_score": 92.0,
            },
        }

        put_res = await client.put(
            "/api/student/profile",
            json=update_payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert put_res.status_code == 200
        updated = put_res.json()
        assert updated["cgpa"] == 8.4
        assert updated["education"]["branch"] == "Artificial Intelligence & Data Science"
        assert "TypeScript" in updated["skills"]["programming"]
        assert updated["assessments"]["coding_score"] == 88.0
        assert updated["completeness_percent"] >= 80


@pytest.mark.asyncio
async def test_student_profile_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/student/profile")
        assert res.status_code == 401


@pytest.mark.asyncio
async def test_update_student_profile_invalid_cgpa():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_auth_token(client)
        # CGPA greater than 10.0 must be rejected
        res = await client.put(
            "/api/student/profile",
            json={"cgpa": 12.5},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 422
