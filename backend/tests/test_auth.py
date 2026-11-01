import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.auth.seed import seed_demo_users
from backend.app.database import connect_to_mongo


@pytest_asyncio.fixture(autouse=True)
async def initialize_db_and_seed():
    """Ensure database connection and seeds are loaded prior to each test."""
    await connect_to_mongo()
    await seed_demo_users()


@pytest.mark.asyncio
async def test_demo_credentials_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/auth/demo-credentials")
        assert response.status_code == 200
        data = response.json()
        assert "student" in data
        assert "admin" in data
        assert data["student"]["email"] == "student@placementiq.ai"
        assert data["admin"]["email"] == "admin@placementiq.ai"


@pytest.mark.asyncio
async def test_demo_student_login_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "student@placementiq.ai",
                "password": "Student@1234",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "student@placementiq.ai"
        assert data["user"]["role"] == "student"


@pytest.mark.asyncio
async def test_login_invalid_password():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "student@placementiq.ai",
                "password": "WrongPassword@999",
            },
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_new_student_and_get_me():
    transport = ASGITransport(app=app)
    unique_email = "new.candidate@placementiq.ai"
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register new student
        reg_response = await client.post(
            "/api/auth/register",
            json={
                "name": "Alex Mercer",
                "email": unique_email,
                "password": "SecurePassword#2026",
                "role": "student",
            },
        )
        assert reg_response.status_code == 201
        reg_data = reg_response.json()
        token = reg_data["access_token"]
        assert token is not None
        assert reg_data["user"]["name"] == "Alex Mercer"

        # Access protected /api/auth/me endpoint using Bearer token
        me_response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["email"] == unique_email
        assert me_data["role"] == "student"


@pytest.mark.asyncio
async def test_register_duplicate_email_fails():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Attempt duplicate registration with student@placementiq.ai
        response = await client.post(
            "/api/auth/register",
            json={
                "name": "Imposter Student",
                "email": "student@placementiq.ai",
                "password": "AnotherPassword#123",
                "role": "student",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_protected_route_without_token_fails():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/auth/me")
        assert response.status_code == 401
