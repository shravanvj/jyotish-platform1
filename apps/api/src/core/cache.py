"""
Jyotish Platform - Redis Cache Service
"""
import json
import hashlib
from datetime import datetime
from typing import Any, Optional, Callable, TypeVar
from functools import wraps
import redis.asyncio as aioredis

from src.core.config import get_settings

settings = get_settings()

# Global Redis connection pool
redis_pool: Optional[aioredis.Redis] = None


async def init_redis() -> None:
    """Initialize Redis connection pool."""
    global redis_pool
    redis_pool = await aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )


async def close_redis() -> None:
    """Close Redis connection pool."""
    global redis_pool
    if redis_pool:
        await redis_pool.close()


def get_redis() -> aioredis.Redis:
    """Get Redis client instance."""
    if not redis_pool:
        raise RuntimeError("Redis not initialized")
    return redis_pool


class CacheKeys:
    """Namespace for cache key generation."""
    
    BIRTH_CHART = "chart:{lat}:{lon}:{dt}:{ayanamsa}"
    PANCHANG = "panchang:{lat}:{lon}:{date}:{tz}"
    GEOCODE = "geo:{place_hash}"
    HOROSCOPE = "horoscope:{sign}:{type}:{date}"
    MUHURAT = "muhurat:{lat}:{lon}:{date}:{event}"
    
    @staticmethod
    def generate_hash(*args) -> str:
        """Generate a deterministic hash from arguments."""
        content = ":".join(str(arg) for arg in args)
        return hashlib.md5(content.encode()).hexdigest()[:12]


class CacheService:
    """Service for caching astrology calculations."""
    
    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client
    
    async def get(self, key: str) -> Optional[dict]:
        """Get cached value."""
        data = await self.redis.get(key)
        if data:
            return json.loads(data)
        return None
    
    async def set(
        self, 
        key: str, 
        value: dict, 
        ttl: Optional[int] = None
    ) -> None:
        """Set cached value with optional TTL."""
        ttl = ttl or settings.cache_ttl_seconds
        await self.redis.setex(key, ttl, json.dumps(value, default=str))
    
    async def delete(self, key: str) -> None:
        """Delete cached value."""
        await self.redis.delete(key)
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern."""
        keys = []
        async for key in self.redis.scan_iter(pattern):
            keys.append(key)
        if keys:
            await self.redis.delete(*keys)
        return len(keys)
    
    async def get_or_compute(
        self,
        key: str,
        compute_fn: Callable,
        ttl: Optional[int] = None,
    ) -> dict:
        """Get from cache or compute and store."""
        cached = await self.get(key)
        if cached:
            return cached
        
        # Compute fresh value
        result = await compute_fn() if callable(compute_fn) else compute_fn
        await self.set(key, result, ttl)
        return result


def get_cache_service() -> CacheService:
    """Get cache service instance."""
    return CacheService(get_redis())


# Decorator for caching function results
T = TypeVar('T')


def cached(
    key_template: str,
    ttl: Optional[int] = None,
    key_args: Optional[list] = None,
):
    """
    Decorator for caching async function results.
    
    Usage:
        @cached(CacheKeys.BIRTH_CHART, ttl=3600, key_args=['lat', 'lon', 'dt', 'ayanamsa'])
        async def calculate_chart(lat, lon, dt, ayanamsa):
            ...
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            try:
                cache = get_cache_service()
                
                # Build cache key from arguments
                if key_args:
                    key_values = {k: kwargs.get(k) for k in key_args if k in kwargs}
                    # Also check positional args by function parameter names
                    import inspect
                    sig = inspect.signature(func)
                    params = list(sig.parameters.keys())
                    for i, arg in enumerate(args):
                        if i < len(params) and params[i] in key_args:
                            key_values[params[i]] = arg
                    
                    cache_key = key_template.format(**key_values)
                else:
                    cache_key = key_template
                
                # Try cache first
                cached_result = await cache.get(cache_key)
                if cached_result:
                    return cached_result
                
                # Compute and cache
                result = await func(*args, **kwargs)
                
                # Convert to dict if needed for serialization
                if hasattr(result, '__dict__'):
                    result_dict = _serialize_result(result)
                else:
                    result_dict = result
                
                await cache.set(cache_key, result_dict, ttl)
                return result
                
            except Exception:
                # On cache error, just compute without caching
                return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def _serialize_result(obj: Any) -> dict:
    """Serialize complex objects for caching."""
    if hasattr(obj, '__dataclass_fields__'):
        result = {}
        for field_name in obj.__dataclass_fields__:
            value = getattr(obj, field_name)
            if isinstance(value, datetime):
                result[field_name] = value.isoformat()
            elif isinstance(value, list):
                result[field_name] = [_serialize_result(item) for item in value]
            elif hasattr(value, '__dataclass_fields__'):
                result[field_name] = _serialize_result(value)
            else:
                result[field_name] = value
        return result
    elif isinstance(obj, dict):
        return {k: _serialize_result(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_serialize_result(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj
