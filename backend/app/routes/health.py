from fastapi import APIRouter
from datetime import datetime, timezone
from backend.app.config import settings
from backend.app.database import check_db_health
from backend.app.schemas.health import HealthResponse, DatabaseHealth

router = APIRouter(tags=["System & Health"])

@router.get("/health", response_model=HealthResponse)
async def get_system_health() -> HealthResponse:
    """
    Comprehensive system health check endpoint.
    Reports API readiness, environment info, and MongoDB connectivity.
    """
    db_health_info = await check_db_health()
    overall_status = "healthy" if db_health_info.get("status") == "connected" else "degraded"

    return HealthResponse(
        status=overall_status,
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc).isoformat(),
        database=DatabaseHealth(**db_health_info),
        services={
            "api_gateway": "online",
            "auth_module": "ready",
            "ml_inference": "ready",
            "nlp_pipeline": "ready",
        }
    )

@router.get("/ping")
async def ping() -> dict:
    """
    Simple lightweight ping check for load balancers.
    """
    return {
        "status": "ok",
        "message": "pong",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
