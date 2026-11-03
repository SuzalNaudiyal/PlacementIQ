import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.auth.seed import seed_demo_users, DEMO_STUDENT
from backend.app.database import connect_to_mongo


@pytest_asyncio.fixture(autouse=True)
async def initialize_db_and_seed():
    await connect_to_mongo()
    await seed_demo_users()


async def get_student_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/auth/login",
        json={"email": DEMO_STUDENT["email"], "password": DEMO_STUDENT["password"]},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_get_outreach_templates():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/outreach/templates")
        assert res.status_code == 200
        data = res.json()
        assert "templates" in data
        assert "alumni_referral" in data["templates"]
        assert "recruiter_dm" in data["templates"]
        assert "default_companies" in data
        assert "Google" in data["default_companies"]


@pytest.mark.asyncio
async def test_generate_outreach_pitches():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_token(client)
        res = await client.post(
            "/api/outreach/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "company_name": "Microsoft",
                "job_role": "Cloud Solutions & Software Engineer",
                "job_id": "REQ-77492",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["company_name"] == "Microsoft"
        assert data["job_role"] == "Cloud Solutions & Software Engineer"
        assert "candidate_summary" in data
        assert "messages" in data
        assert "alumni_referral" in data["messages"]
        assert "recruiter_dm" in data["messages"]
        assert "hiring_manager" in data["messages"]
        assert "quick_inmail" in data["messages"]
        assert "Microsoft" in data["messages"]["alumni_referral"]
        assert len(data["subject_lines"]) >= 3
        assert len(data["tips"]) >= 3
