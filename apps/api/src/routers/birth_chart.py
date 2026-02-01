"""
Jyotish Platform - Birth Chart (Kundli) Router
"""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.cache import get_cache_service, CacheKeys
from src.core.security import get_current_user_optional
from src.services.ephemeris import EphemerisService, BirthChart
from src.schemas import (
    BirthDataInput,
    BirthChartResponse,
    PlanetPositionResponse,
    HousePositionResponse,
    DivisionalChartResponse,
    DashaResponse,
    DashaPeriodResponse,
    ErrorResponse,
)

router = APIRouter()


def _convert_planet_to_response(planet) -> PlanetPositionResponse:
    """Convert PlanetPosition dataclass to response schema."""
    return PlanetPositionResponse(
        name=planet.name,
        english_name=planet.english_name,
        longitude=round(planet.longitude, 4),
        latitude=round(planet.latitude, 4),
        speed=round(planet.speed, 4),
        is_retrograde=planet.is_retrograde,
        rashi_index=planet.rashi_index,
        rashi_name=planet.rashi_name,
        rashi_english=planet.rashi_english,
        degree_in_rashi=round(planet.degree_in_rashi, 4),
        nakshatra_index=planet.nakshatra_index,
        nakshatra_name=planet.nakshatra_name,
        nakshatra_pada=planet.nakshatra_pada,
        nakshatra_lord=planet.nakshatra_lord,
        symbol=planet.symbol,
    )


def _convert_house_to_response(house) -> HousePositionResponse:
    """Convert HousePosition dataclass to response schema."""
    return HousePositionResponse(
        house_number=house.house_number,
        longitude=round(house.longitude, 4),
        rashi_index=house.rashi_index,
        rashi_name=house.rashi_name,
        degree_in_rashi=round(house.degree_in_rashi, 4),
    )


def _convert_chart_to_response(chart: BirthChart) -> BirthChartResponse:
    """Convert BirthChart dataclass to response schema."""
    return BirthChartResponse(
        datetime_utc=chart.datetime_utc,
        julian_day=round(chart.julian_day, 6),
        latitude=chart.latitude,
        longitude=chart.longitude,
        timezone_offset=chart.timezone_offset,
        ayanamsa=chart.ayanamsa,
        ayanamsa_value=round(chart.ayanamsa_value, 6),
        ascendant=round(chart.ascendant, 4),
        ascendant_rashi=chart.ascendant_rashi,
        ascendant_nakshatra=chart.ascendant_nakshatra,
        planets=[_convert_planet_to_response(p) for p in chart.planets],
        houses=[_convert_house_to_response(h) for h in chart.houses],
        moon_rashi=chart.moon_rashi,
        moon_nakshatra=chart.moon_nakshatra,
        sun_rashi=chart.sun_rashi,
    )


