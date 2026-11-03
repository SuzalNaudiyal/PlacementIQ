from datetime import datetime, timezone
from typing import Dict, Any, Optional
from bson import ObjectId


def user_entity(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Transform raw MongoDB User document into standard API response dictionary.
    Converts ObjectId _id to string id and strips password_hash.
    """
    if not doc:
        return None

    created_at = doc.get("created_at")
    if isinstance(created_at, datetime):
        created_at_str = created_at.isoformat()
    elif isinstance(created_at, str):
        created_at_str = created_at
    else:
        created_at_str = datetime.now(timezone.utc).isoformat()

    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "username": doc.get("username", doc.get("email", "").split("@")[0]),
        "email": doc.get("email", ""),
        "role": doc.get("role", "student"),
        "created_at": created_at_str,
        "is_active": doc.get("is_active", True),
    }


def user_db_entity(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Transform raw MongoDB User document preserving password_hash for internal auth verification.
    """
    if not doc:
        return None

    user = user_entity(doc)
    if user:
        user["password_hash"] = doc.get("password_hash")
    return user
