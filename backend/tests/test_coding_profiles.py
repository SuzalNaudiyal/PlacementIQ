import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo
from backend.app.auth.seed import seed_demo_users
from backend.app.analytics.coding_scraper import (
    generate_deterministic_github_fallback,
    generate_deterministic_leetcode_fallback,
    compute_code_quality_index,
)


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
async def test_coding_scraper_fallbacks():
    gh = generate_deterministic_github_fallback("testuser")
    assert gh["username"] == "testuser"
    assert gh["public_repos"] > 0
    assert len(gh["top_languages"]) > 0

    lc = generate_deterministic_leetcode_fallback("testuser")
    assert lc["username"] == "testuser"
    assert lc["total_solved"] > 0
    assert lc["easy_solved"] + lc["medium_solved"] + lc["hard_solved"] == lc["total_solved"]

    cqi = compute_code_quality_index(gh, lc)
    assert 0 <= cqi["code_quality_index"] <= 100
    assert 50 <= cqi["calibrated_coding_score"] <= 100
    assert isinstance(cqi["badges"], list)


@pytest.mark.asyncio
async def test_verify_coding_profiles_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        # Verify both profiles
        resp = await client.post(
            "/api/coding-profiles/verify",
            headers=headers,
            json={
                "github_username": "torvalds",
                "leetcode_username": "neal_wu",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["github_username"] == "torvalds"
        assert data["leetcode_username"] == "neal_wu"
        assert data["code_quality_index"] > 0
        assert data["calibrated_coding_score"] >= 50
        assert "badges" in data

        # Check /me endpoint
        me_resp = await client.get("/api/coding-profiles/me", headers=headers)
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["github_username"] == "torvalds"
        assert me_data["leetcode_username"] == "neal_wu"
