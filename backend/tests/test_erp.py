"""
Automated unit & integration tests for University ERP & Bulk Student Roster Sync (Phase 16/17).
Verifies CSV roster parsing, schema validation, placement drive creation,
eligibility auditing, one-click application, and recruiter shortlist CSV export.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from backend.app.main import app
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.auth.seed import seed_demo_users
from backend.app.erp.engine import (
    parse_roster_csv_content,
    check_student_drive_eligibility,
    get_sample_csv_template,
)


@pytest_asyncio.fixture(autouse=True)
async def setup_app_db():
    await connect_to_mongo()
    await seed_demo_users()
    yield
    await close_mongo_connection()


def test_pure_csv_parser_validation():
    """Verify CSV parser accurately extracts fields and catches malformed data."""
    valid_csv = """roll_number,name,email,branch,batch_year,cgpa,backlogs,attendance_percentage,coding_score,internships_count,projects_count,certifications_count,soft_skills_rating,preferred_roles
2022CS101,Aarav Patel,aarav.patel@apex.edu,Computer Science,2026,8.85,0,92.0,85.0,2,3,2,8.5,full-stack-developer
2022CS102,Diya Sengupta,diya.sengupta@apex.edu,Computer Science,2026,9.15,0,94.5,90.0,2,4,3,9.0,data-scientist
"""
    records, errors = parse_roster_csv_content(valid_csv)
    assert len(records) == 2
    assert len(errors) == 0
    assert records[0]["roll_number"] == "2022CS101"
    assert records[0]["cgpa"] == 8.85
    assert records[0]["preferred_roles"] == ["full-stack-developer"]

    # Test malformed CSV with missing email & invalid CGPA
    bad_csv = """roll_number,name,email,cgpa
2022CS999,Invalid Student,not-an-email,12.5
2022CS998,,missing.name@apex.edu,8.0
"""
    bad_records, bad_errors = parse_roster_csv_content(bad_csv)
    assert len(bad_records) == 0
    assert len(bad_errors) >= 2


def test_drive_eligibility_checker():
    """Verify criteria auditing: CGPA, backlogs, branch, and coding cutoffs."""
    drive = {
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "eligible_branches": ["Computer Science", "Information Technology"],
        "min_coding_score": 70.0,
    }

    # Case 1: Perfectly eligible student
    student_eligible = {
        "cgpa": 8.5,
        "backlogs": 0,
        "branch": "Computer Science",
        "coding_score": 85.0,
    }
    is_elig, reasons = check_student_drive_eligibility(student_eligible, drive)
    assert is_elig is True
    assert "Meets all academic" in reasons[0]

    # Case 2: Ineligible due to backlogs and low CGPA
    student_ineligible = {
        "cgpa": 6.8,
        "backlogs": 2,
        "branch": "Mechanical",
        "coding_score": 50.0,
    }
    is_elig_bad, reasons_bad = check_student_drive_eligibility(student_ineligible, drive)
    assert is_elig_bad is False
    assert len(reasons_bad) >= 3


@pytest.mark.asyncio
async def test_erp_template_and_roster_upload_api():
    """Verify template download and batch CSV roster ingestion API."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Download template
        tpl_res = await client.get("/api/erp/template")
        assert tpl_res.status_code == 200
        assert "roll_number,name,email,branch,batch_year,cgpa" in tpl_res.text

        # 2. Login admin
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "admin@placementiq.ai", "password": "Admin@1234"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Upload roster CSV
        csv_payload = tpl_res.text
        files = {"file": ("students_roster.csv", csv_payload.encode("utf-8"), "text/csv")}
        upload_res = await client.post("/api/erp/roster/upload-csv", files=files, headers=headers)
        assert upload_res.status_code == 200
        data = upload_res.json()
        assert data["total_records_processed"] >= 5
        assert data["successful_imports"] + data["updated_records"] >= 5


