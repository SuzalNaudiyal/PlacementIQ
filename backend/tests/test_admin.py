"""
Automated Unit Tests for Admin Control Panel and Cohort Analytics Endpoints.
Verifies RBAC security (admin required), cohort statistics aggregation, student directory filtering,
student drill-down dossier, job drive creation/deletion, and CSV report export.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.auth.seed import DEMO_ADMIN, DEMO_STUDENT, seed_demo_users
from backend.app.database import connect_to_mongo


@pytest_asyncio.fixture(autouse=True)
async def initialize_db_and_seed():
    """Ensure database connection and seeds are loaded prior to each test."""
    await connect_to_mongo()
    await seed_demo_users()


async def get_admin_auth_token(client: AsyncClient) -> str:
    login_res = await client.post(
        "/api/auth/login",
        json={"email": DEMO_ADMIN["email"], "password": DEMO_ADMIN["password"]},
    )
    assert login_res.status_code == 200
    return login_res.json()["access_token"]


async def get_student_auth_token(client: AsyncClient) -> str:
    login_res = await client.post(
        "/api/auth/login",
        json={"email": DEMO_STUDENT["email"], "password": DEMO_STUDENT["password"]},
    )
    assert login_res.status_code == 200
    return login_res.json()["access_token"]


@pytest.mark.asyncio
async def test_admin_cohort_stats_unauthorized():
    """Calling admin cohort stats without token must return 401 Unauthorized."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/admin/cohort-stats")
        assert res.status_code == 401


@pytest.mark.asyncio
async def test_admin_cohort_stats_forbidden_for_student():
    """Calling admin cohort stats with student token must return 403 Forbidden."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        student_token = await get_student_auth_token(client)
        res = await client.get(
            "/api/admin/cohort-stats",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert res.status_code == 403
        assert "Access forbidden" in res.json()["detail"]


@pytest.mark.asyncio
async def test_admin_cohort_stats_success():
    """Admin should receive complete cohort analytics with branches and top missing skills."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await get_admin_auth_token(client)
        res = await client.get(
            "/api/admin/cohort-stats",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res.status_code == 200
        data = res.json()

        # Overview
        overview = data["overview"]
        assert overview["total_students"] >= 10
        assert 0.0 <= overview["avg_placement_probability"] <= 1.0
        assert overview["high_readiness_count"] >= 1
        assert overview["avg_cgpa"] > 6.0
        assert overview["avg_ats_score"] > 50.0

        # Branches
        branches = data["branches"]
        assert len(branches) >= 2
        for b in branches:
            assert b["student_count"] > 0
            assert b["avg_cgpa"] > 0

        # Target roles
        roles = data["target_roles"]
        assert len(roles) >= 2

        # Top missing skills
        missing = data["top_missing_skills"]
        assert len(missing) > 0
        assert "skill" in missing[0]
        assert missing[0]["missing_count"] > 0


@pytest.mark.asyncio
async def test_admin_students_directory_and_filtering():
    """Admin can query students directory and apply multiple filters."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await get_admin_auth_token(client)

        # 1. All students
        res = await client.get(
            "/api/admin/students",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 10
        assert len(data["students"]) == data["total"]

        first_student = data["students"][0]
        assert "user_id" in first_student
        assert "name" in first_student
        assert "cgpa" in first_student
        assert "placement_probability" in first_student
        assert "readiness_category" in first_student

        # 2. Filter by branch
        res_cse = await client.get(
            "/api/admin/students?branch=Computer%20Science",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res_cse.status_code == 200
        cse_data = res_cse.json()
        assert cse_data["total"] >= 1
        for s in cse_data["students"]:
            assert "Computer Science" in s["branch"]

        # 3. Filter by min CGPA
        res_high_cgpa = await client.get(
            "/api/admin/students?min_cgpa=8.0",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res_high_cgpa.status_code == 200
        for s in res_high_cgpa.json()["students"]:
            assert s["cgpa"] >= 8.0

        # 4. Search query
        res_search = await client.get(
            "/api/admin/students?search=Aryan",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res_search.status_code == 200
        assert res_search.json()["total"] >= 1
        assert "Aryan" in res_search.json()["students"][0]["name"]


@pytest.mark.asyncio
async def test_admin_student_drilldown():
    """Admin can drill down into a specific student's dossier."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await get_admin_auth_token(client)

        # Fetch a student user_id from directory
        list_res = await client.get(
            "/api/admin/students",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        students = list_res.json()["students"]
        target_uid = students[0]["user_id"]

        res = await client.get(
            f"/api/admin/students/{target_uid}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res.status_code == 200
        dossier = res.json()
        assert dossier["user_id"] == target_uid
        assert dossier["name"]
        assert dossier["cgpa"] > 0
        assert "skills" in dossier
        assert "matched_jobs_count" in dossier
        assert "roadmap_total_tasks" in dossier

        # Non-existent student returns 404
        res_404 = await client.get(
            "/api/admin/students/non-existent-user-id-9999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_admin_campus_jobs_management():
    """Admin can list, create, and delete campus job drives."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await get_admin_auth_token(client)

        # 1. List campus jobs
        res_list = await client.get(
            "/api/admin/jobs",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res_list.status_code == 200
        jobs = res_list.json()
        assert len(jobs) >= 10
        assert "eligible_applicants_count" in jobs[0]

        # 2. Post a new campus drive
        new_job_payload = {
            "title": "Graduate AI Engineer - Placement Batch",
            "company": "DeepMind Nexus",
            "company_tier": "Tier 1 Product",
            "location": "Bangalore / Remote",
            "salary_range": "₹20.0 - 28.0 LPA",
            "min_cgpa": 8.0,
            "job_type": "Full-time",
            "deadline": "2026-12-31",
            "required_skills": ["Python", "PyTorch", "Transformers", "Git"],
            "preferred_skills": ["Docker", "Kubernetes", "CUDA", "FastAPI"],
            "description": "Develop and deploy state-of-the-art multimodal reasoning models and LLM inference pipelines.",
            "experience_level": "Fresher",
        }
        create_res = await client.post(
            "/api/admin/jobs",
            json=new_job_payload,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert create_res.status_code == 201
        created_job = create_res.json()
        job_id = created_job["id"]
        assert created_job["company"] == "DeepMind Nexus"
        assert created_job["min_cgpa"] == 8.0
        assert created_job["eligible_applicants_count"] >= 1

        # 3. Delete the newly created job
        del_res = await client.delete(
            f"/api/admin/jobs/{job_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "success"

        # 4. Deleting non-existent job returns 404
        del_404 = await client.delete(
            "/api/admin/jobs/fake-job-id-9999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert del_404.status_code == 404


@pytest.mark.asyncio
async def test_admin_export_cohort_csv():
    """Admin can export institutional cohort placement readiness report as a CSV file."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await get_admin_auth_token(client)

        res = await client.get(
            "/api/admin/export/cohort-csv",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        assert "attachment; filename=" in res.headers["content-disposition"]
        csv_text = res.text
        assert "Student Name,Email,Roll Number,Branch,Semester,CGPA" in csv_text
        assert len(csv_text.splitlines()) >= 10
