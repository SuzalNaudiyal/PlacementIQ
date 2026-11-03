from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone


class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full Name of the user")
    email: EmailStr = Field(..., description="Unique email address")
    username: Optional[str] = Field(default=None, max_length=50, description="Unique username or handle")
    role: UserRole = Field(default=UserRole.STUDENT, description="Account role: student or admin")


class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=128, description="Account password (min 6 chars)")


class UserLogin(BaseModel):
    email: str = Field(..., min_length=1, description="Registered email address or username")
    password: str = Field(..., min_length=1, description="Account password")


class UserResponse(UserBase):
    id: str = Field(..., description="Unique user ID string")
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