@pytest.mark.asyncio
async def test_placement_drive_lifecycle_and_apply_flow():
    """Integration test: Create drive -> Student checks eligibility -> Applies -> Admin exports shortlist."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login admin
        admin_login = await client.post(
            "/api/auth/login",
            json={"email": "admin@placementiq.ai", "password": "Admin@1234"},
        )
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 2. Create placement drive
        create_res = await client.post(
            "/api/erp/drives",
            json={
                "company_name": "Atlassian",
                "job_role": "Software Engineer (Full Stack)",
                "ctc_lpa": 26.0,
                "location": "Bengaluru / Remote",
                "min_cgpa": 7.0,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science", "Information Technology"],
                "min_coding_score": 70.0,
                "application_deadline": "2026-12-25",
                "drive_date": "2026-12-30",
                "description": "Building Jira and Confluence cloud architectures.",
            },
            headers=admin_headers,
        )
        assert create_res.status_code == 200
        drive_data = create_res.json()
        drive_id = drive_data["drive_id"]
        assert drive_data["company_name"] == "Atlassian"

        # 3. Login student
        student_login = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        student_token = student_login.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        # 4. Student checks placement drives tailored to their profile
        drives_res = await client.get("/api/erp/student-drives", headers=student_headers)
        assert drives_res.status_code == 200
        student_drives = drives_res.json()
        assert len(student_drives) >= 1
        atlassian_drive = next(d for d in student_drives if d["drive_id"] == drive_id)
        assert atlassian_drive["is_eligible"] is True

        # 5. Student applies to drive
        apply_res = await client.post(
            "/api/erp/drives/apply",
            json={"drive_id": drive_id},
            headers=student_headers,
        )
        assert apply_res.status_code == 200
        assert apply_res.json()["status"] == "success"

        # 6. Admin downloads candidate shortlist CSV
        shortlist_res = await client.get(
            f"/api/erp/drives/{drive_id}/shortlist-csv",
            headers=admin_headers,
        )
        assert shortlist_res.status_code == 200
        csv_text = shortlist_res.text
        assert "Application ID,Student Name,Student Email" in csv_text
        assert "student@placementiq.ai" in csv_text


@pytest.mark.asyncio
async def test_update_placement_drive_criteria():
    """Verify DCPD can dynamically update company criteria (CGPA, CTC, backlogs) and recalculate eligibility."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Admin login
        admin_login = await client.post(
            "/api/auth/login",
            json={"email": "admin@placementiq.ai", "password": "Admin@1234"},
        )
        admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

        # 2. Create drive with high CGPA cutoff (9.5)
        create_res = await client.post(
            "/api/erp/drives",
            json={
                "company_name": "Suzal Innovations",
                "job_role": "AI Architect",
                "ctc_lpa": 18.0,
                "location": "Bangalore / Hybrid",
                "min_cgpa": 9.5,
                "max_backlogs": 0,
                "eligible_branches": ["Computer Science"],
                "min_coding_score": 70.0,
                "application_deadline": "2026-12-31",
                "drive_date": "2027-01-15",
                "description": "Initial criteria with 9.5 CGPA requirement",
            },
            headers=admin_headers,
        )
        assert create_res.status_code == 200
        drive_id = create_res.json()["drive_id"]

        # 3. Student (CGPA ~ 8.2) checks eligibility - should be ineligible
        student_login = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        student_headers = {"Authorization": f"Bearer {student_login.json()['access_token']}"}
        s_drives = (await client.get("/api/erp/student-drives", headers=student_headers)).json()
        target_drive = next(d for d in s_drives if d["drive_id"] == drive_id)
        assert target_drive["is_eligible"] is False

        # 4. Company updates criteria: relaxes CGPA to 7.5 and boosts package to 22.0 LPA
        update_res = await client.put(
            f"/api/erp/drives/{drive_id}",
            json={
                "min_cgpa": 7.5,
                "ctc_lpa": 22.0,
                "description": "Updated criteria: CGPA relaxed to 7.5 and CTC increased",
            },
            headers=admin_headers,
        )
        assert update_res.status_code == 200
        updated_data = update_res.json()
        assert updated_data["min_cgpa"] == 7.5
        assert updated_data["ctc_lpa"] == 22.0

        # 5. Student checks eligibility again - now ELIGIBLE!
        s_drives_after = (await client.get("/api/erp/student-drives", headers=student_headers)).json()
        target_after = next(d for d in s_drives_after if d["drive_id"] == drive_id)
        assert target_after["is_eligible"] is True
        assert target_after["ctc_lpa"] == 22.0

        # 6. Cleanup
        del_res = await client.delete(f"/api/erp/drives/{drive_id}", headers=admin_headers)
        assert del_res.status_code == 200
