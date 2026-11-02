import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo
from backend.app.auth.seed import seed_demo_users
from backend.app.analytics.drive_alerts import format_whatsapp_drive_alert, format_email_drive_alert


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


def test_format_whatsapp_and_email_alerts():
    student = {"name": "Alex Student", "email": "alex@test.com", "cgpa": 8.4, "backlogs": 0}
    drive = {
        "drive_id": "test_drive",
        "company_name": "Microsoft",
        "job_role": "Cloud Engineer",
        "ctc_lpa": 21.0,
        "location": "Hyderabad",
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "application_deadline": "2026-12-10",
    }

    wa = format_whatsapp_drive_alert(student, drive)
    assert "Microsoft" in wa["text"]
    assert "https://api.whatsapp.com/send?text=" in wa["whatsapp_url"]
    assert wa["is_eligible"] is True

    em = format_email_drive_alert(student, drive)
    assert "Microsoft" in em["subject"]
    assert "21.0 LPA" in em["html_content"]


@pytest.mark.asyncio
async def test_drive_alerts_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        # First trigger listing to ensure default placement drives are seeded
        await client.get("/api/erp/drives", headers=headers)

        # Get preview for drive_google_sde
        resp = await client.get("/api/erp/drives/drive_google_sde/alerts", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "whatsapp_alert" in data
        assert "email_alert" in data

        # Send test alert
        post_resp = await client.post(
            "/api/erp/alerts/send-test",
            headers=headers,
            json={"drive_id": "drive_google_sde", "channel": "whatsapp"},
        )
        assert post_resp.status_code == 200
        assert post_resp.json()["status"] == "success"

        # Preferences
        pref_resp = await client.get("/api/erp/alerts/preferences", headers=headers)
        assert pref_resp.status_code == 200
        assert "email_enabled" in pref_resp.json()

