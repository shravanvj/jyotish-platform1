"""
Muhurat Router
Find auspicious timings for various events like marriage, griha pravesh, business, etc.
"""
from datetime import datetime, date, timedelta, time
from typing import Optional, List
from enum import Enum
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, validator

from services.panchang import PanchangService
from services.ephemeris import EphemerisService, Nakshatra
from core.redis_client import cache

import structlog

router = APIRouter(prefix="/muhurat", tags=["muhurat"])
logger = structlog.get_logger()


# ============================================================================
# Enums and Constants
# ============================================================================

class EventType(str, Enum):
    MARRIAGE = "marriage"
    ENGAGEMENT = "engagement"
    GRIHA_PRAVESH = "griha_pravesh"
    VEHICLE_PURCHASE = "vehicle_purchase"
    BUSINESS_OPENING = "business_opening"
    EDUCATION_START = "education_start"
    TRAVEL = "travel"
    SURGERY = "surgery"
    NAMING_CEREMONY = "naming_ceremony"
    PROPERTY_PURCHASE = "property_purchase"
    GOLD_PURCHASE = "gold_purchase"
    INVESTMENT = "investment"
    JOB_JOINING = "job_joining"
    FOUNDATION_LAYING = "foundation_laying"
    MUNDAN = "mundan"  # First haircut
    ANNAPRASHAN = "annaprashan"  # First solid food
    UPANAYANA = "upanayana"  # Sacred thread ceremony


# Nakshatras classified by suitability for different activities
NAKSHATRA_CLASSIFICATIONS = {
    "fixed": ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada"],  # For foundations, buying property
    "movable": ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Anuradha", "Shravana", "Dhanishta", "Shatabhisha"],  # For travel, trade
    "soft": ["Mrigashira", "Chitra", "Anuradha", "Revati"],  # For arts, romantic activities
    "sharp": ["Mula", "Jyeshtha", "Ardra", "Ashlesha"],  # For surgery, separation
    "dreadful": ["Bharani", "Magha", "Purva Phalguni", "Purva Ashadha", "Purva Bhadrapada"],  # Generally avoided
}

