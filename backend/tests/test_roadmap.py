"""
Automated unit & integration tests for Personalized 8-Week Learning Roadmap Engine.
Verifies milestone generation, task completion toggling, progress recalculation, and role switching.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.auth.seed import seed_demo_users
from backend.app.analytics.roadmap_generator import generate_eight_week_roadmap


@pytest_asyncio.fixture(autouse=True)
async def setup_app_db():
    await connect_to_mongo()
    await seed_demo_users()
    yield
    await close_mongo_connection()


def test_pure_roadmap_generation():
    """Unit test 8-week curriculum generation for full stack role."""
    candidate_skills = ["JavaScript", "React", "Node.js"]
    roadmap = generate_eight_week_roadmap(candidate_skills, "full-stack-developer", candidate_cgpa=8.0)

    assert roadmap["total_weeks"] == 8
    assert len(roadmap["weeks"]) == 8
    assert roadmap["total_tasks"] > 15
    assert roadmap["completed_tasks"] == 0
    assert roadmap["progress_percentage"] == 0.0

    # Verify weekly deliverables exist
    for w in roadmap["weeks"]:
        assert w["week_number"] in range(1, 9)
        assert len(w["learning_goals"]) > 0
        assert len(w["tasks"]) > 0
        assert len(w["milestone_deliverable"]) > 0


@pytest.mark.asyncio
async def test_get_or_create_student_roadmap():
    """Verify demo student gets an active 8-week roadmap."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login demo student
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get roadmap
        res = await client.get("/api/roadmap", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["total_weeks"] == 8
        assert len(data["weeks"]) == 8
        assert data["total_tasks"] > 0


@pytest.mark.asyncio
async def test_generate_roadmap_for_custom_role():
    """Verify regenerating roadmap targeting data-scientist role."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Switch to Data Scientist
        res = await client.post(
            "/api/roadmap/generate",
            json={"role_id": "data-scientist"},
            headers=headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["target_role_id"] == "data-scientist"
        assert data["total_weeks"] == 8


@pytest.mark.asyncio
async def test_toggle_roadmap_task():
    """Verify task toggle updates completion status and increments progress percentage."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Initial fetch
        get_res = await client.get("/api/roadmap", headers=headers)
        assert get_res.status_code == 200
        init_data = get_res.json()
        first_task_id = init_data["weeks"][0]["tasks"][0]["id"]

        # Toggle first task to completed
        toggle_res = await client.put(
            "/api/roadmap/task/toggle",
            json={"task_id": first_task_id, "completed": True},
            headers=headers,
        )
        assert toggle_res.status_code == 200
        updated = toggle_res.json()
        assert updated["completed_tasks"] >= 1
        assert updated["progress_percentage"] > 0.0

        # Verify task is flagged true in week 1
        w1_tasks = updated["weeks"][0]["tasks"]
        t1 = next(t for t in w1_tasks if t["id"] == first_task_id)
        assert t1["completed"] is True
