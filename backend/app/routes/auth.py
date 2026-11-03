import re
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.database import get_database, persist_db_if_fallback
from backend.app.auth.security import get_password_hash, verify_password, create_access_token
from backend.app.auth.deps import get_current_user
from backend.app.auth.seed import DEMO_STUDENT, LEGACY_ADMIN, AUTHORIZED_ADMIN_EMAILS
from backend.app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    AuthMessage,
    UserRole,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
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
    username_clean = data.username.strip() if data.username else email_clean.split("@")[0]
    name_clean = data.name.strip() if (data.name and data.name.strip()) else username_clean

    # Check for duplicate email
    existing_email = await db.users.find_one({"email": email_clean})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in or use Forgot Password.",
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

    # Security Guard: Public signups default strictly to student role.
    # Only explicitly whitelisted institutional admin emails gain admin privileges.
    assigned_role = UserRole.STUDENT.value
    if email_clean in AUTHORIZED_ADMIN_EMAILS:
        assigned_role = UserRole.ADMIN.value

    new_user_doc = {
        "name": name_clean,
        "username": username_clean,
        "email": email_clean,
        "password_hash": password_hash,
        "role": assigned_role,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(new_user_doc)
    user_id = str(result.inserted_id)
    new_user_doc["_id"] = result.inserted_id

    # If registered as student, initialize empty student profile document
    if assigned_role == UserRole.STUDENT.value:
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
    Public utility endpoint returning pre-configured demo test harness credentials.
    Confidential admin accounts are never disclosed here.
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
            "email": LEGACY_ADMIN["email"],
            "username": LEGACY_ADMIN["username"],
            "password": LEGACY_ADMIN["password"],
            "role": "admin",
            "description": "Platform Test Harness Administrator",
        },
    }


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def request_password_reset_otp(data: ForgotPasswordRequest) -> ForgotPasswordResponse:
    """
    Generate and dispatch a 6-digit OTP code to the registered email address.
    """
    db = get_database()
    email_clean = data.email.lower().strip()

    user = await db.users.find_one({"email": email_clean})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No account registered with email '{email_clean}'. Please verify your email or create an account.",
        )

    # Invalidate previous unused OTPs for this email
    await db.password_resets.update_many(
        {"email": email_clean, "used": False},
        {"$set": {"used": True}}
    )

    otp_code = f"{random.randint(100000, 999999)}"
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=15)

    reset_doc = {
        "email": email_clean,
        "otp": otp_code,
        "created_at": now,
        "expires_at": expires_at,
        "used": False,
    }
    await db.password_resets.insert_one(reset_doc)
    await persist_db_if_fallback()

    return ForgotPasswordResponse(
        success=True,
        message=f"A 6-digit verification OTP has been generated for {email_clean}. Use it within 15 minutes.",
        email=email_clean,
        otp_debug=otp_code,
    )


@router.post("/reset-password", response_model=AuthMessage)
async def reset_password_with_otp(data: ResetPasswordRequest) -> AuthMessage:
    """
    Verify 6-digit OTP and update account password with confirmation check.
    """
    db = get_database()
    email_clean = data.email.lower().strip()
    otp_input = data.otp.strip()

    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirm password do not match. Please re-enter them carefully.",
        )

    # Find the most recent active OTP
    reset_entry = await db.password_resets.find_one({
        "email": email_clean,
        "otp": otp_input,
        "used": False,
    })

    if not reset_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or incorrect OTP verification code. Please check and try again.",
        )

    # Check expiration
    now = datetime.now(timezone.utc)
    entry_expires = reset_entry["expires_at"]
    if isinstance(entry_expires, str):
        entry_expires = datetime.fromisoformat(entry_expires.replace("Z", "+00:00"))
    if entry_expires.tzinfo is None:
        entry_expires = entry_expires.replace(tzinfo=timezone.utc)

    if now > entry_expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This OTP has expired (validity: 15 minutes). Please request a new OTP code.",
        )

    # Hash new password
    new_password_hash = get_password_hash(data.new_password)

    # Update user password in database
    update_res = await db.users.update_one(
        {"email": email_clean},
        {"$set": {"password_hash": new_password_hash, "updated_at": now}}
    )
    if update_res.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account could not be found to update password.",
        )

    # Mark OTP as consumed
    await db.password_resets.update_one(
        {"_id": reset_entry["_id"]},
        {"$set": {"used": True, "consumed_at": now}}
    )
    await persist_db_if_fallback()

    return AuthMessage(
        success=True,
        message="Password has been successfully changed! You can now sign in with your new password.",
    )

