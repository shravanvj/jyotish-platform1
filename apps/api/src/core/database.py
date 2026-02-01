"""
Jyotish Platform - Database Configuration
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from typing import AsyncIterator
import os

from src.core.config import get_settings

settings = get_settings()

# Naming conventions for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)


class Base(DeclarativeBase):
    """Base class for all database models."""
    metadata = metadata


# Initialize engine only if DATABASE_URL is set
engine = None
async_session_factory = None

if settings.database_url and settings.database_url != "postgresql://localhost/jyotish":
    try:
        db_url = settings.database_url
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
        
        engine = create_async_engine(
            db_url,
            pool_size=settings.db_pool_size,
            max_overflow=settings.db_max_overflow,
            echo=settings.debug,
        )
        
        async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    except Exception as e:
        print(f"Warning: Could not create database engine: {e}")


async def init_db() -> None:
    """Initialize database connection pool."""
    if engine:
        try:
            async with engine.begin() as conn:
                pass  # Connection test
            print("Database connected successfully")
        except Exception as e:
            print(f"Warning: Database connection failed: {e}")
    else:
        print("Warning: No database configured - running without database")


async def close_db() -> None:
    """Close database connection pool."""
    if engine:
        await engine.dispose()


async def get_db() -> AsyncIterator[AsyncSession]:
    """Dependency for getting database sessions."""
    if not async_session_factory:
        raise Exception("Database not configured")
    
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
