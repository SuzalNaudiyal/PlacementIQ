import pytest
import pytest_asyncio
import uuid
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
        assert data["admin"]["email"] == "suzal.php@gmail.com"


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
    unique_email = f"candidate_{uuid.uuid4().hex[:8]}@placementiq.ai"
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


@pytest.mark.asyncio
async def test_registered_account_persists_across_database_reload():
    """
    Verify that an account registered in fallback/mock mode is persisted to disk,
    and upon database reconnect/reload, the user can successfully log in without 'invalid user'.
    """
    transport = ASGITransport(app=app)
    test_email = f"persistent_{uuid.uuid4().hex[:8]}@placementiq.ai"
    test_password = "SecretPassword!123"

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register new student
        reg_response = await client.post(
            "/api/auth/register",
            json={
                "name": "Persistent Candidate",
                "email": test_email,
                "password": test_password,
                "role": "student",
            },
        )
        assert reg_response.status_code == 201

        # 2. Simulate server reload / database restart
        await connect_to_mongo()

        # 3. Attempt login with the newly created credentials
        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": test_email,
                "password": test_password,
            },
        )
        assert login_response.status_code == 200
        data = login_response.json()
        assert data["user"]["email"] == test_email
        assert data["user"]["name"] == "Persistent Candidate"
