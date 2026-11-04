import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo
from backend.app.auth.seed import seed_demo_users
from backend.app.analytics.career_copilot import generate_copilot_response


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


@pytest.mark.asyncio
async def test_career_copilot_engine_logic():
    student_profile = {
        "name": "Alex Student",
        "cgpa": 8.2,
        "backlogs": 1,
        "education": {"branch": "Computer Science"},
        "assessments": {"coding_score": 75.0},
    }

    # Test readiness query
    res = generate_copilot_response("How to improve my readiness score?", student_profile)
    assert "Alex" in res["reply"]
    assert "roadmaps" in res["reply"].lower() or "readiness" in res["reply"].lower()
    assert len(res["suggested_actions"]) > 0

    # Test backlog explanation query
    res_backlog = generate_copilot_response("Explain backlogs to HR", student_profile)
    assert "backlog" in res_backlog["reply"].lower()

    # Test DSA query
    res_dsa = generate_copilot_response("Give me leetcode tips", student_profile)
    assert "leetcode" in res_dsa["reply"].lower() or "dsa" in res_dsa["reply"].lower()

    # Test Platform "What is HireMatrix" query
    res_hm = generate_copilot_response("What is HireMatrix?", student_profile)
    assert "hirematrix" in res_hm["reply"].lower()
    assert "operating system" in res_hm["reply"].lower() or "placement" in res_hm["reply"].lower()
    assert len(res_hm["suggested_actions"]) >= 2

    # Test SVAR voice test query
    res_svar = generate_copilot_response("How does the SVAR voice test work?", student_profile)
    assert "svar" in res_svar["reply"].lower() or "voice" in res_svar["reply"].lower()
    assert "extempore" in res_svar["reply"].lower() or "sentence repetition" in res_svar["reply"].lower()


@pytest.mark.asyncio
async def test_copilot_chat_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        # Chat
        resp = await client.post(
            "/api/copilot/chat",
            headers=headers,
            json={
                "message": "How do I improve my placement readiness?",
                "target_role": "software_engineer",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "reply" in data
        assert len(data["reply"]) > 20
        assert "suggested_actions" in data
        assert isinstance(data["suggested_actions"], list)

        # Suggestions
        sug_resp = await client.get("/api/copilot/suggestions", headers=headers)
        assert sug_resp.status_code == 200
        sug_data = sug_resp.json()
        assert "suggestions" in sug_data
        assert len(sug_data["suggestions"]) >= 2

        # Unauthenticated guest visitor asking "What is HireMatrix" without token
        guest_resp = await client.post(
            "/api/copilot/chat",
            json={"message": "What is HireMatrix and what can it do?"},
        )
        assert guest_resp.status_code == 200
        guest_data = guest_resp.json()
        assert "HireMatrix" in guest_data["reply"]
        assert len(guest_data["suggested_actions"]) >= 2
