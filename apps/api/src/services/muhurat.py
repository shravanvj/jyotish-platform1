"""
Jyotish Platform - Muhurat Service
Find auspicious times for various activities
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from enum import Enum

from src.services.panchang import PanchangService, get_panchang_service, Panchang


class EventType(Enum):
    """Types of events for muhurat finding."""
    MARRIAGE = "marriage"
    NAMING_CEREMONY = "naming_ceremony"
    GRIHA_PRAVESH = "griha_pravesh"
    BUSINESS_OPENING = "business_opening"
    TRAVEL = "travel"
    SURGERY = "surgery"
    VEHICLE_PURCHASE = "vehicle_purchase"
    PROPERTY_PURCHASE = "property_purchase"
    ENGAGEMENT = "engagement"
    EDUCATION_START = "education_start"
    JEWELLERY_PURCHASE = "jewellery_purchase"
    GENERAL_AUSPICIOUS = "general_auspicious"


class MuhuratQuality(Enum):
    """Quality rating for a muhurat."""
    EXCELLENT = "excellent"
    GOOD = "good"
    MODERATE = "moderate"
    POOR = "poor"


@dataclass
class MuhuratWindow:
    """A time window that is auspicious."""
    start_time: datetime
    end_time: datetime
    quality: MuhuratQuality
    score: float  # 0-100
    event_type: EventType
    
    # Panchang details at start
    tithi: str
    nakshatra: str
    yoga: str
    karana: str
    weekday: str
    
    # Reasons
    positive_factors: List[str]
    negative_factors: List[str]
    warnings: List[str]


@dataclass
class MuhuratSearchResult:
    """Result of a muhurat search."""
    event_type: EventType
    search_start: datetime
    search_end: datetime
    location_name: Optional[str]
    latitude: float
    longitude: float
    
    windows: List[MuhuratWindow]
    total_found: int
    best_window: Optional[MuhuratWindow]
    
    filters_applied: Dict[str, bool]


# Event-specific rules
EVENT_RULES = {
    EventType.MARRIAGE: {
        "good_tithis": [2, 3, 5, 7, 10, 11, 12, 13],  # Avoid 4, 9, 14, 30, 1
        "good_nakshatras": [3, 4, 7, 8, 11, 12, 13, 17, 20, 21, 22, 25, 27],
        "good_weekdays": [1, 3, 4, 5],  # Mon, Wed, Thu, Fri
        "avoid_yogas": ["Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra", "Vyatipata", "Parigha", "Vaidhriti"],
        "description": "Marriage ceremonies require highly auspicious times for lifelong harmony."
    },
    EventType.GRIHA_PRAVESH: {
        "good_tithis": [2, 3, 5, 7, 10, 11, 12, 13],
        "good_nakshatras": [3, 4, 6, 7, 8, 11, 12, 13, 20, 21, 22, 25, 26, 27],
        "good_weekdays": [1, 3, 4, 5],
        "avoid_yogas": ["Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra", "Vyatipata"],
        "avoid_lunar_months": ["Ashwin", "Pausha"],
        "description": "House warming requires prosperity-bringing planetary alignments."
    },
    EventType.BUSINESS_OPENING: {
        "good_tithis": [2, 3, 5, 6, 7, 10, 11, 12, 13],
        "good_nakshatras": [3, 4, 7, 8, 11, 12, 13, 16, 17, 20, 21, 22, 25, 27],
        "good_weekdays": [1, 3, 4, 5],
        "avoid_yogas": ["Vishkambha", "Atiganda", "Shula", "Ganda"],
        "description": "Business ventures need wealth-attracting muhurat."
    },
    EventType.TRAVEL: {
        "good_tithis": [2, 3, 5, 6, 7, 10, 11, 12, 13],
        "good_nakshatras": [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 17, 20, 21, 22, 25, 26, 27],
        "good_weekdays": [0, 1, 3, 4, 5],  # All except Tue, Sat
        "avoid_yogas": ["Vishkambha", "Shula", "Vyaghata", "Vajra"],
        "description": "Travel muhurat ensures safe and successful journeys."
    },
    EventType.VEHICLE_PURCHASE: {
        "good_tithis": [2, 3, 5, 6, 7, 10, 11, 12, 13],
        "good_nakshatras": [1, 3, 4, 5, 7, 8, 11, 12, 13, 17, 20, 21, 22],
        "good_weekdays": [1, 3, 4, 5],
        "avoid_yogas": ["Vishkambha", "Atiganda", "Shula", "Vyaghata"],
        "description": "Vehicle purchase requires stability and safety-enhancing times."
    },
    EventType.NAMING_CEREMONY: {
        "good_tithis": [2, 3, 5, 6, 7, 10, 11, 12, 13],
        "good_nakshatras": [1, 2, 3, 4, 5, 7, 8, 11, 12, 13, 17, 20, 21, 22, 25, 26, 27],
        "good_weekdays": [1, 3, 4, 5],
        "avoid_yogas": ["Vishkambha", "Atiganda", "Shula"],
        "description": "Naming ceremony muhurat blesses the child with a fortunate name."
    },
    EventType.SURGERY: {
        "good_tithis": [1, 2, 3, 6, 7, 10, 11, 12],
        "good_nakshatras": [1, 4, 5, 7, 8, 11, 12, 13, 17, 20, 21, 22],
        "good_weekdays": [1, 3, 4, 5],  # Avoid Tue (Mars), Sat (Saturn)
        "avoid_yogas": ["Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra"],
        "description": "Medical procedures need healing-supportive planetary positions."
    },
    EventType.EDUCATION_START: {
        "good_tithis": [2, 3, 5, 6, 7, 10, 11, 12, 13],
        "good_nakshatras": [1, 4, 5, 7, 8, 9, 11, 12, 13, 14, 17, 20, 21, 22, 25, 27],
        "good_weekdays": [1, 3, 4, 5],
        "avoid_yogas": ["Vishkambha", "Shula", "Ganda"],
        "description": "Education muhurat enhances learning and intellectual growth."
    },
    EventType.GENERAL_AUSPICIOUS: {
        "good_tithis": [2, 3, 5, 6, 7, 10, 11, 12, 13],
        "good_nakshatras": [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 17, 20, 21, 22, 25, 26, 27],
        "good_weekdays": [0, 1, 3, 4, 5],
        "avoid_yogas": ["Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata"],
        "description": "General auspicious time for important activities."
    },
}


class MuhuratService:
    """Service for finding auspicious times (Muhurat)."""
    
    def __init__(self, ayanamsa: str = "lahiri"):
        """Initialize with panchang service."""
        self.panchang_service = get_panchang_service(ayanamsa)
    
    def find_muhurat(
        self,
        event_type: EventType,
        start_date: datetime,
        end_date: datetime,
        latitude: float,
        longitude: float,
        timezone_name: str = "UTC",
        location_name: Optional[str] = None,
        avoid_rahu_kalam: bool = True,
        avoid_yamagandam: bool = True,
        exclude_nakshatras: Optional[List[int]] = None,
        exclude_tithis: Optional[List[int]] = None,
        max_results: int = 20
    ) -> MuhuratSearchResult:
        """
        Find auspicious muhurat windows for an event.
        
        Args:
            event_type: Type of event
            start_date: Start of search range
            end_date: End of search range
            latitude: Location latitude
            longitude: Location longitude
            timezone_name: Timezone name
            location_name: Human-readable location name
            avoid_rahu_kalam: Skip windows during Rahu Kalam
            avoid_yamagandam: Skip windows during Yamagandam
            exclude_nakshatras: Additional nakshatras to exclude
            exclude_tithis: Additional tithis to exclude
            max_results: Maximum windows to return
        
        Returns:
            MuhuratSearchResult with ranked windows
        """
        windows: List[MuhuratWindow] = []
        rules = EVENT_RULES.get(event_type, EVENT_RULES[EventType.GENERAL_AUSPICIOUS])
        
        current_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        while current_date <= end_date and len(windows) < max_results * 3:
            # Get panchang for this day
            try:
                panchang = self.panchang_service.calculate_panchang(
                    current_date, latitude, longitude, timezone_name, location_name
                )
            except Exception:
                current_date += timedelta(days=1)
                continue
            
            # Evaluate this day
            day_windows = self._evaluate_day(
                panchang=panchang,
                event_type=event_type,
                rules=rules,
                avoid_rahu_kalam=avoid_rahu_kalam,
                avoid_yamagandam=avoid_yamagandam,
                exclude_nakshatras=exclude_nakshatras or [],
                exclude_tithis=exclude_tithis or []
            )
            
            windows.extend(day_windows)
            current_date += timedelta(days=1)
        
        # Sort by score (descending) and take top results
        windows.sort(key=lambda w: w.score, reverse=True)
        windows = windows[:max_results]
        
        # Find best window
        best_window = windows[0] if windows else None
        
        return MuhuratSearchResult(
            event_type=event_type,
            search_start=start_date,
            search_end=end_date,
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            windows=windows,
            total_found=len(windows),
            best_window=best_window,
            filters_applied={
                "avoid_rahu_kalam": avoid_rahu_kalam,
                "avoid_yamagandam": avoid_yamagandam,
                "custom_nakshatra_exclusions": len(exclude_nakshatras or []) > 0,
                "custom_tithi_exclusions": len(exclude_tithis or []) > 0
            }
        )
    
    def _evaluate_day(
        self,
        panchang: Panchang,
        event_type: EventType,
        rules: Dict,
        avoid_rahu_kalam: bool,
        avoid_yamagandam: bool,
        exclude_nakshatras: List[int],
        exclude_tithis: List[int]
    ) -> List[MuhuratWindow]:
        """Evaluate a single day for muhurat windows."""
        windows = []
        
        # Get Python weekday (Mon=0) and convert to Vedic (Sun=0)
        vedic_weekday = (panchang.date.weekday() + 1) % 7
        
        # Check basic eligibility
        tithi_num = panchang.tithi.number
        nakshatra_num = panchang.nakshatra.number
        
        # Check exclusions
        if tithi_num in exclude_tithis:
            return []
        if nakshatra_num in exclude_nakshatras:
            return []
        
        # Score calculation
        score = 50.0  # Base score
        positive_factors = []
        negative_factors = []
        warnings = []
        
        # Check tithi
        good_tithis = rules.get("good_tithis", [])
        if tithi_num in good_tithis:
            score += 10
            positive_factors.append(f"Auspicious tithi: {panchang.tithi.name}")
        else:
            score -= 10
            negative_factors.append(f"Tithi {panchang.tithi.name} not ideal for this event")
        
        # Check nakshatra
        good_nakshatras = rules.get("good_nakshatras", [])
        if nakshatra_num in good_nakshatras:
            score += 15
            positive_factors.append(f"Auspicious nakshatra: {panchang.nakshatra.name}")
        else:
            score -= 10
            negative_factors.append(f"Nakshatra {panchang.nakshatra.name} not ideal")
        
        # Check weekday
        good_weekdays = rules.get("good_weekdays", [])
        if vedic_weekday in good_weekdays:
            score += 10
            positive_factors.append(f"Favorable weekday: {panchang.vaara}")
        else:
            score -= 5
            negative_factors.append(f"{panchang.vaara} not ideal for this event")
        
        # Check yoga
        avoid_yogas = rules.get("avoid_yogas", [])
        if panchang.yoga.name in avoid_yogas:
            score -= 15
            negative_factors.append(f"Inauspicious yoga: {panchang.yoga.name}")
        elif panchang.yoga.nature == "Auspicious":
            score += 10
            positive_factors.append(f"Auspicious yoga: {panchang.yoga.name}")
        
        # Check lunar month if applicable
        avoid_months = rules.get("avoid_lunar_months", [])
        if panchang.masa in avoid_months:
            score -= 10
            warnings.append(f"Lunar month {panchang.masa} generally avoided for this event")
        
        # Determine time windows
        # Main window: Sunrise to Sunset (excluding inauspicious periods)
        
        day_start = panchang.sun_timing.sunrise
        day_end = panchang.sun_timing.sunset
        
        # Create time blocks avoiding inauspicious periods
        blocked_periods = []
        
        if avoid_rahu_kalam:
            blocked_periods.append((
                panchang.rahu_kalam.start,
                panchang.rahu_kalam.end,
                "Rahu Kalam"
            ))
        
        if avoid_yamagandam:
            blocked_periods.append((
                panchang.yamagandam.start,
                panchang.yamagandam.end,
                "Yamagandam"
            ))
        
        # Also avoid Gulika Kalam
        blocked_periods.append((
            panchang.gulika_kalam.start,
            panchang.gulika_kalam.end,
            "Gulika Kalam"
        ))
        
        # Sort blocked periods
        blocked_periods.sort(key=lambda x: x[0])
        
        # Find clear windows
        clear_windows = self._find_clear_windows(day_start, day_end, blocked_periods)
        
        # Create muhurat windows for clear periods
        for window_start, window_end in clear_windows:
            # Only consider windows of at least 30 minutes
            if (window_end - window_start).total_seconds() < 1800:
                continue
            
            # Adjust score based on window duration
            duration_hours = (window_end - window_start).total_seconds() / 3600
            window_score = score + (duration_hours * 2)  # Longer is slightly better
            
            # Determine quality
            if window_score >= 80:
                quality = MuhuratQuality.EXCELLENT
            elif window_score >= 60:
                quality = MuhuratQuality.GOOD
            elif window_score >= 40:
                quality = MuhuratQuality.MODERATE
            else:
                quality = MuhuratQuality.POOR
            
            # Only include moderate or better
            if quality in [MuhuratQuality.POOR]:
                continue
            
            windows.append(MuhuratWindow(
                start_time=window_start,
                end_time=window_end,
                quality=quality,
                score=min(100, max(0, window_score)),
                event_type=event_type,
                tithi=panchang.tithi.name,
                nakshatra=panchang.nakshatra.name,
                yoga=panchang.yoga.name,
                karana=panchang.karana.name,
                weekday=panchang.vaara,
                positive_factors=positive_factors.copy(),
                negative_factors=negative_factors.copy(),
                warnings=warnings.copy()
            ))
        
        return windows
    
    def _find_clear_windows(
        self,
        day_start: datetime,
        day_end: datetime,
        blocked_periods: List[Tuple[datetime, datetime, str]]
    ) -> List[Tuple[datetime, datetime]]:
        """Find time windows that don't overlap with blocked periods."""
        if not blocked_periods:
            return [(day_start, day_end)]
        
        clear_windows = []
        current_start = day_start
        
        for block_start, block_end, _ in blocked_periods:
            # If there's a gap before this blocked period
            if current_start < block_start:
                clear_windows.append((current_start, block_start))
            
            # Move current start to after this blocked period
            current_start = max(current_start, block_end)
        
        # Add remaining time after last blocked period
        if current_start < day_end:
            clear_windows.append((current_start, day_end))
        
        return clear_windows
    
    def get_choghadiya(
        self,
        date: datetime,
        latitude: float,
        longitude: float,
        timezone_name: str = "UTC"
    ) -> Dict:
        """
        Calculate Choghadiya (auspicious time periods) for a day.
        Used primarily in Gujarat and North India.
        
        Each day is divided into 8 parts (4 day, 4 night).
        """
        panchang = self.panchang_service.calculate_panchang(
            date, latitude, longitude, timezone_name
        )
        
        # Choghadiya sequence (rotating based on weekday)
        # Day sequence starts with weekday lord
        DAY_SEQUENCE = ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"]
        NIGHT_SEQUENCE = ["Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh"]
        
        # Choghadiya nature
        CHOGHADIYA_NATURE = {
            "Amrit": ("Excellent", "Best for all auspicious work"),
            "Shubh": ("Good", "Auspicious for good deeds"),
            "Labh": ("Good", "Beneficial for gains and profits"),
            "Chal": ("Average", "Suitable for travel"),
            "Rog": ("Inauspicious", "Avoid important activities"),
            "Kaal": ("Inauspicious", "Avoid new beginnings"),
            "Udveg": ("Inauspicious", "Avoid starting new work"),
        }
        
        # Get weekday (0=Sunday for this calculation)
        vedic_weekday = (date.weekday() + 1) % 7
        
        # Calculate day choghadiyas
        day_duration = panchang.sun_timing.day_duration
        day_segment = day_duration / 8
        
        day_choghadiyas = []
        current_time = panchang.sun_timing.sunrise
        
        for i in range(8):
            chog_name = DAY_SEQUENCE[(vedic_weekday + i) % 8]
            nature, desc = CHOGHADIYA_NATURE[chog_name]
            
            day_choghadiyas.append({
                "name": chog_name,
                "nature": nature,
                "description": desc,
                "start": current_time,
                "end": current_time + day_segment
            })
            current_time += day_segment
        
        # Calculate night choghadiyas (sunset to next sunrise)
        # Approximate: use 12 hours for night
        night_duration = timedelta(hours=12)
        night_segment = night_duration / 8
        
        night_choghadiyas = []
        current_time = panchang.sun_timing.sunset
        
        for i in range(8):
            chog_name = NIGHT_SEQUENCE[(vedic_weekday + i) % 8]
            nature, desc = CHOGHADIYA_NATURE[chog_name]
            
            night_choghadiyas.append({
                "name": chog_name,
                "nature": nature,
                "description": desc,
                "start": current_time,
                "end": current_time + night_segment
            })
            current_time += night_segment
        
        return {
            "date": date,
            "location": {"latitude": latitude, "longitude": longitude},
            "day_choghadiyas": day_choghadiyas,
            "night_choghadiyas": night_choghadiyas,
            "sunrise": panchang.sun_timing.sunrise,
            "sunset": panchang.sun_timing.sunset
        }
    
    def get_hora(
        self,
        date: datetime,
        latitude: float,
        longitude: float,
        timezone_name: str = "UTC"
    ) -> Dict:
        """
        Calculate Hora (planetary hours) for a day.
        Each hour is ruled by a planet.
        """
        panchang = self.panchang_service.calculate_panchang(
            date, latitude, longitude, timezone_name
        )
        
        # Hora lords in order
        HORA_LORDS = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"]
        
        # Weekday starting lord (day starts with that planet's hora)
        WEEKDAY_LORDS = {
            0: "Sun",      # Sunday
            1: "Moon",     # Monday
            2: "Mars",     # Tuesday
            3: "Mercury",  # Wednesday
            4: "Jupiter",  # Thursday
            5: "Venus",    # Friday
            6: "Saturn"    # Saturday
        }
        
        # Hora suitability
        HORA_SUITABILITY = {
            "Sun": "Government work, authority, health matters",
            "Moon": "Travel, public dealings, water-related activities",
            "Mars": "Surgery, conflict resolution, property matters",
            "Mercury": "Business, communication, education, writing",
            "Jupiter": "Religious activities, teaching, legal matters",
            "Venus": "Marriage, arts, entertainment, luxury purchases",
            "Saturn": "Agriculture, construction, mining, charity"
        }
        
        vedic_weekday = (date.weekday() + 1) % 7
        starting_lord = WEEKDAY_LORDS[vedic_weekday]
        start_index = HORA_LORDS.index(starting_lord)
        
        # Day horas
        day_duration = panchang.sun_timing.day_duration
        day_hora_duration = day_duration / 12
        
        day_horas = []
        current_time = panchang.sun_timing.sunrise
        
        for i in range(12):
            lord = HORA_LORDS[(start_index + i) % 7]
            day_horas.append({
                "number": i + 1,
                "lord": lord,
                "start": current_time,
                "end": current_time + day_hora_duration,
                "suitability": HORA_SUITABILITY[lord]
            })
            current_time += day_hora_duration
        
        # Night horas
        night_duration = timedelta(hours=12)  # Approximate
        night_hora_duration = night_duration / 12
        
        night_horas = []
        current_time = panchang.sun_timing.sunset
        
        for i in range(12):
            lord = HORA_LORDS[(start_index + 12 + i) % 7]
            night_horas.append({
                "number": i + 1,
                "lord": lord,
                "start": current_time,
                "end": current_time + night_hora_duration,
                "suitability": HORA_SUITABILITY[lord]
            })
            current_time += night_hora_duration
        
        return {
            "date": date,
            "weekday_lord": starting_lord,
            "day_horas": day_horas,
            "night_horas": night_horas,
            "sunrise": panchang.sun_timing.sunrise,
            "sunset": panchang.sun_timing.sunset
        }


# Singleton instance
_muhurat_service: Optional[MuhuratService] = None


def get_muhurat_service(ayanamsa: str = "lahiri") -> MuhuratService:
    """Get muhurat service instance."""
    global _muhurat_service
    if _muhurat_service is None:
        _muhurat_service = MuhuratService(ayanamsa)
    return _muhurat_service
