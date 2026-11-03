from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone


class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"


class UserBase(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100, description="Display name of the user")
    email: EmailStr = Field(..., description="Unique email address")
    username: Optional[str] = Field(default=None, max_length=50, description="Unique username")
    role: UserRole = Field(default=UserRole.STUDENT, description="Account role: student or admin")


class UserRegister(BaseModel):
    username: Optional[str] = Field(default=None, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(..., min_length=6, max_length=128, description="Account password (min 6 chars)")
    name: Optional[str] = Field(default=None, max_length=100, description="Optional full name")
    role: UserRole = Field(default=UserRole.STUDENT, description="Account role: student or admin")


class UserLogin(BaseModel):
    email: str = Field(..., min_length=1, description="Registered email address or username")
    password: str = Field(..., min_length=1, description="Account password")


class UserResponse(BaseModel):
    id: str = Field(..., description="Unique user ID string")
    name: str = Field(..., description="Display name of the user")
    email: str = Field(..., description="Unique email address")
    username: Optional[str] = Field(default=None, description="Unique username")
    role: UserRole = Field(default=UserRole.STUDENT, description="Account role: student or admin")
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_active: bool = True

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "6724a1b2c3d4e5f6a7b8c9d0",
                "name": "Suzal",
                "username": "Suzal",
                "email": "suzal.php@gmail.com",
                "role": "admin",
                "created_at": "2026-11-01T17:00:00Z",
                "is_active": True
            }
        }
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AuthMessage(BaseModel):
    message: str
    success: bool = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered account email address")


class ForgotPasswordResponse(BaseModel):
    success: bool = True
    message: str
    email: str
    otp_debug: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered account email address")
    otp: str = Field(..., min_length=4, max_length=10, description="6-digit verification code")
    new_password: str = Field(..., min_length=6, max_length=128, description="New password")
    confirm_password: str = Field(..., min_length=6, max_length=128, description="Re-entered new password for safety")
