import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo
from backend.app.auth.seed import seed_demo_users
from backend.app.analytics.company_prep import COMPANY_CHEAT_SHEETS, evaluate_company_readiness


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


def test_evaluate_company_readiness_logic():
    student = {
        "cgpa": 8.5,
        "backlogs": 0,
        "assessments": {"coding_score": 88.0},
        "coding_profiles": {
            "leetcode_stats": {"medium_solved": 45}
        },
    }
    res = evaluate_company_readiness(student, "google")
    assert res["is_eligible"] is True
    assert res["readiness_percentage"] >= 80
    assert "status_label" in res


@pytest.mark.asyncio
async def test_company_prep_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        # List all
        resp = await client.get("/api/company-prep", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 4
        assert any(c["id"] == "google" for c in data)
        assert "readiness_evaluation" in data[0]

        # Get specific
        detail_resp = await client.get("/api/company-prep/amazon", headers=headers)
        assert detail_resp.status_code == 200
        amazon = detail_resp.json()
        assert amazon["company_name"] == "Amazon"
        assert len(amazon["selection_process"]) >= 3
        assert len(amazon["frequent_leetcode_questions"]) >= 3

