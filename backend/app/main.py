import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.auth.seed import seed_demo_users
from backend.app.routes import health, auth, student, prediction


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handling startup and shutdown events.
    Connects to database, seeds demo credentials, and gracefully cleans up on termination.
    """
    # Startup: Connect to MongoDB (with in-memory fallback)
    await connect_to_mongo()
    # Seed Demo Student and Demo Admin accounts
    await seed_demo_users()
    yield
    # Shutdown: Close connections
    await close_mongo_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-Stack AI Placement Predictor & Skill Gap Analyzer REST API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware to calculate request processing time and attach X-Process-Time header.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


# Include modular route collections
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(student.router, prefix=settings.API_V1_PREFIX)
app.include_router(prediction.router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root_endpoint():
    """
    Root API endpoint providing service metadata and documentation links.
    """
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.APP_ENV,
        "status": "operational",
        "documentation": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health",
        "auth_endpoints": {
            "register": f"{settings.API_V1_PREFIX}/auth/register",
            "login": f"{settings.API_V1_PREFIX}/auth/login",
            "profile": f"{settings.API_V1_PREFIX}/auth/me",
            "demo_credentials": f"{settings.API_V1_PREFIX}/auth/demo-credentials",
        },
        "message": "Welcome to the AI Placement Predictor & Skill Gap Analyzer API",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
    )
