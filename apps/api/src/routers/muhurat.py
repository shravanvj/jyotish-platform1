"""
Jyotish Platform - Muhurat Router
Find auspicious times for various activities
"""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field

from src.services.muhurat import (
    MuhuratService,
    get_muhurat_service,
    EventType,
    MuhuratQuality,
    MuhuratWindow,
    MuhuratSearchResult,
    EVENT_RULES,
)
from src.services.panchang import get_panchang_service
from src.core.config import NAKSHATRA_DATA


router = APIRouter()


# Request/Response Models
class MuhuratSearchRequest(BaseModel):
    """Request to search for auspicious times."""
    event_type: str = Field(..., description="Type of event (marriage, griha_pravesh, business_opening, etc.)")
    start_date: datetime = Field(..., description="Start of search window")
    end_date: datetime = Field(..., description="End of search window")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: Optional[str] = None
    
    # Filters
    min_quality: Optional[str] = Field(None, description="Minimum quality (excellent, good, moderate)")
    exclude_inauspicious_periods: bool = Field(True, description="Exclude Rahu Kalam etc.")
    max_results: int = Field(20, ge=1, le=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "marriage",
                "start_date": "2026-03-01T00:00:00",
                "end_date": "2026-03-31T23:59:59",
                "latitude": 12.9716,
                "longitude": 77.5946,
                "location_name": "Bangalore, India",
                "min_quality": "good",
                "exclude_inauspicious_periods": True,
                "max_results": 10
            }
        }


class MuhuratWindowResponse(BaseModel):
    """A single muhurat window."""
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    quality: str
    score: float
    
    tithi: str
    nakshatra: str
    yoga: str
    karana: str
    weekday: str
    
    positive_factors: List[str]
    negative_factors: List[str]
    warnings: List[str]


class MuhuratSearchResponse(BaseModel):
    """Response for muhurat search."""
    event_type: str
    event_description: str
    search_start: datetime
    search_end: datetime
    location_name: Optional[str]
    latitude: float
    longitude: float
    
    total_found: int
    windows: List[MuhuratWindowResponse]
    best_window: Optional[MuhuratWindowResponse]
    
    filters_applied: dict


class ChoghadiyaResponse(BaseModel):
    """Choghadiya periods for a day."""
    date: datetime
    location_name: Optional[str]
    latitude: float
    longitude: float
    
    day_periods: List[dict]  # 8 periods from sunrise to sunset
    night_periods: List[dict]  # 8 periods from sunset to next sunrise
    
    sunrise: datetime
    sunset: datetime


class HoraResponse(BaseModel):
    """Planetary hora for a day."""
    date: datetime
    location_name: Optional[str]
    latitude: float
    longitude: float
    
    day_horas: List[dict]  # 12 day horas
    night_horas: List[dict]  # 12 night horas
    
    sunrise: datetime
    sunset: datetime


class EventTypeInfo(BaseModel):
    """Information about an event type."""
    name: str
    value: str
    description: str
    good_weekdays: List[str]
    favorable_nakshatras: List[str]


# Helper functions
def window_to_response(window: MuhuratWindow) -> MuhuratWindowResponse:
    """Convert MuhuratWindow to response model."""
    duration = int((window.end_time - window.start_time).total_seconds() / 60)
    return MuhuratWindowResponse(
        start_time=window.start_time,
        end_time=window.end_time,
        duration_minutes=duration,
        quality=window.quality.value,
        score=window.score,
        tithi=window.tithi,
        nakshatra=window.nakshatra,
        yoga=window.yoga,
        karana=window.karana,
        weekday=window.weekday,
        positive_factors=window.positive_factors,
        negative_factors=window.negative_factors,
        warnings=window.warnings
    )


