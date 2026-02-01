"""
Jyotish Platform - Profiles Router
Manage saved birth profiles with encrypted storage
"""
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, Path, Depends, status
from pydantic import BaseModel, Field

from src.core.security import get_current_user, encrypt_birth_data, decrypt_birth_data
from src.core.database import get_db
from src.models.models import User, BirthProfile, SubscriptionTier
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func


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


# Request/Response Models
class BirthDataInput(BaseModel):
    """Birth data for creating a profile."""
    birth_datetime: datetime = Field(..., description="Date and time of birth")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone_offset: float = Field(..., ge=-12, le=14, description="Timezone offset from UTC in hours")
    
    class Config:
        json_schema_extra = {
            "example": {
                "birth_datetime": "1990-05-15T10:30:00",
                "latitude": 12.9716,
                "longitude": 77.5946,
                "timezone_offset": 5.5
            }
        }


class ProfileCreateRequest(BaseModel):
    """Request to create a birth profile."""
    name: str = Field(..., min_length=1, max_length=255, description="Display name for the profile")
    birth_place: str = Field(..., min_length=1, max_length=500, description="Birth place name")
    birth_data: BirthDataInput
    relationship: Optional[str] = Field(None, description="Relationship to user (self, spouse, child, etc.)")
    is_primary: bool = Field(False, description="Set as primary profile")


