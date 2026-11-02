import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo
from backend.app.auth.seed import seed_demo_users
from backend.app.analytics.resume_pdf_generator import generate_ats_resume_pdf


@pytest_asyncio.fixture(autouse=True)
async def initialize_db_and_seed():
    await connect_to_mongo()
    await seed_demo_users()


async def get_student_auth_token(client: AsyncClient) -> str:
    response = await client.post(
        "/api/auth/login",
        json={"email": "student@placementiq.ai", "password": "Student@1234"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_generate_ats_resume_pdf_direct():
    dummy_student = {
        "name": "Jane Test",
        "email": "jane@example.com",
        "cgpa": 8.5,
        "backlogs": 0,
        "education": {
            "university": "State Technical University",
            "branch": "Computer Science",
            "degree": "B.Tech",
            "graduation_year": 2026,
        },
        "skills": {
            "programming": ["Python", "C++"],
            "frameworks": ["FastAPI", "React"],
            "databases": ["PostgreSQL"],
        },
        "projects": [
            {
                "title": "Scalable Microservices",
                "technologies": ["Docker", "Python"],
                "description": "Architected resilient endpoints handling 10k requests/min.",
            }
        ],
        "internships": [
            {
                "company": "Cloud Corp",
                "role": "SDE Intern",
                "duration_months": 3,
                "description": "Optimized cache invalidation routines.",
            }
        ],
    }

    pdf_bytes = generate_ats_resume_pdf(dummy_student)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF-")


@pytest.mark.asyncio
async def test_download_ats_resume_pdf_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        resp = await client.get("/api/resume/generate-ats-pdf", headers=headers)
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert "attachment" in resp.headers["content-disposition"]
        assert len(resp.content) > 2000
        assert resp.content.startswith(b"%PDF-")

        preview_resp = await client.get("/api/resume/ats-preview-data", headers=headers)
        assert preview_resp.status_code == 200
        pdata = preview_resp.json()
        assert "candidate" in pdata
        assert pdata["ats_compliance_score"] >= 90

