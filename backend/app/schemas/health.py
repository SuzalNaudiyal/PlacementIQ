from typing import Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class DatabaseHealth(BaseModel):
    status: str = Field(..., description="'connected' or 'disconnected'")
    database: str
    driver_type: Optional[str] = "mongodb_cluster"
    is_fallback: Optional[bool] = False
    latency_ms: Optional[float] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = Field(..., description="'healthy' or 'degraded'")
    app_name: str
    version: str
    environment: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    database: DatabaseHealth
    services: Dict[str, str] = Field(
        default_factory=lambda: {
            "api": "online",
            "auth": "ready",
            "ml_engine": "ready",
            "nlp_parser": "ready",
        }
    )
