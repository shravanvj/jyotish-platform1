"""
Jyotish Platform - Pydantic Schemas for API Validation
"""
from datetime import datetime, date
from typing import Optional, List, Literal, Any
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from uuid import UUID
import re


# ============= Base Schemas =============

class BaseResponse(BaseModel):
    """Base response schema with common fields."""
    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
    message: str
    detail: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Paginated list response."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    pages: int


# ============= Auth Schemas =============

class UserCreate(BaseModel):
    """User registration schema."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: Optional[str] = Field(None, max_length=255)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """User profile response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: str
    name: Optional[str]
    is_verified: bool
    subscription_tier: str
    created_at: datetime


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


# ============= Birth Data Schemas =============

class BirthDataInput(BaseModel):
    """Birth data input for calculations."""
    datetime: datetime = Field(..., description="Birth date and time with timezone")
    latitude: float = Field(..., ge=-90, le=90, description="Birth place latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Birth place longitude")
    timezone_offset: float = Field(..., ge=-12, le=14, description="UTC offset in hours")
    ayanamsa: str = Field(default="lahiri", description="Ayanamsa system to use")
    
    @field_validator('ayanamsa')
    @classmethod
    def validate_ayanamsa(cls, v: str) -> str:
        valid = ['lahiri', 'raman', 'krishnamurti', 'yukteshwar', 'true_chitrapaksha']
        if v.lower() not in valid:
            raise ValueError(f'Ayanamsa must be one of: {", ".join(valid)}')
        return v.lower()


class LocationInput(BaseModel):
    """Location input for geocoding."""
    place: str = Field(..., min_length=2, max_length=500, description="Place name to geocode")


class LocationResponse(BaseModel):
    """Geocoded location response."""
    place: str
    latitude: float
    longitude: float
    timezone: str
    timezone_offset: float


# ============= Planet & Chart Schemas =============

class PlanetPositionResponse(BaseModel):
    """Planet position in chart."""
    model_config = ConfigDict(from_attributes=True)
    
    name: str
    english_name: str
    longitude: float
    latitude: float
    speed: float
    is_retrograde: bool
    rashi_index: int
    rashi_name: str
    rashi_english: str
    degree_in_rashi: float
    nakshatra_index: int
    nakshatra_name: str
    nakshatra_pada: int
    nakshatra_lord: str
    symbol: str


class HousePositionResponse(BaseModel):
    """House cusp position."""
    model_config = ConfigDict(from_attributes=True)
    
    house_number: int
    longitude: float
    rashi_index: int
    rashi_name: str
    degree_in_rashi: float


class BirthChartResponse(BaseModel):
    """Complete birth chart response."""
    model_config = ConfigDict(from_attributes=True)
    
    datetime_utc: datetime
    julian_day: float
    latitude: float
    longitude: float
    timezone_offset: float
    ayanamsa: str
    ayanamsa_value: float
    ascendant: float
    ascendant_rashi: int
    ascendant_nakshatra: int
    planets: List[PlanetPositionResponse]
    houses: List[HousePositionResponse]
    moon_rashi: int
    moon_nakshatra: int
    sun_rashi: int


class DivisionalChartResponse(BaseModel):
    """Divisional chart (D9, D10, etc.) response."""
    chart_type: str  # D1, D9, D10, etc.
    planets: List[PlanetPositionResponse]


class DashaPeriodResponse(BaseModel):
    """Dasha period response."""
    planet: str
    start_date: datetime
    end_date: datetime
    level: int
    duration_years: float


class DashaResponse(BaseModel):
    """Complete dasha response."""
    maha_dasha: List[DashaPeriodResponse]
    current_maha_dasha: DashaPeriodResponse
    current_antar_dasha: Optional[DashaPeriodResponse]
    antar_dashas: List[DashaPeriodResponse]


# ============= Panchang Schemas =============

class PanchangRequest(BaseModel):
    """Panchang calculation request."""
    date: date
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone_offset: float = Field(..., ge=-12, le=14)


class TithiResponse(BaseModel):
    """Tithi information."""
    index: int
    name: str
    paksha: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]


class NakshatraResponse(BaseModel):
    """Nakshatra information."""
    index: int
    name: str
    pada: int
    lord: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]


class YogaResponse(BaseModel):
    """Yoga information."""
    index: int
    name: str
    meaning: str


class KaranaResponse(BaseModel):
    """Karana information."""
    index: int
    name: str


class InauspiciousPeriodResponse(BaseModel):
    """Inauspicious time period."""
    name: str
    start_time: datetime
    end_time: datetime


class PanchangResponse(BaseModel):
    """Complete panchang response."""
    date: date
    vaara: str  # Weekday
    tithi: TithiResponse
    nakshatra: NakshatraResponse
    yoga: YogaResponse
    karana: KaranaResponse
    sunrise: datetime
    sunset: datetime
    moonrise: Optional[datetime]
    moonset: Optional[datetime]
    rahu_kalam: InauspiciousPeriodResponse
    yamagandam: InauspiciousPeriodResponse
    gulika_kalam: InauspiciousPeriodResponse
    masa: str  # Lunar month
    samvatsara: str  # 60-year cycle year


