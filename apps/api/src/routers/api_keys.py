"""
Jyotish Platform - API Keys Router
Manage developer API keys for programmatic access
"""
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from uuid import UUID
import secrets
import hashlib
from fastapi import APIRouter, HTTPException, Query, Path, Depends, status
from pydantic import BaseModel, Field

from src.core.security import get_current_user
from src.core.database import get_db
from src.models.models import User, ApiKey, ApiUsageLog, SubscriptionTier
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_


router = APIRouter()


# Dependency to get current user from database
async def get_current_user_from_db(
    token_payload: dict = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get full User model from database using token payload."""
    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    result = await db.execute(
        select(User).where(User.id == UUID(user_id))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    return user


# Constants
API_KEY_PREFIX = "jyo_"
SCOPES = ["read", "write", "charts", "panchang", "matchmaking", "muhurat", "reports"]

TIER_LIMITS = {
    SubscriptionTier.FREE: {
        "max_keys": 1,
        "rate_limit": 10,  # per minute
        "monthly_quota": 1000,
        "allowed_scopes": ["read", "charts", "panchang"],
    },
    SubscriptionTier.PREMIUM: {
        "max_keys": 5,
        "rate_limit": 60,
        "monthly_quota": 50000,
        "allowed_scopes": ["read", "write", "charts", "panchang", "matchmaking", "muhurat"],
    },
    SubscriptionTier.PROFESSIONAL: {
        "max_keys": 20,
        "rate_limit": 300,
        "monthly_quota": 500000,
        "allowed_scopes": SCOPES,
    },
}


# Request/Response Models
class ApiKeyCreateRequest(BaseModel):
    """Request to create an API key."""
    name: str = Field(..., min_length=1, max_length=255, description="Key name for identification")
    scopes: List[str] = Field(default=["read"], description="Permission scopes")
    expires_in_days: Optional[int] = Field(None, ge=1, le=365, description="Days until expiry (null=never)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "My Production Key",
                "scopes": ["read", "charts", "panchang"],
                "expires_in_days": 90
            }
        }


class ApiKeyUpdateRequest(BaseModel):
    """Request to update an API key."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    scopes: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ApiKeyResponse(BaseModel):
    """API key response (without full key)."""
    id: UUID
    name: str
    key_prefix: str
    scopes: List[str]
    rate_limit: int
    monthly_quota: int
    requests_this_month: int
    
    is_active: bool
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime


class ApiKeyCreatedResponse(ApiKeyResponse):
    """Response when creating a new key (includes full key)."""
    api_key: str  # Only shown once at creation


class ApiKeyListResponse(BaseModel):
    """Response for API key listing."""
    keys: List[ApiKeyResponse]
    total: int
    tier: str
    limits: dict


class UsageStatsResponse(BaseModel):
    """API usage statistics."""
    key_id: UUID
    key_name: str
    period: str
    
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time_ms: float
    
    requests_by_endpoint: dict
    requests_by_day: List[dict]
    
    quota_used: int
    quota_remaining: int


class ScopeInfo(BaseModel):
    """Information about an API scope."""
    name: str
    description: str
    endpoints: List[str]


# Helper functions
def generate_api_key() -> tuple[str, str, str]:
    """Generate a new API key. Returns (full_key, key_hash, key_prefix)."""
    # Generate 32 random bytes -> 64 char hex string
    random_part = secrets.token_hex(32)
    full_key = f"{API_KEY_PREFIX}{random_part}"
    
    # Hash for storage
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    
    # Prefix for identification (first 12 chars after prefix)
    key_prefix = f"{API_KEY_PREFIX}{random_part[:12]}..."
    
    return full_key, key_hash, key_prefix


# Endpoints
@router.get("/scopes", response_model=List[ScopeInfo])
async def list_scopes():
    """
    List all available API scopes with descriptions.
    """
    scope_info = {
        "read": {
            "description": "Read-only access to all public endpoints",
            "endpoints": ["GET /api/v1/*"],
        },
        "write": {
            "description": "Create and modify resources",
            "endpoints": ["POST /api/v1/*", "PUT /api/v1/*", "DELETE /api/v1/*"],
        },
        "charts": {
            "description": "Access birth chart calculations",
            "endpoints": ["/api/v1/chart/*"],
        },
        "panchang": {
            "description": "Access panchang and calendar data",
            "endpoints": ["/api/v1/panchang/*"],
        },
        "matchmaking": {
            "description": "Access compatibility matching",
            "endpoints": ["/api/v1/match/*"],
        },
        "muhurat": {
            "description": "Access muhurat finder",
            "endpoints": ["/api/v1/muhurat/*"],
        },
        "reports": {
            "description": "Generate PDF reports",
            "endpoints": ["/api/v1/reports/*"],
        },
    }
    
    return [
        ScopeInfo(
            name=name,
            description=info["description"],
            endpoints=info["endpoints"],
        )
        for name, info in scope_info.items()
    ]


@router.get("/limits")
async def get_tier_limits(
    current_user: User = Depends(get_current_user_from_db),
):
    """
    Get API limits for the current user's subscription tier.
    """
    tier = current_user.subscription_tier
    limits = TIER_LIMITS[tier]
    
    return {
        "tier": tier.value,
        "max_keys": limits["max_keys"],
        "rate_limit_per_minute": limits["rate_limit"],
        "monthly_quota": limits["monthly_quota"],
        "allowed_scopes": limits["allowed_scopes"],
        "upgrade_benefits": {
            "premium": TIER_LIMITS[SubscriptionTier.PREMIUM] if tier == SubscriptionTier.FREE else None,
            "professional": TIER_LIMITS[SubscriptionTier.PROFESSIONAL] if tier != SubscriptionTier.PROFESSIONAL else None,
        }
    }


@router.get("", response_model=ApiKeyListResponse)
async def list_api_keys(
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    List all API keys for the current user.
    """
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.user_id == current_user.id)
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()
    
    tier = current_user.subscription_tier
    limits = TIER_LIMITS[tier]
    
    return ApiKeyListResponse(
        keys=[
            ApiKeyResponse(
                id=k.id,
                name=k.name,
                key_prefix=k.key_prefix,
                scopes=k.scopes,
                rate_limit=k.rate_limit,
                monthly_quota=k.monthly_quota,
                requests_this_month=k.requests_this_month,
                is_active=k.is_active,
                last_used_at=k.last_used_at,
                expires_at=k.expires_at,
                created_at=k.created_at,
            )
            for k in keys
        ],
        total=len(keys),
        tier=tier.value,
        limits={
            "max_keys": limits["max_keys"],
            "rate_limit": limits["rate_limit"],
            "monthly_quota": limits["monthly_quota"],
            "allowed_scopes": limits["allowed_scopes"],
        }
    )


@router.post("", response_model=ApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    request: ApiKeyCreateRequest,
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new API key.
    
    **Important:** The full API key is only shown once upon creation.
    Store it securely as it cannot be retrieved later.
    """
    tier = current_user.subscription_tier
    limits = TIER_LIMITS[tier]
    
    # Check key limit
    count_result = await db.execute(
        select(func.count()).where(ApiKey.user_id == current_user.id)
    )
    key_count = count_result.scalar()
    
    if key_count >= limits["max_keys"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"API key limit reached ({limits['max_keys']}). Upgrade for more keys."
        )
    
    # Validate scopes
    invalid_scopes = set(request.scopes) - set(limits["allowed_scopes"])
    if invalid_scopes:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Scopes not allowed for your tier: {invalid_scopes}. Upgrade for access."
        )
    
    # Generate key
    full_key, key_hash, key_prefix = generate_api_key()
    
    # Calculate expiry
    expires_at = None
    if request.expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=request.expires_in_days)
    
    # Create key
    api_key = ApiKey(
        user_id=current_user.id,
        name=request.name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        scopes=request.scopes,
        rate_limit=limits["rate_limit"],
        monthly_quota=limits["monthly_quota"],
        expires_at=expires_at,
    )
    
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)
    
    return ApiKeyCreatedResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        scopes=api_key.scopes,
        rate_limit=api_key.rate_limit,
        monthly_quota=api_key.monthly_quota,
        requests_this_month=0,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        expires_at=api_key.expires_at,
        created_at=api_key.created_at,
        api_key=full_key,
    )


