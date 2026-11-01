"""
Automated unit & integration tests for Campus Placement Job Matching Engine.
Verifies semantic similarity, skill overlap, eligibility filters, and candidate job rankings.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.auth.seed import seed_demo_users
from backend.app.models.jobs import get_job_by_id
from backend.app.analytics.job_matcher import evaluate_job_match, match_all_jobs_for_candidate


@pytest_asyncio.fixture(autouse=True)
async def setup_app_db():
    await connect_to_mongo()
    await seed_demo_users()
    yield
    await close_mongo_connection()


def test_pure_job_match_evaluation():
    """Unit test individual job match scoring logic."""
    job = get_job_by_id("job-swiggy-fullstack")
    assert job is not None

    # Candidate has all required skills + some preferred skills
    candidate_skills = [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "REST APIs",
        "Git",
        "Next.js",
        "Tailwind CSS",
        "Redux",
    ]
    res = evaluate_job_match(
        candidate_skills=candidate_skills,
        candidate_cgpa=8.2,
        job=job,
        candidate_summary_text="Frontend web developer skilled in building responsive consumer UI with React and TypeScript, checkout delivery tracking and micro-frontends.",
    )

    assert res["job_id"] == "job-swiggy-fullstack"
    assert res["cgpa_eligible"] is True
    assert res["match_percentage"] >= 65.0
    assert len(res["required_skills_missing"]) == 0
    assert len(res["required_skills_acquired"]) == 6
    assert res["fit_status"] in ["Strong Match", "Good Match"]


def test_cgpa_ineligibility_penalty():
    """Verify CGPA below minimum threshold flags ineligibility and applies penalty."""
    job = get_job_by_id("job-amazon-sde1")
    assert job is not None
    assert job["min_cgpa"] == 7.8

    # Candidate has 6.5 CGPA (< 7.8)
    res = evaluate_job_match(
        candidate_skills=["Java", "C++", "Data Structures"],
        candidate_cgpa=6.5,
        job=job,
    )
    assert res["cgpa_eligible"] is False
    assert res["candidate_cgpa"] == 6.5


@pytest.mark.asyncio
async def test_list_all_jobs_endpoint():
    """Verify jobs catalogue lists all 16 placement postings."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/jobs")
        assert res.status_code == 200
        jobs = res.json()
        assert len(jobs) == 16
        company_names = [j["company"] for j in jobs]
        assert "Razorpay" in company_names
        assert "Amazon" in company_names
        assert "Swiggy" in company_names
        assert "Microsoft" in company_names


@pytest.mark.asyncio
async def test_filter_jobs_by_tier():
    """Verify query filter by company tier."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/jobs?tier=Tier%201%20Product")
        assert res.status_code == 200
        jobs = res.json()
        assert len(jobs) > 0
        for j in jobs:
            assert j["company_tier"] == "Tier 1 Product"


@pytest.mark.asyncio
async def test_get_single_job_success_and_404():
    """Verify single job retrieval and 404 handler."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res_ok = await client.get("/api/jobs/job-razorpay-sde")
        assert res_ok.status_code == 200
        data = res_ok.json()
        assert data["company"] == "Razorpay"
        assert "Python" in data["required_skills"]

        res_404 = await client.get("/api/jobs/job-unknown-fake-id")
        assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_authenticated_student_job_matching():
    """Verify authenticated demo student receives ranked job matches."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login demo student
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get matched jobs
        match_res = await client.get("/api/jobs/match", headers=headers)
        assert match_res.status_code == 200
        data = match_res.json()
        assert data["total_jobs"] == 16
        assert data["eligible_jobs_count"] >= 1
        assert len(data["matches"]) == 16

        # Check descending order
        scores = [m["match_percentage"] for m in data["matches"]]
        assert scores == sorted(scores, reverse=True)


@pytest.mark.asyncio
async def test_custom_job_match_post_endpoint():
    """Verify ad-hoc custom skills job matching POST endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "skills": ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-learn"],
            "cgpa": 8.5,
            "summary_text": "Machine learning researcher experienced in developing predictive models.",
            "filter_eligible_only": False,
        }
        res = await client.post("/api/jobs/match-custom", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["total_jobs"] > 0
        top_match = data["matches"][0]
        assert top_match["match_percentage"] > 0
        assert "fit_rationale" in top_match
