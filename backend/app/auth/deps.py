from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from typing import Optional, Dict, Any

from backend.app.auth.security import decode_access_token
from backend.app.database import get_database
from backend.app.models.user import user_entity
from backend.app.schemas.auth import UserRole

# HTTP Bearer token extractor
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Dict[str, Any]:
    """
    FastAPI dependency to extract and authenticate the current user from the Bearer JWT token.
    Raises 401 Unauthorized if token is missing, expired, or invalid.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or token is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload claims.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    db = get_database()
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"_id": user_id}

    user = await db.users.find_one(query)
    if not user:
        # Fallback query by email if sub was email
        user = await db.users.find_one({"email": user_id})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact support.",
        )

    return user_entity(user)


def require_role(required_role: UserRole):
    """
    Dependency factory to enforce role-based access control (RBAC).
    Admin role has superuser access to all endpoints.
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        if user_role == UserRole.ADMIN.value:
            return current_user

        if user_role != required_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires '{required_role.value}' role.",
            )
        return current_user

    return role_checker