@router.get("/{key_id}", response_model=ApiKeyResponse)
async def get_api_key(
    key_id: UUID = Path(..., description="API key ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Get details of a specific API key.
    """
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return ApiKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        scopes=api_key.scopes,
        rate_limit=api_key.rate_limit,
        monthly_quota=api_key.monthly_quota,
        requests_this_month=api_key.requests_this_month,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        expires_at=api_key.expires_at,
        created_at=api_key.created_at,
    )


@router.put("/{key_id}", response_model=ApiKeyResponse)
async def update_api_key(
    key_id: UUID,
    request: ApiKeyUpdateRequest,
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Update an API key's name, scopes, or active status.
    """
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Update fields
    if request.name is not None:
        api_key.name = request.name
    
    if request.scopes is not None:
        # Validate scopes
        tier = current_user.subscription_tier
        limits = TIER_LIMITS[tier]
        invalid_scopes = set(request.scopes) - set(limits["allowed_scopes"])
        if invalid_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Scopes not allowed: {invalid_scopes}"
            )
        api_key.scopes = request.scopes
    
    if request.is_active is not None:
        api_key.is_active = request.is_active
    
    api_key.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(api_key)
    
    return ApiKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        scopes=api_key.scopes,
        rate_limit=api_key.rate_limit,
        monthly_quota=api_key.monthly_quota,
        requests_this_month=api_key.requests_this_month,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        expires_at=api_key.expires_at,
        created_at=api_key.created_at,
    )


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    key_id: UUID = Path(..., description="API key ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete an API key. This action cannot be undone.
    """
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    await db.delete(api_key)
    await db.commit()
    
    return None


@router.post("/{key_id}/regenerate", response_model=ApiKeyCreatedResponse)
async def regenerate_api_key(
    key_id: UUID = Path(..., description="API key ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Regenerate an API key. The old key will stop working immediately.
    """
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Generate new key
    full_key, key_hash, key_prefix = generate_api_key()
    
    api_key.key_hash = key_hash
    api_key.key_prefix = key_prefix
    api_key.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(api_key)
    
    return ApiKeyCreatedResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        scopes=api_key.scopes,
        rate_limit=api_key.rate_limit,
        monthly_quota=api_key.monthly_quota,
        requests_this_month=api_key.requests_this_month,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        expires_at=api_key.expires_at,
        created_at=api_key.created_at,
        api_key=full_key,
    )


