"""
Jyotish Platform - FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import redis.asyncio as redis
from typing import AsyncIterator

from src.core.config import get_settings
from src.core.database import init_db, close_db
from src.core.cache import init_redis, close_redis
from src.routers import (
    birth_chart,
    panchang,
    matchmaking,
    muhurat,
    horoscope,
    auth,
    profiles,
    reports,
    api_keys,
    health,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan manager for startup/shutdown."""
    # Startup
    await init_db()
    await init_redis()
    yield
    # Shutdown
    await close_db()
    await close_redis()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title=settings.app_name,
        description="""
        Jyotish Platform API - Comprehensive Vedic Astrology Services
        
        Features:
        - Birth Chart (Kundli) calculations with multiple divisional charts
        - Panchang (Hindu calendar) with tithi, nakshatra, yoga, karana
        - Matchmaking with South Indian Porutham and North Indian Ashtakoota
        - Muhurat finder for auspicious timings
        - Daily, weekly, monthly, yearly horoscopes
        - Premium PDF report generation
        - Developer API access
        
        All calculations use Swiss Ephemeris with sidereal zodiac.
        """,
        version=settings.app_version,
        docs_url="/docs" if settings.environment == "development" else None,
        redoc_url="/redoc" if settings.environment == "development" else None,
        lifespan=lifespan,
    )
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Exception handlers
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        """Global exception handler for unhandled errors."""
        return JSONResponse(
            status_code=500,
            content={
                "error": "internal_server_error",
                "message": "An unexpected error occurred",
                "detail": str(exc) if settings.debug else None,
            },
        )
    
    # Include routers
    app.include_router(health.router, tags=["Health"])
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(birth_chart.router, prefix="/api/v1/chart", tags=["Birth Chart"])
    app.include_router(panchang.router, prefix="/api/v1/panchang", tags=["Panchang"])
    app.include_router(matchmaking.router, prefix="/api/v1/match", tags=["Matchmaking"])
    app.include_router(muhurat.router, prefix="/api/v1/muhurat", tags=["Muhurat"])
    app.include_router(horoscope.router, prefix="/api/v1/horoscope", tags=["Horoscope"])
    app.include_router(profiles.router, prefix="/api/v1/profiles", tags=["Profiles"])
    app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
    app.include_router(api_keys.router, prefix="/api/v1/developer", tags=["Developer API"])
    
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development",
    )