# Endpoints
@router.get("/event-types", response_model=List[EventTypeInfo])
async def list_event_types():
    """
    List all supported event types for muhurat finding.
    """
    weekday_names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    
    events = []
    for event_type in EventType:
        rules = EVENT_RULES.get(event_type, {})
        
        # Map weekday numbers to names
        good_weekdays = [weekday_names[d] for d in rules.get("good_weekdays", [])]
        
        # Map nakshatra indices to names
        good_nakshatras = [
            NAKSHATRA_DATA[n-1]["name"] 
            for n in rules.get("good_nakshatras", []) 
            if 1 <= n <= 27
        ]
        
        events.append(EventTypeInfo(
            name=event_type.name.replace("_", " ").title(),
            value=event_type.value,
            description=rules.get("description", ""),
            good_weekdays=good_weekdays,
            favorable_nakshatras=good_nakshatras[:10]  # Limit for readability
        ))
    
    return events


@router.post("/search", response_model=MuhuratSearchResponse)
async def search_muhurat(request: MuhuratSearchRequest):
    """
    Search for auspicious times (muhurat) for a specific event.
    
    Analyzes panchang elements (tithi, nakshatra, yoga, karana, weekday) along with
    inauspicious periods (Rahu Kalam, Yamagandam, Gulika Kalam) to find optimal times.
    """
    # Validate event type
    try:
        event_type = EventType(request.event_type)
    except ValueError:
        valid_types = [e.value for e in EventType]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid event_type. Must be one of: {valid_types}"
        )
    
    # Validate date range (max 90 days)
    delta = request.end_date - request.start_date
    if delta.days > 90:
        raise HTTPException(
            status_code=400,
            detail="Search range cannot exceed 90 days"
        )
    
    if delta.days < 0:
        raise HTTPException(
            status_code=400,
            detail="end_date must be after start_date"
        )
    
    # Validate min_quality
    min_quality = None
    if request.min_quality:
        try:
            min_quality = MuhuratQuality(request.min_quality)
        except ValueError:
            valid_qualities = [q.value for q in MuhuratQuality]
            raise HTTPException(
                status_code=400,
                detail=f"Invalid min_quality. Must be one of: {valid_qualities}"
            )
    
    # Get service and search
    muhurat_service = get_muhurat_service()
    
    result = muhurat_service.find_muhurat(
        event_type=event_type,
        start_date=request.start_date,
        end_date=request.end_date,
        latitude=request.latitude,
        longitude=request.longitude,
        location_name=request.location_name,
    )
    
    # Filter by quality if specified
    windows = result.windows
    if min_quality:
        quality_order = [MuhuratQuality.EXCELLENT, MuhuratQuality.GOOD, MuhuratQuality.MODERATE, MuhuratQuality.POOR]
        min_index = quality_order.index(min_quality)
        windows = [w for w in windows if quality_order.index(w.quality) <= min_index]
    
    # Limit results
    windows = windows[:request.max_results]
    
    # Get event description
    event_description = EVENT_RULES.get(event_type, {}).get("description", "")
    
    return MuhuratSearchResponse(
        event_type=event_type.value,
        event_description=event_description,
        search_start=result.search_start,
        search_end=result.search_end,
        location_name=result.location_name,
        latitude=result.latitude,
        longitude=result.longitude,
        total_found=len(windows),
        windows=[window_to_response(w) for w in windows],
        best_window=window_to_response(result.best_window) if result.best_window and result.best_window in windows else None,
        filters_applied={
            "min_quality": request.min_quality,
            "exclude_inauspicious_periods": request.exclude_inauspicious_periods
        }
    )


@router.get("/choghadiya")
async def get_choghadiya(
    date: datetime = Query(..., description="Date for choghadiya calculation"),
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    location_name: Optional[str] = Query(None),
):
    """
    Get Choghadiya (8 auspicious/inauspicious periods each for day and night).
    
    Choghadiya divides day and night into 8 periods each:
    - Amrit: Excellent for all activities
    - Shubh: Good for auspicious work
    - Labh: Good for business/profit
    - Char: Good for travel
    - Kaal: Avoid important work
    - Rog: Avoid medical procedures
    - Udveg: Causes anxiety
    """
    muhurat_service = get_muhurat_service()
    
    result = muhurat_service.get_choghadiya(
        date=date,
        latitude=latitude,
        longitude=longitude
    )
    
    return ChoghadiyaResponse(
        date=date,
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        day_periods=result["day_periods"],
        night_periods=result["night_periods"],
        sunrise=result["sunrise"],
        sunset=result["sunset"]
    )