class ProfileUpdateRequest(BaseModel):
    """Request to update a profile."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    birth_place: Optional[str] = Field(None, min_length=1, max_length=500)
    birth_data: Optional[BirthDataInput] = None
    relationship: Optional[str] = None
    is_primary: Optional[bool] = None


class ProfileResponse(BaseModel):
    """Profile response model."""
    id: UUID
    name: str
    birth_place: str
    birth_date: datetime
    relationship: Optional[str]
    is_primary: bool
    
    # Cached astrology data
    moon_sign: Optional[str]
    sun_sign: Optional[str]
    ascendant_sign: Optional[str]
    moon_nakshatra: Optional[str]
    
    created_at: datetime
    updated_at: datetime


class ProfileDetailResponse(ProfileResponse):
    """Detailed profile response with birth data."""
    latitude: float
    longitude: float
    timezone_offset: float
    birth_datetime: datetime


class ProfileListResponse(BaseModel):
    """Response for profile listing."""
    profiles: List[ProfileResponse]
    total: int
    page: int
    page_size: int


# Helper functions
async def get_profile_or_404(
    profile_id: UUID,
    user_id: UUID,
    db: AsyncSession
) -> BirthProfile:
    """Get profile by ID, ensuring it belongs to the user."""
    result = await db.execute(
        select(BirthProfile).where(
            BirthProfile.id == profile_id,
            BirthProfile.user_id == user_id
        )
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


def calculate_chart_summary(birth_data: BirthDataInput) -> dict:
    """Calculate basic chart data for caching."""
    from src.services.ephemeris import get_ephemeris_service
    
    ephemeris = get_ephemeris_service()
    chart = ephemeris.calculate_birth_chart(
        birth_datetime=birth_data.birth_datetime,
        latitude=birth_data.latitude,
        longitude=birth_data.longitude,
        timezone_offset=birth_data.timezone_offset
    )
    
    # Extract key signs
    moon_pos = next((p for p in chart.planets if p.name == "Moon"), None)
    sun_pos = next((p for p in chart.planets if p.name == "Sun"), None)
    
    return {
        "moon_sign": moon_pos.rashi if moon_pos else None,
        "sun_sign": sun_pos.rashi if sun_pos else None,
        "ascendant_sign": chart.ascendant.rashi if chart.ascendant else None,
        "moon_nakshatra": moon_pos.nakshatra if moon_pos else None,
    }


# Endpoints
@router.get("", response_model=ProfileListResponse)
async def list_profiles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    relationship: Optional[str] = Query(None, description="Filter by relationship"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    List all birth profiles for the current user.
    """
    # Build query
    query = select(BirthProfile).where(BirthProfile.user_id == current_user.id)
    
    if relationship:
        query = query.where(BirthProfile.relationship == relationship)
    
    # Get total count
    count_query = select(func.count()).select_from(
        query.subquery()
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    query = query.order_by(
        BirthProfile.is_primary.desc(),
        BirthProfile.created_at.desc()
    ).offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    profiles = result.scalars().all()
    
    return ProfileListResponse(
        profiles=[
            ProfileResponse(
                id=p.id,
                name=p.name,
                birth_place=p.birth_place,
                birth_date=p.birth_date,
                relationship=p.relationship,
                is_primary=p.is_primary,
                moon_sign=p.moon_sign,
                sun_sign=p.sun_sign,
                ascendant_sign=p.ascendant_sign,
                moon_nakshatra=p.moon_nakshatra,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
            for p in profiles
        ],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=ProfileDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    request: ProfileCreateRequest,
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new birth profile.
    
    Birth data (datetime, coordinates) is encrypted at rest for privacy.
    """
    # Check profile limit (e.g., 10 for free, 50 for premium)
    count_result = await db.execute(
        select(func.count()).where(BirthProfile.user_id == current_user.id)
    )
    profile_count = count_result.scalar()
    
    max_profiles = 50 if current_user.subscription_tier.value != "free" else 10
    if profile_count >= max_profiles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Profile limit reached ({max_profiles}). Upgrade to add more profiles."
        )
    
    # Encrypt birth data
    birth_data_dict = {
        "birth_datetime": request.birth_data.birth_datetime.isoformat(),
        "latitude": request.birth_data.latitude,
        "longitude": request.birth_data.longitude,
        "timezone_offset": request.birth_data.timezone_offset,
    }
    encrypted_data, encrypted_dek = encrypt_birth_data(birth_data_dict)
    
    # Calculate chart summary for caching
    try:
        chart_summary = calculate_chart_summary(request.birth_data)
    except Exception:
        chart_summary = {}
    
    # If setting as primary, unset other primaries
    if request.is_primary:
        await db.execute(
            select(BirthProfile)
            .where(BirthProfile.user_id == current_user.id, BirthProfile.is_primary == True)
        )
        # In a real implementation, would update is_primary = False
    
    # Create profile
    profile = BirthProfile(
        user_id=current_user.id,
        name=request.name,
        birth_place=request.birth_place,
        birth_date=request.birth_data.birth_datetime,
        encrypted_data=encrypted_data,
        encrypted_dek=encrypted_dek,
        relationship=request.relationship,
        is_primary=request.is_primary,
        moon_sign=chart_summary.get("moon_sign"),
        sun_sign=chart_summary.get("sun_sign"),
        ascendant_sign=chart_summary.get("ascendant_sign"),
        moon_nakshatra=chart_summary.get("moon_nakshatra"),
    )
    
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    
    return ProfileDetailResponse(
        id=profile.id,
        name=profile.name,
        birth_place=profile.birth_place,
        birth_date=profile.birth_date,
        relationship=profile.relationship,
        is_primary=profile.is_primary,
        moon_sign=profile.moon_sign,
        sun_sign=profile.sun_sign,
        ascendant_sign=profile.ascendant_sign,
        moon_nakshatra=profile.moon_nakshatra,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
        latitude=request.birth_data.latitude,
        longitude=request.birth_data.longitude,
        timezone_offset=request.birth_data.timezone_offset,
        birth_datetime=request.birth_data.birth_datetime,
    )


@router.get("/{profile_id}", response_model=ProfileDetailResponse)
async def get_profile(
    profile_id: UUID = Path(..., description="Profile ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific profile with decrypted birth data.
    """
    profile = await get_profile_or_404(profile_id, current_user.id, db)
    
    # Decrypt birth data
    birth_data = decrypt_birth_data(profile.encrypted_data, profile.encrypted_dek)
    
    return ProfileDetailResponse(
        id=profile.id,
        name=profile.name,
        birth_place=profile.birth_place,
        birth_date=profile.birth_date,
        relationship=profile.relationship,
        is_primary=profile.is_primary,
        moon_sign=profile.moon_sign,
        sun_sign=profile.sun_sign,
        ascendant_sign=profile.ascendant_sign,
        moon_nakshatra=profile.moon_nakshatra,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
        latitude=birth_data["latitude"],
        longitude=birth_data["longitude"],
        timezone_offset=birth_data["timezone_offset"],
        birth_datetime=datetime.fromisoformat(birth_data["birth_datetime"]),
    )


@router.put("/{profile_id}", response_model=ProfileDetailResponse)
async def update_profile(
    profile_id: UUID,
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Update an existing profile.
    """
    profile = await get_profile_or_404(profile_id, current_user.id, db)
    
    # Update fields
    if request.name is not None:
        profile.name = request.name
    
    if request.birth_place is not None:
        profile.birth_place = request.birth_place
    
    if request.relationship is not None:
        profile.relationship = request.relationship
    
    if request.is_primary is not None:
        if request.is_primary:
            # Unset other primaries
            pass  # Would update other profiles
        profile.is_primary = request.is_primary
    
    # If birth data changed, re-encrypt and recalculate
    if request.birth_data is not None:
        birth_data_dict = {
            "birth_datetime": request.birth_data.birth_datetime.isoformat(),
            "latitude": request.birth_data.latitude,
            "longitude": request.birth_data.longitude,
            "timezone_offset": request.birth_data.timezone_offset,
        }
        encrypted_data, encrypted_dek = encrypt_birth_data(birth_data_dict)
        profile.encrypted_data = encrypted_data
        profile.encrypted_dek = encrypted_dek
        profile.birth_date = request.birth_data.birth_datetime
        
        # Recalculate chart summary
        try:
            chart_summary = calculate_chart_summary(request.birth_data)
            profile.moon_sign = chart_summary.get("moon_sign")
            profile.sun_sign = chart_summary.get("sun_sign")
            profile.ascendant_sign = chart_summary.get("ascendant_sign")
            profile.moon_nakshatra = chart_summary.get("moon_nakshatra")
        except Exception:
            pass
    
    profile.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(profile)
    
    # Get current birth data for response
    birth_data = decrypt_birth_data(profile.encrypted_data, profile.encrypted_dek)
    
    return ProfileDetailResponse(
        id=profile.id,
        name=profile.name,
        birth_place=profile.birth_place,
        birth_date=profile.birth_date,
        relationship=profile.relationship,
        is_primary=profile.is_primary,
        moon_sign=profile.moon_sign,
        sun_sign=profile.sun_sign,
        ascendant_sign=profile.ascendant_sign,
        moon_nakshatra=profile.moon_nakshatra,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
        latitude=birth_data["latitude"],
        longitude=birth_data["longitude"],
        timezone_offset=birth_data["timezone_offset"],
        birth_datetime=datetime.fromisoformat(birth_data["birth_datetime"]),
    )


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    profile_id: UUID = Path(..., description="Profile ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a profile.
    """
    profile = await get_profile_or_404(profile_id, current_user.id, db)
    
    await db.delete(profile)
    await db.commit()
    
    return None


@router.post("/{profile_id}/set-primary", response_model=ProfileResponse)
async def set_primary_profile(
    profile_id: UUID = Path(..., description="Profile ID to set as primary"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Set a profile as the primary profile.
    """
    profile = await get_profile_or_404(profile_id, current_user.id, db)
    
    # Unset all other primaries
    result = await db.execute(
        select(BirthProfile).where(
            BirthProfile.user_id == current_user.id,
            BirthProfile.is_primary == True,
            BirthProfile.id != profile_id
        )
    )
    other_primaries = result.scalars().all()
    for p in other_primaries:
        p.is_primary = False
    
    # Set this one as primary
    profile.is_primary = True
    profile.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(profile)
    
    return ProfileResponse(
        id=profile.id,
        name=profile.name,
        birth_place=profile.birth_place,
        birth_date=profile.birth_date,
        relationship=profile.relationship,
        is_primary=profile.is_primary,
        moon_sign=profile.moon_sign,
        sun_sign=profile.sun_sign,
        ascendant_sign=profile.ascendant_sign,
        moon_nakshatra=profile.moon_nakshatra,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.get("/{profile_id}/chart")
async def get_profile_chart(
    profile_id: UUID = Path(..., description="Profile ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Get full birth chart for a profile.
    Convenience endpoint that decrypts profile data and calculates chart.
    """
    profile = await get_profile_or_404(profile_id, current_user.id, db)
    
    # Decrypt birth data
    birth_data = decrypt_birth_data(profile.encrypted_data, profile.encrypted_dek)
    
    # Calculate full chart
    from src.services.ephemeris import get_ephemeris_service
    
    ephemeris = get_ephemeris_service()
    chart = ephemeris.calculate_birth_chart(
        birth_datetime=datetime.fromisoformat(birth_data["birth_datetime"]),
        latitude=birth_data["latitude"],
        longitude=birth_data["longitude"],
        timezone_offset=birth_data["timezone_offset"]
    )
    
    # Format response
    return {
        "profile": {
            "id": str(profile.id),
            "name": profile.name,
            "birth_place": profile.birth_place,
        },
        "birth_data": {
            "datetime": birth_data["birth_datetime"],
            "latitude": birth_data["latitude"],
            "longitude": birth_data["longitude"],
            "timezone_offset": birth_data["timezone_offset"],
        },
        "chart": {
            "ascendant": {
                "longitude": chart.ascendant.longitude,
                "rashi": chart.ascendant.rashi,
                "degree": chart.ascendant.degree_in_rashi,
            } if chart.ascendant else None,
            "planets": [
                {
                    "name": p.name,
                    "longitude": p.longitude,
                    "rashi": p.rashi,
                    "degree": p.degree_in_rashi,
                    "nakshatra": p.nakshatra,
                    "nakshatra_pada": p.nakshatra_pada,
                    "is_retrograde": p.is_retrograde,
                }
                for p in chart.planets
            ],
            "houses": [
                {
                    "house_number": h.house_number,
                    "cusp_longitude": h.cusp_longitude,
                    "rashi": h.rashi,
                }
                for h in chart.houses
            ],
        },
        "calculated_at": datetime.now(timezone.utc).isoformat(),
    }