@router.get("/{key_id}/usage", response_model=UsageStatsResponse)
async def get_api_key_usage(
    key_id: UUID = Path(..., description="API key ID"),
    period: str = Query("month", regex="^(day|week|month)$"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Get usage statistics for an API key.
    """
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Calculate period start
    now = datetime.now(timezone.utc)
    if period == "day":
        period_start = now - timedelta(days=1)
    elif period == "week":
        period_start = now - timedelta(weeks=1)
    else:  # month
        period_start = now - timedelta(days=30)
    
    # Get usage logs
    logs_result = await db.execute(
        select(ApiUsageLog).where(
            ApiUsageLog.api_key_id == key_id,
            ApiUsageLog.created_at >= period_start
        )
    )
    logs = logs_result.scalars().all()
    
    # Calculate stats
    total = len(logs)
    successful = len([l for l in logs if 200 <= l.status_code < 400])
    failed = total - successful
    avg_time = sum(l.response_time_ms for l in logs) / total if total > 0 else 0
    
    # Group by endpoint
    by_endpoint = {}
    for log in logs:
        by_endpoint[log.endpoint] = by_endpoint.get(log.endpoint, 0) + 1
    
    # Group by day
    by_day = {}
    for log in logs:
        day = log.created_at.date().isoformat()
        by_day[day] = by_day.get(day, 0) + 1
    
    requests_by_day = [{"date": k, "count": v} for k, v in sorted(by_day.items())]
    
    return UsageStatsResponse(
        key_id=api_key.id,
        key_name=api_key.name,
        period=period,
        total_requests=total,
        successful_requests=successful,
        failed_requests=failed,
        avg_response_time_ms=round(avg_time, 2),
        requests_by_endpoint=by_endpoint,
        requests_by_day=requests_by_day,
        quota_used=api_key.requests_this_month,
        quota_remaining=max(0, api_key.monthly_quota - api_key.requests_this_month),
    )


@router.post("/{key_id}/reset-usage", response_model=ApiKeyResponse)
async def reset_api_key_usage(
    key_id: UUID = Path(..., description="API key ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Reset the monthly usage counter for an API key.
    Only available for Professional tier.
    """
    if current_user.subscription_tier != SubscriptionTier.PROFESSIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usage reset only available for Professional tier"
        )
    
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    api_key.requests_this_month = 0
    api_key.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(api_key)
    
    return ApiKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        scopes=api_key.scopes,
        rate_limit=api_key.rate_limit,
        monthly_quota=api_key.monthly_quota,
        requests_this_month=api_key.requests_this_month,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        expires_at=api_key.expires_at,
        created_at=api_key.created_at,
    )
