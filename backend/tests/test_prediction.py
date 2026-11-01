"""
Automated tests for Placement Prediction and What-If Simulation API endpoints.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.auth.seed import seed_demo_users


@pytest_asyncio.fixture(autouse=True)
async def setup_app_db():
    await connect_to_mongo()
    await seed_demo_users()
    yield
    await close_mongo_connection()


@pytest.mark.asyncio
async def test_get_model_info():
    """Verify public model telemetry and transparency endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/prediction/model-info")
        assert response.status_code == 200
        data = response.json()
        assert "best_model_name" in data
        assert "metrics" in data
        assert "model_comparison" in data
        assert "feature_importances" in data
        assert data["metrics"]["accuracy"] >= 0.90
        assert data["metrics"]["roc_auc"] >= 0.95


@pytest.mark.asyncio
async def test_evaluate_unauthorized():
    """Verify protected evaluation endpoint rejects requests without Bearer token."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/prediction/evaluate")
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_evaluate_demo_student():
    """Verify authenticated demo student receives accurate prediction & explainable factors."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login as demo student
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Call evaluate endpoint
        eval_res = await client.get("/api/prediction/evaluate", headers=headers)
        assert eval_res.status_code == 200
        data = eval_res.json()
        assert "placement_percentage" in data
        assert 0.0 <= data["placement_percentage"] <= 100.0
        assert "readiness_status" in data
        assert "top_positive_factors" in data
        assert len(data["top_positive_factors"]) >= 1
        assert "predicted_salary_tier" in data
        assert "recommendations" in data


@pytest.mark.asyncio
async def test_simulate_what_if_scenario():
    """Verify What-If simulator calculates probability delta on improvement."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        sim_payload = {
            "coding_score": 95.0,
            "internships_count": 2,
            "backlogs": 0,
        }
        res = await client.post("/api/prediction/simulate", json=sim_payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "baseline_percentage" in data
        assert "simulated_percentage" in data
        assert "net_gain_percent" in data
        assert "key_improvements" in data
        assert len(data["key_improvements"]) >= 1


@pytest.mark.asyncio
async def test_simulate_negative_impact():
    """Verify simulator reflects sharp reduction when adding backlogs and dropping coding score."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        sim_payload = {
            "coding_score": 25.0,
            "backlogs": 3,
            "cgpa": 5.2,
        }
        res = await client.post("/api/prediction/simulate", json=sim_payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["simulated_percentage"] < data["baseline_percentage"]
        assert data["net_gain_percent"] < 0
        assert data["simulated"]["placed"] is False
