import re
import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.database import get_database, persist_db_if_fallback
from backend.app.auth.security import get_password_hash, verify_password, create_access_token
from backend.app.auth.deps import get_current_user
from backend.app.auth.seed import DEMO_STUDENT, DEMO_ADMIN
from backend.app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    AuthMessage,
    UserRole,
)
from backend.app.models.user import user_entity

router = APIRouter(prefix="/auth", tags=["Authentication & Accounts"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(data: UserRegister) -> TokenResponse:
    """
    Register a new student or admin account.
    Validates email and username uniqueness, securely hashes password, and returns a signed JWT access token.
    """
    db = get_database()
    email_clean = data.email.lower().strip()
    name_clean = data.name.strip()
    username_clean = data.username.strip() if data.username else email_clean.split("@")[0]

    # Check for duplicate email
    existing_email = await db.users.find_one({"email": email_clean})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in.",
        )

    # Check for duplicate username if explicitly specified
    if data.username:
        existing_username = await db.users.find_one({
            "username": {"$regex": f"^{re.escape(username_clean)}$", "$options": "i"}
        })
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{username_clean}' is already taken. Please choose another username.",
            )

    # Hash password with bcrypt
    password_hash = get_password_hash(data.password)

    new_user_doc = {
        "name": name_clean,
        "username": username_clean,
        "email": email_clean,
        "password_hash": password_hash,
        "role": data.role.value,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(new_user_doc)
    user_id = str(result.inserted_id)
    new_user_doc["_id"] = result.inserted_id

    # If registered as student, initialize empty student profile document
    if data.role == UserRole.STUDENT:
        await db.students.update_one(
            {"user_id": user_id},
            {
                "$setOnInsert": {
                    "user_id": user_id,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                    "skills": {},
                    "projects": [],
                    "internships": [],
                    "certifications": [],
                    "assessments": {},
                }
            },
            upsert=True,
        )

    # Immediately write to persistent snapshot file if running in mock fallback mode
    await persist_db_if_fallback()

    # Issue JWT token
    token_payload = {
        "sub": user_id,
        "email": email_clean,
        "username": username_clean,
        "role": data.role.value,
        "name": name_clean,
    }
    access_token = create_access_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_entity(new_user_doc)),
    )


@router.post("/login", response_model=TokenResponse)
async def login_user(credentials: UserLogin) -> TokenResponse:
    """
    Authenticate user credentials (email or username with password) and issue a signed JWT token.
    Supports login via registered email address, username, or display name.
    """
    db = get_database()
    identifier = credentials.email.strip()
    identifier_lower = identifier.lower()

    # Search user by email, username, or display name (case-insensitive)
    user = await db.users.find_one({
        "$or": [
            {"email": identifier_lower},
            {"username": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
            {"name": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
        ]
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password (or invalid username).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password hash
    stored_hash = user.get("password_hash", "")
    if not verify_password(credentials.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password (or invalid username).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support.",
        )

    user_id = str(user["_id"])
    token_payload = {
        "sub": user_id,
        "email": user["email"],
        "username": user.get("username", user["email"].split("@")[0]),
        "role": user.get("role", "student"),
        "name": user.get("name", ""),
    }
    access_token = create_access_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_entity(user)),
    )


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)) -> UserResponse:
    """
    Retrieve current authenticated user details from the JWT bearer token.
    """
    return UserResponse(**current_user)


@router.post("/logout", response_model=AuthMessage)
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)) -> AuthMessage:
    """
    Stateless JWT logout endpoint for client session cleanup.
    """
    return AuthMessage(
        message=f"Successfully signed out {current_user.get('email')}.",
        success=True,
    )


@router.get("/demo-credentials")
async def get_demo_credentials():
    """
    Public utility endpoint returning pre-configured student and admin credentials.
    """
    return {
        "student": {
            "email": DEMO_STUDENT["email"],
            "username": DEMO_STUDENT["username"],
            "password": DEMO_STUDENT["password"],
            "role": "student",
            "description": "Pre-configured student with CGPA 7.5, 2 projects, 1 internship, and technical skills",
        },
        "admin": {
            "email": DEMO_ADMIN["email"],
            "username": DEMO_ADMIN["username"],
            "password": DEMO_ADMIN["password"],
            "role": "admin",
            "description": "Lead Platform Administrator (Suzal) with full telemetry & assessment audit access",
        },
    }
