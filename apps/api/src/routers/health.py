"""
Jyotish Platform - Health Check Router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import redis.asyncio as aioredis

from src.core.database import get_db
from src.core.cache import get_redis

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "jyotish-api"}


@router.get("/health/ready")
async def readiness_check(
    db: AsyncSession = Depends(get_db),
):
    """
    Readiness check - verifies all dependencies are available.
    """
    checks = {
        "database": False,
        "redis": False,
    }
    
    # Check database
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception as e:
        checks["database"] = str(e)
    
    # Check Redis
    try:
        redis = get_redis()
        await redis.ping()
        checks["redis"] = True
    except Exception as e:
        checks["redis"] = str(e)
    
    all_healthy = all(v is True for v in checks.values())
    
    return {
        "status": "ready" if all_healthy else "degraded",
        "checks": checks,
    }


@router.get("/health/live")
async def liveness_check():
    """Liveness check - verifies the service is running."""
    return {"status": "alive"}
