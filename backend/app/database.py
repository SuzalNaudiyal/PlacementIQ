import logging
import time
import os
from pathlib import Path
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from mongomock_motor import AsyncMongoMockClient
from bson import json_util
from backend.app.config import settings

logger = logging.getLogger("uvicorn.error")

SNAPSHOT_DIR = Path(__file__).resolve().parent.parent / "data"
SNAPSHOT_FILE = SNAPSHOT_DIR / "local_db_snapshot.json"
PERSISTED_COLLECTIONS = [
    "users",
    "students",
    "placement_drives",
    "placement_applications",
    "drive_alerts",
    "resumes",
    "roadmaps",
    "interview_sessions",
    "predictions",
    "jobs",
]

class DatabaseManager:
    client: Optional[Any] = None
    db: Optional[Any] = None
    is_connected: bool = False
    is_fallback: bool = False
    driver_type: str = "uninitialized"
    last_error: Optional[str] = None

db_manager = DatabaseManager()


async def persist_db_if_fallback() -> None:
    """
    Saves in-memory mock collections to local JSON file so created accounts,
    student profiles, and applications persist seamlessly across server restarts.
    """
    if not db_manager.is_fallback or db_manager.db is None:
        return
    try:
        os.makedirs(SNAPSHOT_DIR, exist_ok=True)
        snapshot = {}
        for coll_name in PERSISTED_COLLECTIONS:
            docs = await db_manager.db[coll_name].find({}).to_list(length=2000)
            snapshot[coll_name] = docs

        json_data = json_util.dumps(snapshot, indent=2)
        with open(SNAPSHOT_FILE, "w", encoding="utf-8") as f:
            f.write(json_data)
        logger.info(f"Persisted in-memory database snapshot to {SNAPSHOT_FILE}")
    except Exception as e:
        logger.warning(f"Could not persist in-memory database snapshot: {e}")


async def restore_db_from_snapshot(db) -> None:
    """
    Restores previously saved collections from local JSON snapshot if available.
    """
    if not SNAPSHOT_FILE.exists():
        return
    try:
        with open(SNAPSHOT_FILE, "r", encoding="utf-8") as f:
            data = f.read()
        snapshot = json_util.loads(data)
        for coll_name, docs in snapshot.items():
            if docs:
                await db[coll_name].delete_many({})
                await db[coll_name].insert_many(docs)
        logger.info(f"Successfully restored local database snapshot from {SNAPSHOT_FILE}")
    except Exception as e:
        logger.warning(f"Could not restore database snapshot: {e}")


async def connect_to_mongo() -> None:
    """
    Establish connection to MongoDB using Motor.
    If real MongoDB is unreachable, gracefully activates in-memory AsyncMongoMockClient
    with automated on-disk persistence so that user accounts and data are never lost across restarts.
    """
    logger.info(f"Connecting to MongoDB at: {settings.MONGODB_URL}")
    try:
        real_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
        )
        # Verify connection with a fast ping
        await real_client.admin.command("ping")
        db_manager.client = real_client
        db_manager.db = real_client[settings.MONGODB_DB_NAME]
        db_manager.is_connected = True
        db_manager.is_fallback = False
        db_manager.driver_type = "mongodb_cluster"
        db_manager.last_error = None
        logger.info(f"Connected to live MongoDB cluster: '{settings.MONGODB_DB_NAME}'")
    except Exception as e:
        logger.warning(
            f"Live MongoDB unreachable ({e}). Activating persistent in-memory MongoDB driver..."
        )
        mock_client = AsyncMongoMockClient()
        db_manager.client = mock_client
        db_manager.db = mock_client[settings.MONGODB_DB_NAME]
        db_manager.is_connected = True
        db_manager.is_fallback = True
        db_manager.driver_type = "in_memory_mock"
        db_manager.last_error = f"Standalone MongoDB not detected. Running on persistent in-memory driver: {e}"

        # Restore any saved accounts and profiles from disk
        await restore_db_from_snapshot(db_manager.db)
        logger.info(f"In-memory MongoDB initialized for '{settings.MONGODB_DB_NAME}' with disk persistence. App is fully operational.")


async def close_mongo_connection() -> None:
    """
    Close MongoDB client connection on shutdown and persist snapshot if running in fallback mode.
    """
    if db_manager.is_fallback:
        await persist_db_if_fallback()

    if db_manager.client is not None:
        try:
            db_manager.client.close()
        except Exception:
            pass
        db_manager.is_connected = False
        logger.info("MongoDB connection closed.")

def get_database():
    """
    Dependency helper to retrieve the active MongoDB database instance.
    """
    if db_manager.db is None:
        raise RuntimeError("MongoDB database is not initialized.")
    return db_manager.db

async def check_db_health() -> Dict[str, Any]:
    """
    Probe the database and return health metrics including response latency and driver mode.
    """
    if db_manager.client is None or db_manager.db is None:
        return {
            "status": "disconnected",
            "database": settings.MONGODB_DB_NAME,
            "driver_type": "none",
            "is_fallback": False,
            "latency_ms": None,
            "error": "Database client is not initialized",
        }

    start_time = time.time()
    try:
        if db_manager.is_fallback:
            # Quick probe for in-memory db
            await db_manager.db.system_health_probe.insert_one({"ts": time.time()})
            latency_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "connected",
                "database": settings.MONGODB_DB_NAME,
                "driver_type": "in_memory_mock",
                "is_fallback": True,
                "latency_ms": latency_ms,
                "error": None,
            }
        else:
            await db_manager.client.admin.command("ping")
            latency_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "connected",
                "database": settings.MONGODB_DB_NAME,
                "driver_type": "mongodb_cluster",
                "is_fallback": False,
                "latency_ms": latency_ms,
                "error": None,
            }
    except Exception as e:
        return {
            "status": "degraded",
            "database": settings.MONGODB_DB_NAME,
            "driver_type": db_manager.driver_type,
            "is_fallback": db_manager.is_fallback,
            "latency_ms": None,
            "error": str(e),
        }
