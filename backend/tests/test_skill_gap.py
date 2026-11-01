"""
Automated unit & integration tests for Skill Gap Analysis API and Engine.
Verifies 3-tier weighting (Critical 50%, Important 35%, Optional 15%),
disqualifier detection, prep weeks calculation, and candidate role ranking.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.auth.seed import seed_demo_users
from backend.app.analytics.skill_gap import analyze_skill_gap, rank_all_roles_for_candidate


@pytest_asyncio.fixture(autouse=True)
async def setup_app_db():
    await connect_to_mongo()
    await seed_demo_users()
    yield
    await close_mongo_connection()


def test_pure_skill_gap_math():
    """Unit test the 3-tier mathematical weighting algorithm."""
    # Critical: JavaScript, React, Node.js, SQL, Git (5 total)
    # Important: TypeScript, MongoDB, Express, REST APIs, Docker, PostgreSQL (6 total)
    # Optional: Next.js, Redis, AWS, CI/CD, GraphQL, Tailwind CSS (6 total)
    candidate_skills = ["JavaScript", "React", "Node.js", "SQL", "Git"]  # 5/5 Critical (100% of 50 = 50%)
    res = analyze_skill_gap(candidate_skills, "full-stack-developer", candidate_cgpa=8.0)
    
    assert res["role_id"] == "full-stack-developer"
    assert res["critical_skills_summary"]["acquired_count"] == 5
    assert len(res["missing_critical"]) == 0
    # Score should be exactly 50.0% (50% critical + 0% important + 0% optional)
    assert res["match_percentage"] == 50.0
    assert res["cgpa_met"] is True
    assert res["readiness_level"] == "Moderate Gap"


def test_disqualifier_detection():
    """Verify missing critical skills are explicitly labeled as Disqualifiers."""
    candidate_skills = ["TypeScript", "MongoDB", "Express", "Docker"]  # Has important skills, but 0 critical
    res = analyze_skill_gap(candidate_skills, "full-stack-developer", candidate_cgpa=6.5)

    assert len(res["missing_critical"]) == 5
    for item in res["missing_critical"]:
        assert item["tier"] == "Critical"
        assert item["status"] == "Disqualifier"
        assert item["urgency"] == "High"
    assert res["cgpa_met"] is False  # 6.5 < 6.8 min recommended


@pytest.mark.asyncio
async def test_list_all_roles_endpoint():
    """Verify public roles catalogue returns all 10 standard roles."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/skill-gap/roles")
        assert response.status_code == 200
        roles = response.json()
        assert len(roles) == 10
        role_ids = [r["id"] for r in roles]
        assert "full-stack-developer" in role_ids
        assert "data-scientist" in role_ids
        assert "devops-cloud-engineer" in role_ids


@pytest.mark.asyncio
async def test_single_role_endpoint():
    """Verify single role query and 404 behavior."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res_ok = await client.get("/api/skill-gap/roles/data-scientist")
        assert res_ok.status_code == 200
        data = res_ok.json()
        assert data["title"] == "Data Scientist / Machine Learning Engineer"
        assert "Python" in data["critical_skills"]

        res_404 = await client.get("/api/skill-gap/roles/non-existent-role")
        assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_custom_skill_gap_analysis():
    """Verify ad-hoc custom skill gap POST endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "role_id": "data-analyst",
            "skills": [
                "SQL",
                "Excel",
                "Power BI",
                "Data Visualization",
                "Problem Solving",
                "Python",
                "Pandas",
                "Tableau",
            ],
            "cgpa": 8.2,
        }
        response = await client.post("/api/skill-gap/analyze-custom", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["role_id"] == "data-analyst"
        assert data["match_percentage"] >= 65.0
        assert data["cgpa_met"] is True
        assert len(data["roi_recommendations"]) > 0


@pytest.mark.asyncio
async def test_student_skill_gap_and_ranking():
    """Verify authenticated demo student can analyze gap and view ranked top roles."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login demo student
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Analyze against full-stack-developer
        gap_res = await client.get("/api/skill-gap/analyze/full-stack-developer", headers=headers)
        assert gap_res.status_code == 200
        gap_data = gap_res.json()
        assert gap_data["role_id"] == "full-stack-developer"
        assert "match_percentage" in gap_data
        assert "critical_skills_summary" in gap_data
        assert "estimated_prep_weeks" in gap_data

        # 3. Get Top Roles Ranking leaderboard
        top_res = await client.get("/api/skill-gap/top-roles", headers=headers)
        assert top_res.status_code == 200
        ranked = top_res.json()
        assert len(ranked) == 10
        # Ensure descending sort
        percentages = [r["match_percentage"] for r in ranked]
        assert percentages == sorted(percentages, reverse=True)