# Event-specific nakshatra recommendations
EVENT_NAKSHATRAS = {
    EventType.MARRIAGE: ["Rohini", "Mrigashira", "Magha", "Uttara Phalguni", "Hasta", "Swati", "Anuradha", "Mula", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"],
    EventType.GRIHA_PRAVESH: ["Rohini", "Mrigashira", "Uttara Phalguni", "Hasta", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Uttara Bhadrapada", "Revati"],
    EventType.BUSINESS_OPENING: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"],
    EventType.VEHICLE_PURCHASE: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Revati"],
    EventType.TRAVEL: ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Anuradha", "Shravana", "Dhanishta", "Revati"],
    EventType.SURGERY: ["Ashwini", "Punarvasu", "Pushya", "Ashlesha", "Mula", "Jyeshtha"],
    EventType.EDUCATION_START: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Shravana", "Revati"],
    EventType.NAMING_CEREMONY: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Uttara Bhadrapada", "Revati"],
    EventType.PROPERTY_PURCHASE: ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada"],
    EventType.GOLD_PURCHASE: ["Ashwini", "Rohini", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Shravana", "Dhanishta", "Revati"],
    EventType.INVESTMENT: ["Ashwini", "Rohini", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Anuradha", "Shravana", "Uttara Bhadrapada", "Revati"],
    EventType.JOB_JOINING: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Anuradha", "Shravana", "Revati"],
    EventType.FOUNDATION_LAYING: ["Rohini", "Mrigashira", "Uttara Phalguni", "Hasta", "Chitra", "Uttara Ashadha", "Shravana", "Uttara Bhadrapada"],
    EventType.MUNDAN: ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Jyeshtha", "Shravana", "Revati"],
    EventType.ANNAPRASHAN: ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"],
    EventType.UPANAYANA: ["Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Anuradha", "Shravana", "Dhanishta", "Revati"],
}

# Tithis to avoid
AVOID_TITHIS = {
    "rikta": [4, 9, 14, 19, 24, 29],  # Chaturthi, Navami, Chaturdashi in both pakshas
    "amavasya": [30],  # New moon
    "purnima_for_some": [15],  # Full moon - avoided for some events
}

# Good tithis for specific events
GOOD_TITHIS = {
    EventType.MARRIAGE: [2, 3, 5, 7, 10, 11, 12, 13, 17, 18, 20, 22, 25, 26, 27],
    EventType.GRIHA_PRAVESH: [2, 3, 5, 6, 7, 10, 11, 12, 13, 15],
    EventType.BUSINESS_OPENING: [2, 3, 5, 6, 7, 10, 11, 12, 13],
}


# ============================================================================
# Pydantic Models
# ============================================================================

class LocationInput(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone: str = Field(default="Asia/Kolkata")


class MuhuratSearchRequest(BaseModel):
    event_type: EventType
    start_date: date
    end_date: date
    location: LocationInput
    
    # Optional filters
    avoid_rahu_kalam: bool = Field(default=True, description="Avoid Rahu Kalam timing")
    avoid_yamagandam: bool = Field(default=True, description="Avoid Yamagandam timing")
    avoid_gulika: bool = Field(default=False, description="Avoid Gulika Kalam timing")
    avoid_rikta_tithi: bool = Field(default=True, description="Avoid Rikta tithis (4, 9, 14)")
    avoid_bhadra: bool = Field(default=True, description="Avoid Vishti/Bhadra karana")
    exclude_nakshatras: List[str] = Field(default=[], description="Nakshatras to exclude")
    preferred_time_start: Optional[time] = Field(default=None, description="Preferred start time")
    preferred_time_end: Optional[time] = Field(default=None, description="Preferred end time")
    
    @validator('end_date')
    def end_after_start(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        if 'start_date' in values and (v - values['start_date']).days > 90:
            raise ValueError('Date range cannot exceed 90 days')
        return v


class MuhuratWindow(BaseModel):
    date: date
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    
    # Quality indicators
    score: int = Field(..., ge=0, le=100, description="Overall quality score 0-100")
    quality: str = Field(..., description="excellent/good/average")
    
    # Panchang elements
    tithi: str
    nakshatra: str
    yoga: str
    karana: str
    
    # Details
    reasons_favorable: List[str]
    reasons_caution: List[str]
    
    # Conflicts
    overlaps_rahu_kalam: bool
    overlaps_yamagandam: bool


class MuhuratSearchResponse(BaseModel):
    event_type: EventType
    search_period: dict
    location: LocationInput
    filters_applied: dict
    
    windows: List[MuhuratWindow]
    total_found: int
    
    best_window: Optional[MuhuratWindow]


class QuickMuhuratResponse(BaseModel):
    date: date
    event_type: EventType
    is_suitable: bool
    score: int
    summary: str
    best_times: List[dict]


# ============================================================================
# Helper Functions
# ============================================================================

def calculate_muhurat_score(
    panchang_data,
    event_type: EventType,
    time_slot_start: datetime,
    time_slot_end: datetime,
    filters: dict
) -> tuple[int, List[str], List[str]]:
    """
    Calculate muhurat quality score based on panchang elements.
    
    Returns: (score, favorable_reasons, caution_reasons)
    """
    score = 50  # Base score
    favorable = []
    caution = []
    
    nakshatra_name = panchang_data.nakshatra.name
    tithi_num = panchang_data.tithi.number
    
    # Nakshatra check (±30 points)
    event_nakshatras = EVENT_NAKSHATRAS.get(event_type, [])
    if nakshatra_name in event_nakshatras:
        score += 30
        favorable.append(f"{nakshatra_name} is highly favorable for {event_type.value}")
    elif nakshatra_name in NAKSHATRA_CLASSIFICATIONS.get("dreadful", []):
        score -= 30
        caution.append(f"{nakshatra_name} is generally not recommended")
    else:
        score += 10  # Neutral nakshatra
    
    # Tithi check (±20 points)
    if tithi_num in AVOID_TITHIS["rikta"]:
        score -= 20
        caution.append(f"Rikta tithi - may face obstacles")
    elif tithi_num in AVOID_TITHIS["amavasya"]:
        score -= 25
        caution.append("Amavasya - generally avoided for auspicious activities")
    elif event_type in GOOD_TITHIS and tithi_num in GOOD_TITHIS[event_type]:
        score += 20
        favorable.append(f"Favorable tithi for {event_type.value}")
    else:
        score += 5  # Neutral tithi
    
    # Yoga check (±10 points)
    auspicious_yogas = [1, 2, 3, 6, 7, 11, 13, 15, 17, 20, 21, 22, 23, 24, 25, 27]
    if panchang_data.yoga.number in auspicious_yogas:
        score += 10
        favorable.append(f"{panchang_data.yoga.name} yoga is auspicious")
    elif panchang_data.yoga.number == 27:  # Vaidhriti
        score -= 10
        caution.append("Vaidhriti yoga - use caution")
    
    # Karana check (±10 points)
    if panchang_data.karana.is_vishti:
        score -= 15
        caution.append("Vishti (Bhadra) karana - avoid new beginnings")
    else:
        score += 5
    
    # Day of week check
    favorable_days = {
        EventType.MARRIAGE: [0, 2, 3, 4],  # Mon, Wed, Thu, Fri
        EventType.BUSINESS_OPENING: [0, 2, 3, 4],
        EventType.VEHICLE_PURCHASE: [2, 4, 5],  # Wed, Fri, Sat
        EventType.TRAVEL: [0, 2, 4, 6],  # Mon, Wed, Fri, Sun
        EventType.SURGERY: [1, 5],  # Tue, Sat
    }
    
    weekday = time_slot_start.weekday()
    if event_type in favorable_days:
        if weekday in favorable_days[event_type]:
            score += 5
            favorable.append(f"{panchang_data.vara.name} is good for {event_type.value}")
    
    # Time slot considerations
    # Morning hours (6-10 AM) generally good
    hour = time_slot_start.hour
    if 6 <= hour <= 10:
        score += 5
        favorable.append("Morning hours are generally auspicious")
    # Avoid late evening (after 6 PM) for some events
    if hour >= 18 and event_type in [EventType.GRIHA_PRAVESH, EventType.NAMING_CEREMONY]:
        score -= 5
        caution.append("Evening hours less preferred for this activity")
    
    # Abhijit muhurat bonus
    if panchang_data.abhijit_start and panchang_data.abhijit_end:
        if time_slot_start <= panchang_data.abhijit_end and time_slot_end >= panchang_data.abhijit_start:
            score += 15
            favorable.append("Overlaps with Abhijit Muhurat - highly auspicious")
    
    # Cap score between 0 and 100
    score = max(0, min(100, score))
    
    return score, favorable, caution


def get_quality_label(score: int) -> str:
    """Convert score to quality label."""
    if score >= 75:
        return "excellent"
    elif score >= 50:
        return "good"
    else:
        return "average"


def check_time_conflicts(
    time_slot: datetime,
    duration_minutes: int,
    rahu_start: datetime,
    rahu_end: datetime,
    yama_start: datetime,
    yama_end: datetime
) -> tuple[bool, bool]:
    """Check if time slot conflicts with inauspicious periods."""
    slot_end = time_slot + timedelta(minutes=duration_minutes)
    
    rahu_conflict = not (slot_end <= rahu_start or time_slot >= rahu_end)
    yama_conflict = not (slot_end <= yama_start or time_slot >= yama_end)
    
    return rahu_conflict, yama_conflict


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/search", response_model=MuhuratSearchResponse)
async def search_muhurat(request: MuhuratSearchRequest):
    """
    Search for auspicious muhurat windows within a date range.
    
    Analyzes panchang for each day and identifies suitable time windows
    based on the event type and applied filters.
    """
    panchang_service = PanchangService()
    windows = []
    
    current_date = request.start_date
    while current_date <= request.end_date:
        # Get panchang for the day
        panchang_data = panchang_service.get_panchang(
            date_val=current_date,
            latitude=request.location.latitude,
            longitude=request.location.longitude,
            timezone_str=request.location.timezone
        )
        
        # Skip if nakshatra is excluded
        if panchang_data.nakshatra.name in request.exclude_nakshatras:
            current_date += timedelta(days=1)
            continue
        
        # Skip if rikta tithi and filter is on
        if request.avoid_rikta_tithi and panchang_data.tithi.number in AVOID_TITHIS["rikta"]:
            current_date += timedelta(days=1)
            continue
        
        # Skip if bhadra karana and filter is on
        if request.avoid_bhadra and panchang_data.karana.is_vishti:
            current_date += timedelta(days=1)
            continue
        
        # Define time slots to analyze (2-hour windows)
        tz = ZoneInfo(request.location.timezone)
        base_start = panchang_data.sunrise
        base_end = panchang_data.sunset
        
        # Apply preferred time filters
        if request.preferred_time_start:
            preferred_start = datetime.combine(current_date, request.preferred_time_start, tz)
            if preferred_start > base_start:
                base_start = preferred_start
        
        if request.preferred_time_end:
            preferred_end = datetime.combine(current_date, request.preferred_time_end, tz)
            if preferred_end < base_end:
                base_end = preferred_end
        
        # Generate time slots
        slot_duration = 120  # 2 hours
        current_slot = base_start
        
        while current_slot + timedelta(minutes=slot_duration) <= base_end:
            slot_end = current_slot + timedelta(minutes=slot_duration)
            
            # Check conflicts with inauspicious periods
            rahu_conflict, yama_conflict = check_time_conflicts(
                current_slot, slot_duration,
                panchang_data.rahu_kalam_start, panchang_data.rahu_kalam_end,
                panchang_data.yamagandam_start, panchang_data.yamagandam_end
            )
            
            # Skip if conflicts and filters are on
            if request.avoid_rahu_kalam and rahu_conflict:
                current_slot += timedelta(minutes=30)
                continue
            
            if request.avoid_yamagandam and yama_conflict:
                current_slot += timedelta(minutes=30)
                continue
            
            # Calculate score
            score, favorable, caution = calculate_muhurat_score(
                panchang_data, request.event_type,
                current_slot, slot_end,
                request.model_dump()
            )
            
            # Only include windows with score >= 40
            if score >= 40:
                windows.append(MuhuratWindow(
                    date=current_date,
                    start_time=current_slot,
                    end_time=slot_end,
                    duration_minutes=slot_duration,
                    score=score,
                    quality=get_quality_label(score),
                    tithi=panchang_data.tithi.name,
                    nakshatra=panchang_data.nakshatra.name,
                    yoga=panchang_data.yoga.name,
                    karana=panchang_data.karana.name,
                    reasons_favorable=favorable,
                    reasons_caution=caution,
                    overlaps_rahu_kalam=rahu_conflict,
                    overlaps_yamagandam=yama_conflict
                ))
            
            current_slot += timedelta(minutes=30)  # 30-minute increments
        
        current_date += timedelta(days=1)
    
    # Sort by score (descending)
    windows.sort(key=lambda w: w.score, reverse=True)
    
    # Get best window
    best_window = windows[0] if windows else None
    
    return MuhuratSearchResponse(
        event_type=request.event_type,
        search_period={"start": request.start_date, "end": request.end_date},
        location=request.location,
        filters_applied={
            "avoid_rahu_kalam": request.avoid_rahu_kalam,
            "avoid_yamagandam": request.avoid_yamagandam,
            "avoid_rikta_tithi": request.avoid_rikta_tithi,
            "avoid_bhadra": request.avoid_bhadra,
            "exclude_nakshatras": request.exclude_nakshatras
        },
        windows=windows[:50],  # Limit to top 50
        total_found=len(windows),
        best_window=best_window
    )


@router.get("/quick/{event_type}")
async def quick_muhurat_check(
    event_type: EventType,
    date_val: date = Query(default=None),
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    timezone: str = Query(default="Asia/Kolkata")
):
    """
    Quick muhurat check for a specific date and event.
    
    Returns a simple yes/no with best times.
    """
    if date_val is None:
        date_val = date.today()
    
    panchang_service = PanchangService()
    panchang_data = panchang_service.get_panchang(
        date_val=date_val,
        latitude=latitude,
        longitude=longitude,
        timezone_str=timezone
    )
    
    # Calculate base score
    score, favorable, caution = calculate_muhurat_score(
        panchang_data, event_type,
        panchang_data.sunrise, panchang_data.sunset,
        {}
    )
    
    is_suitable = score >= 50
    
    # Find best times
    best_times = []
    
    # Abhijit muhurat is always good
    if panchang_data.abhijit_start and panchang_data.abhijit_end:
        best_times.append({
            "name": "Abhijit Muhurat",
            "start": panchang_data.abhijit_start.isoformat(),
            "end": panchang_data.abhijit_end.isoformat(),
            "reason": "Most auspicious time of the day"
        })
    
    # Morning window (avoiding Rahu Kalam)
    morning_start = panchang_data.sunrise + timedelta(hours=1)
    morning_end = panchang_data.sunrise + timedelta(hours=3)
    
    if not (morning_end <= panchang_data.rahu_kalam_start or morning_start >= panchang_data.rahu_kalam_end):
        # Adjust for Rahu Kalam
        if morning_start < panchang_data.rahu_kalam_start:
            morning_end = panchang_data.rahu_kalam_start
    
    if morning_end > morning_start:
        best_times.append({
            "name": "Morning Window",
            "start": morning_start.isoformat(),
            "end": morning_end.isoformat(),
            "reason": "Early morning hours are generally auspicious"
        })
    
    summary = f"{'Suitable' if is_suitable else 'Not ideal'} for {event_type.value}. "
    if favorable:
        summary += favorable[0] + ". "
    if caution:
        summary += "Note: " + caution[0]
    
    return QuickMuhuratResponse(
        date=date_val,
        event_type=event_type,
        is_suitable=is_suitable,
        score=score,
        summary=summary,
        best_times=best_times
    )


@router.get("/today/{event_type}")
async def today_muhurat(
    event_type: EventType,
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    timezone: str = Query(default="Asia/Kolkata")
):
    """
    Get muhurat windows for today for a specific event type.
    """
    today = date.today()
    tomorrow = today + timedelta(days=1)
    
    request = MuhuratSearchRequest(
        event_type=event_type,
        start_date=today,
        end_date=today,
        location=LocationInput(latitude=latitude, longitude=longitude, timezone=timezone)
    )
    
    return await search_muhurat(request)


@router.get("/event-types")
async def list_event_types():
    """
    List all supported event types with descriptions.
    """
    descriptions = {
        EventType.MARRIAGE: "Wedding ceremonies and marriage rituals",
        EventType.ENGAGEMENT: "Engagement ceremonies and ring exchange",
        EventType.GRIHA_PRAVESH: "House warming and entering new home",
        EventType.VEHICLE_PURCHASE: "Buying new vehicles, first drive",
        EventType.BUSINESS_OPENING: "Starting new business, shop opening",
        EventType.EDUCATION_START: "Starting education, joining school/college",
        EventType.TRAVEL: "Long journeys, important trips",
        EventType.SURGERY: "Medical procedures and operations",
        EventType.NAMING_CEREMONY: "Naming ceremony for newborn",
        EventType.PROPERTY_PURCHASE: "Buying land or property",
        EventType.GOLD_PURCHASE: "Buying gold and jewelry",
        EventType.INVESTMENT: "Financial investments and contracts",
        EventType.JOB_JOINING: "Starting new job or position",
        EventType.FOUNDATION_LAYING: "Laying foundation for construction",
        EventType.MUNDAN: "First haircut ceremony for children",
        EventType.ANNAPRASHAN: "First solid food ceremony for infants",
        EventType.UPANAYANA: "Sacred thread ceremony",
    }
    
    return [
        {
            "type": event_type.value,
            "name": event_type.value.replace("_", " ").title(),
            "description": descriptions.get(event_type, "")
        }
        for event_type in EventType
    ]


@router.get("/auspicious-days")
async def get_auspicious_days(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    event_type: Optional[EventType] = None,
    latitude: float = Query(default=28.6139),  # Delhi default
    longitude: float = Query(default=77.2090),
    timezone: str = Query(default="Asia/Kolkata")
):
    """
    Get list of auspicious days in a month.
    
    Returns days ranked by overall auspiciousness or suitability for specific event.
    """
    panchang_service = PanchangService()
    
    # Get days in month
    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)
    
    first_day = date(year, month, 1)
    num_days = (next_month - first_day).days
    
    auspicious_days = []
    
    for day in range(1, num_days + 1):
        current_date = date(year, month, day)
        
        panchang_data = panchang_service.get_panchang(
            date_val=current_date,
            latitude=latitude,
            longitude=longitude,
            timezone_str=timezone
        )
        
        # Skip clearly inauspicious days
        if panchang_data.tithi.number in AVOID_TITHIS["amavasya"]:
            continue
        if panchang_data.karana.is_vishti:
            continue
        
        # Calculate score
        if event_type:
            score, favorable, caution = calculate_muhurat_score(
                panchang_data, event_type,
                panchang_data.sunrise, panchang_data.sunset,
                {}
            )
        else:
            # General auspiciousness score
            score = 50
            favorable = []
            caution = []
            
            # Nakshatra based
            if panchang_data.nakshatra.name in NAKSHATRA_CLASSIFICATIONS["movable"]:
                score += 15
                favorable.append("Chara (movable) nakshatra")
            elif panchang_data.nakshatra.name in NAKSHATRA_CLASSIFICATIONS["soft"]:
                score += 10
                favorable.append("Mridu (soft) nakshatra")
            
            # Tithi based
            if panchang_data.tithi.number not in AVOID_TITHIS["rikta"]:
                score += 10
            
            # Yoga based
            if panchang_data.yoga.number in [1, 2, 3, 6, 7, 11, 13]:
                score += 10
                favorable.append(f"{panchang_data.yoga.name} yoga")
        
        if score >= 50:
            auspicious_days.append({
                "date": current_date,
                "day_of_week": current_date.strftime("%A"),
                "score": score,
                "quality": get_quality_label(score),
                "tithi": panchang_data.tithi.name,
                "nakshatra": panchang_data.nakshatra.name,
                "favorable_factors": favorable[:3],
                "cautions": caution[:2] if caution else []
            })
    
    # Sort by score
    auspicious_days.sort(key=lambda d: d["score"], reverse=True)
    
    return {
        "year": year,
        "month": month,
        "event_type": event_type.value if event_type else "general",
        "auspicious_days": auspicious_days,
        "total_found": len(auspicious_days)
    }