@router.post(
    "/calculate",
    response_model=BirthChartResponse,
    summary="Calculate Birth Chart",
    description="""
    Calculate a complete Vedic birth chart (Kundli/Janam Kundli).
    
    Returns:
    - All 9 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
    - Planet positions with rashi, nakshatra, pada
    - 12 house cusps with rashi positions
    - Ascendant (Lagna) details
    - Retrograde status for each planet
    
    Uses Swiss Ephemeris for accurate astronomical calculations.
    """,
    responses={400: {"model": ErrorResponse}},
)
async def calculate_birth_chart(
    data: BirthDataInput,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Calculate complete birth chart."""
    try:
        # Check cache first
        cache = get_cache_service()
        cache_key = CacheKeys.BIRTH_CHART.format(
            lat=round(data.latitude, 4),
            lon=round(data.longitude, 4),
            dt=data.datetime.isoformat(),
            ayanamsa=data.ayanamsa,
        )
        
        cached = await cache.get(cache_key)
        if cached:
            return BirthChartResponse(**cached)
        
        # Calculate chart
        service = EphemerisService(ayanamsa=data.ayanamsa)
        chart = service.calculate_birth_chart(
            birth_datetime=data.datetime,
            latitude=data.latitude,
            longitude=data.longitude,
            timezone_offset=data.timezone_offset,
        )
        
        # Convert to response
        response = _convert_chart_to_response(chart)
        
        # Cache the result
        await cache.set(cache_key, response.model_dump(mode='json'), ttl=86400)  # 24 hours
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chart calculation error: {str(e)}",
        )


@router.post(
    "/divisional/{chart_type}",
    response_model=DivisionalChartResponse,
    summary="Calculate Divisional Chart",
    description="""
    Calculate a divisional (varga) chart.
    
    Supported chart types:
    - D1: Rashi chart (same as birth chart)
    - D9: Navamsa (spouse, dharma)
    - D10: Dasamsa (career, profession)
    - D7: Saptamsa (children)
    - D12: Dwadasamsa (parents, ancestors)
    """,
    responses={400: {"model": ErrorResponse}},
)
async def calculate_divisional_chart(
    chart_type: str,
    data: BirthDataInput,
):
    """Calculate divisional chart."""
    valid_charts = ["D1", "D9", "D10", "D7", "D12"]
    chart_type = chart_type.upper()
    
    if chart_type not in valid_charts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid chart type. Must be one of: {', '.join(valid_charts)}",
        )
    
    try:
        service = EphemerisService(ayanamsa=data.ayanamsa)
        chart = service.calculate_birth_chart(
            birth_datetime=data.datetime,
            latitude=data.latitude,
            longitude=data.longitude,
            timezone_offset=data.timezone_offset,
        )
        
        # Calculate divisional chart
        divisional = service.calculate_divisional_chart(chart, chart_type)
        
        return DivisionalChartResponse(
            chart_type=chart_type,
            planets=[_convert_planet_to_response(p) for p in divisional],
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Divisional chart calculation error: {str(e)}",
        )


@router.post(
    "/dasha",
    response_model=DashaResponse,
    summary="Calculate Vimshottari Dasha",
    description="""
    Calculate Vimshottari Dasha periods.
    
    Returns:
    - Complete Maha Dasha sequence (120 year cycle)
    - Current Maha Dasha and Antar Dasha
    - Detailed Antar Dasha breakdown for current Maha Dasha
    
    The dasha is calculated based on the Moon's position at birth.
    """,
    responses={400: {"model": ErrorResponse}},
)
async def calculate_dasha(
    data: BirthDataInput,
    levels: int = Query(default=2, ge=1, le=3, description="Dasha levels (1=Maha, 2=+Antar, 3=+Pratyantar)"),
):
    """Calculate Vimshottari Dasha."""
    try:
        service = EphemerisService(ayanamsa=data.ayanamsa)
        chart = service.calculate_birth_chart(
            birth_datetime=data.datetime,
            latitude=data.latitude,
            longitude=data.longitude,
            timezone_offset=data.timezone_offset,
        )
        
        # Calculate dasha
        maha_dashas = service.calculate_vimshottari_dasha(chart)
        
        # Find current maha dasha
        now = datetime.now(timezone.utc)
        current_maha = None
        current_antar = None
        antar_dashas = []
        
        for dasha in maha_dashas:
            if dasha.start_date <= now <= dasha.end_date:
                current_maha = dasha
                # Calculate antar dashas for current maha dasha
                antar_dashas = service.calculate_antar_dasha(dasha)
                for antar in antar_dashas:
                    if antar.start_date <= now <= antar.end_date:
                        current_antar = antar
                        break
                break
        
        def _convert_dasha(d) -> DashaPeriodResponse:
            return DashaPeriodResponse(
                planet=d.planet,
                start_date=d.start_date,
                end_date=d.end_date,
                level=d.level,
                duration_years=round(d.duration_years, 2),
            )
        
        return DashaResponse(
            maha_dasha=[_convert_dasha(d) for d in maha_dashas],
            current_maha_dasha=_convert_dasha(current_maha) if current_maha else None,
            current_antar_dasha=_convert_dasha(current_antar) if current_antar else None,
            antar_dashas=[_convert_dasha(d) for d in antar_dashas],
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dasha calculation error: {str(e)}",
        )


@router.post(
    "/transits",
    summary="Get Current Transits",
    description="""
    Get current planetary transits relative to birth chart.
    
    Returns current positions of all planets and their aspects
    to natal planets.
    """,
    responses={400: {"model": ErrorResponse}},
)
async def get_transits(
    data: BirthDataInput,
    transit_date: Optional[datetime] = Query(default=None, description="Transit date (defaults to now)"),
):
    """Get current planetary transits."""
    try:
        service = EphemerisService(ayanamsa=data.ayanamsa)
        
        # Get natal chart
        natal_chart = service.calculate_birth_chart(
            birth_datetime=data.datetime,
            latitude=data.latitude,
            longitude=data.longitude,
            timezone_offset=data.timezone_offset,
        )
        
        # Get transit positions
        transit_dt = transit_date or datetime.now(timezone.utc)
        transit_positions = service.get_current_transits(transit_dt)
        
        return {
            "natal_chart": _convert_chart_to_response(natal_chart),
            "transit_date": transit_dt,
            "transits": [_convert_planet_to_response(p) for p in transit_positions],
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transit calculation error: {str(e)}",
        )


@router.get(
    "/ayanamsa",
    summary="List Available Ayanamsas",
    description="Get list of supported ayanamsa systems.",
)
async def list_ayanamsas():
    """List available ayanamsa options."""
    from src.core.config import AYANAMSA_OPTIONS
    return {
        "ayanamsas": [
            {
                "key": key,
                "name": value["name"],
                "description": value["description"],
            }
            for key, value in AYANAMSA_OPTIONS.items()
        ],
        "default": "lahiri",
    }


@router.get(
    "/nakshatras",
    summary="List Nakshatras",
    description="Get list of all 27 nakshatras with details.",
)
async def list_nakshatras():
    """List all nakshatras."""
    from src.core.config import NAKSHATRAS
    return {"nakshatras": NAKSHATRAS}


@router.get(
    "/rashis",
    summary="List Rashis",
    description="Get list of all 12 rashis (zodiac signs) with details.",
)
async def list_rashis():
    """List all rashis."""
    from src.core.config import RASHIS
    return {"rashis": RASHIS}