@router.get("/hora")
async def get_hora(
    date: datetime = Query(..., description="Date for hora calculation"),
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    location_name: Optional[str] = Query(None),
):
    """
    Get planetary hora (hours ruled by different planets).
    
    Each hour of day/night is ruled by a planet in sequence:
    Sun → Venus → Mercury → Moon → Saturn → Jupiter → Mars
    
    Activities are best performed during the hora of their ruling planet.
    """
    muhurat_service = get_muhurat_service()
    
    result = muhurat_service.get_hora(
        date=date,
        latitude=latitude,
        longitude=longitude
    )
    
    return HoraResponse(
        date=date,
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        day_horas=result["day_horas"],
        night_horas=result["night_horas"],
        sunrise=result["sunrise"],
        sunset=result["sunset"]
    )


@router.get("/today")
async def get_today_summary(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    location_name: Optional[str] = Query(None),
):
    """
    Get today's muhurat summary including choghadiya, hora, and general auspiciousness.
    """
    from datetime import datetime, timezone
    
    today = datetime.now(timezone.utc)
    
    panchang_service = get_panchang_service()
    muhurat_service = get_muhurat_service()
    
    # Get choghadiya
    choghadiya = muhurat_service.get_choghadiya(
        date=today,
        latitude=latitude,
        longitude=longitude
    )
    
    # Get hora
    hora = muhurat_service.get_hora(
        date=today,
        latitude=latitude,
        longitude=longitude
    )
    
    # Get panchang for overall assessment
    panchang = panchang_service.get_panchang(
        date=today,
        latitude=latitude,
        longitude=longitude
    )
    
    # Find current choghadiya
    current_choghadiya = None
    for period in choghadiya["day_periods"] + choghadiya["night_periods"]:
        if period["start"] <= today <= period["end"]:
            current_choghadiya = period
            break
    
    # Find current hora
    current_hora = None
    for period in hora["day_horas"] + hora["night_horas"]:
        if period["start"] <= today <= period["end"]:
            current_hora = period
            break
    
    # Determine overall auspiciousness
    positive_factors = []
    negative_factors = []
    
    # Check tithi
    if panchang.tithi.number in [2, 3, 5, 7, 10, 11, 12, 13]:
        positive_factors.append(f"{panchang.tithi.name} is favorable for most activities")
    elif panchang.tithi.number in [4, 9, 14, 30]:
        negative_factors.append(f"{panchang.tithi.name} is generally avoided for new beginnings")
    
    # Check nakshatra
    auspicious_nakshatras = {3, 4, 7, 8, 11, 12, 13, 17, 20, 21, 22, 25, 27}
    if panchang.nakshatra.number in auspicious_nakshatras:
        positive_factors.append(f"{panchang.nakshatra.name} nakshatra is auspicious")
    
    # Check for inauspicious periods
    rahu_kalam = panchang.rahu_kalam
    yamagandam = panchang.yamagandam
    
    return {
        "date": today.isoformat(),
        "location_name": location_name,
        "latitude": latitude,
        "longitude": longitude,
        
        "panchang_summary": {
            "tithi": panchang.tithi.name,
            "nakshatra": panchang.nakshatra.name,
            "yoga": panchang.yoga.name,
            "karana": panchang.karana.name,
            "weekday": panchang.vaara,
        },
        
        "current_choghadiya": current_choghadiya,
        "current_hora": current_hora,
        
        "inauspicious_periods": {
            "rahu_kalam": {
                "start": rahu_kalam[0].isoformat() if rahu_kalam else None,
                "end": rahu_kalam[1].isoformat() if rahu_kalam else None,
            },
            "yamagandam": {
                "start": yamagandam[0].isoformat() if yamagandam else None,
                "end": yamagandam[1].isoformat() if yamagandam else None,
            },
        },
        
        "choghadiya": {
            "day_periods": choghadiya["day_periods"],
            "night_periods": choghadiya["night_periods"],
        },
        
        "assessment": {
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
        }
    }