# ============= Matchmaking Schemas =============

class MatchmakingRequest(BaseModel):
    """Matchmaking compatibility request."""
    bride: BirthDataInput
    groom: BirthDataInput
    system: Literal["porutham", "ashtakoota", "both"] = "both"


class PoruthamCheckResponse(BaseModel):
    """Individual Porutham check result."""
    name: str
    passed: bool
    is_essential: bool
    description: str
    remedy: Optional[str] = None


class PoruthamResponse(BaseModel):
    """South Indian Porutham response."""
    total_matches: int
    passed_matches: int
    essential_failed: List[str]
    is_compatible: bool
    checks: List[PoruthamCheckResponse]
    recommendation: str


class AshtakootaFactorResponse(BaseModel):
    """Individual Ashtakoota factor result."""
    name: str
    max_points: int
    obtained_points: float
    description: str
    dosha: Optional[str] = None


class AshtakootaResponse(BaseModel):
    """North Indian Ashtakoota response."""
    total_points: float
    max_points: int = 36
    percentage: float
    factors: List[AshtakootaFactorResponse]
    doshas: List[str]
    is_compatible: bool
    recommendation: str


class MatchmakingResponse(BaseModel):
    """Complete matchmaking response."""
    porutham: Optional[PoruthamResponse] = None
    ashtakoota: Optional[AshtakootaResponse] = None
    overall_compatibility: str
    summary: str


# ============= Muhurat Schemas =============

class MuhuratRequest(BaseModel):
    """Muhurat finder request."""
    date: date
    event_type: str = Field(..., description="Type of event (marriage, griha_pravesh, etc.)")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone_offset: float = Field(..., ge=-12, le=14)


class MuhuratWindowResponse(BaseModel):
    """Single muhurat window."""
    start_time: datetime
    end_time: datetime
    quality: str  # excellent, good, moderate, poor
    score: float
    tithi: str
    nakshatra: str
    positive_factors: List[str]
    negative_factors: List[str]


class MuhuratResponse(BaseModel):
    """Muhurat finder response."""
    event_type: str
    date: date
    windows: List[MuhuratWindowResponse]
    choghadiya: List[dict]
    hora: List[dict]


# ============= Profile Schemas =============

class ProfileCreate(BaseModel):
    """Create birth profile request."""
    name: str = Field(..., min_length=1, max_length=255)
    birth_datetime: datetime
    birth_place: str = Field(..., min_length=2, max_length=500)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone_offset: float
    relationship: Optional[str] = Field(None, max_length=100)
    is_primary: bool = False


class ProfileUpdate(BaseModel):
    """Update birth profile request."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    relationship: Optional[str] = Field(None, max_length=100)
    is_primary: Optional[bool] = None


class ProfileResponse(BaseModel):
    """Birth profile response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    birth_date: datetime
    birth_place: str
    moon_sign: Optional[str]
    sun_sign: Optional[str]
    ascendant_sign: Optional[str]
    moon_nakshatra: Optional[str]
    relationship: Optional[str]
    is_primary: bool
    created_at: datetime


# ============= Report Schemas =============

class ReportCreate(BaseModel):
    """Create report request."""
    report_type: str
    profile_id: Optional[UUID] = None
    profile2_id: Optional[UUID] = None  # For compatibility reports
    config: Optional[dict] = None


class ReportResponse(BaseModel):
    """Report response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    report_type: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    file_path: Optional[str]
    error_message: Optional[str]


# ============= API Key Schemas =============

class ApiKeyCreate(BaseModel):
    """Create API key request."""
    name: str = Field(..., min_length=1, max_length=255)
    scopes: List[str] = Field(default=["read"])


class ApiKeyResponse(BaseModel):
    """API key response (without the actual key)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    key_prefix: str
    scopes: List[str]
    rate_limit: int
    monthly_quota: int
    requests_this_month: int
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime]


class ApiKeyCreatedResponse(ApiKeyResponse):
    """API key created response (includes the actual key, shown only once)."""
    api_key: str


# ============= Horoscope Schemas =============

class HoroscopeRequest(BaseModel):
    """Horoscope request."""
    sign: str = Field(..., description="Rashi name (Mesha, Vrishabha, etc.)")
    horoscope_type: Literal["daily", "weekly", "monthly", "yearly"] = "daily"
    date: Optional[date] = None


class HoroscopeResponse(BaseModel):
    """Horoscope response."""
    sign: str
    sign_english: str
    horoscope_type: str
    date: date
    content: dict  # Structured horoscope content
    lucky_number: Optional[int]
    lucky_color: Optional[str]
    compatibility: Optional[str]
