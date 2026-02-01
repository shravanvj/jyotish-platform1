"""
Jyotish Platform - Panchang Router
"""
from datetime import date, datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from src.core.cache import get_cache_service, CacheKeys
from src.services.panchang import PanchangService
from src.schemas import (
    PanchangRequest,
    PanchangResponse,
    TithiResponse,
    NakshatraResponse,
    YogaResponse,
    KaranaResponse,
    InauspiciousPeriodResponse,
    ErrorResponse,
)

router = APIRouter()


def _convert_panchang_to_response(panchang) -> PanchangResponse:
    """Convert Panchang dataclass to response schema."""
    return PanchangResponse(
        date=panchang.date,
        vaara=panchang.vaara,
        tithi=TithiResponse(
            index=panchang.tithi.index,
            name=panchang.tithi.name,
            paksha=panchang.tithi.paksha,
            start_time=panchang.tithi.start_time,
            end_time=panchang.tithi.end_time,
        ),
        nakshatra=NakshatraResponse(
            index=panchang.nakshatra.index,
            name=panchang.nakshatra.name,
            pada=panchang.nakshatra.pada,
            lord=panchang.nakshatra.lord,
            start_time=panchang.nakshatra.start_time,
            end_time=panchang.nakshatra.end_time,
        ),
        yoga=YogaResponse(
            index=panchang.yoga.index,
            name=panchang.yoga.name,
            meaning=panchang.yoga.meaning,
        ),
        karana=KaranaResponse(
            index=panchang.karana.index,
            name=panchang.karana.name,
        ),
        sunrise=panchang.sunrise,
        sunset=panchang.sunset,
        moonrise=panchang.moonrise,
        moonset=panchang.moonset,
        rahu_kalam=InauspiciousPeriodResponse(
            name="Rahu Kalam",
            start_time=panchang.rahu_kalam[0],
            end_time=panchang.rahu_kalam[1],
        ),
        yamagandam=InauspiciousPeriodResponse(
            name="Yamagandam",
            start_time=panchang.yamagandam[0],
            end_time=panchang.yamagandam[1],
        ),
        gulika_kalam=InauspiciousPeriodResponse(
            name="Gulika Kalam",
            start_time=panchang.gulika_kalam[0],
            end_time=panchang.gulika_kalam[1],
        ),
        masa=panchang.masa,
        samvatsara=panchang.samvatsara,
    )


@router.get(
    "/today",
    response_model=PanchangResponse,
    summary="Get Today's Panchang",
    description="""
    Get panchang for today at a specified location.
    
    Returns the five elements (panchangam):
    - Tithi (lunar day)
    - Nakshatra (lunar mansion)
    - Yoga (Sun-Moon combination)
    - Karana (half of tithi)
    - Vaara (weekday)
    
    Plus sunrise/sunset times and inauspicious periods (Rahu Kalam, etc.)
    """,
    responses={400: {"model": ErrorResponse}},
)
async def get_today_panchang(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    timezone_offset: float = Query(..., ge=-12, le=14, description="UTC offset in hours"),
):
    """Get panchang for today."""
    try:
        cache = get_cache_service()
        today = date.today()
        cache_key = CacheKeys.PANCHANG.format(
            lat=round(latitude, 2),
            lon=round(longitude, 2),
            date=today.isoformat(),
            tz=timezone_offset,
        )
        
        cached = await cache.get(cache_key)
        if cached:
            return PanchangResponse(**cached)
        
        service = PanchangService()
        panchang = service.calculate_panchang(
            date=today,
            latitude=latitude,
            longitude=longitude,
            timezone_offset=timezone_offset,
        )
        
        response = _convert_panchang_to_response(panchang)
        
        # Cache until midnight (roughly)
        seconds_until_midnight = (24 - datetime.now().hour) * 3600
        await cache.set(cache_key, response.model_dump(mode='json'), ttl=seconds_until_midnight)
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Panchang calculation error: {str(e)}",
        )


@router.get(
    "/date/{panchang_date}",
    response_model=PanchangResponse,
    summary="Get Panchang for Date",
    description="Get panchang for a specific date at a location.",
    responses={400: {"model": ErrorResponse}},
)
async def get_panchang_for_date(
    panchang_date: date,
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    timezone_offset: float = Query(..., ge=-12, le=14),
):
    """Get panchang for a specific date."""
    try:
        cache = get_cache_service()
        cache_key = CacheKeys.PANCHANG.format(
            lat=round(latitude, 2),
            lon=round(longitude, 2),
            date=panchang_date.isoformat(),
            tz=timezone_offset,
        )
        
        cached = await cache.get(cache_key)
        if cached:
            return PanchangResponse(**cached)
        
        service = PanchangService()
        panchang = service.calculate_panchang(
            date=panchang_date,
            latitude=latitude,
            longitude=longitude,
            timezone_offset=timezone_offset,
        )
        
        response = _convert_panchang_to_response(panchang)
        await cache.set(cache_key, response.model_dump(mode='json'), ttl=86400 * 30)  # 30 days
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Panchang calculation error: {str(e)}",
        )


@router.get(
    "/month/{year}/{month}",
    summary="Get Monthly Panchang",
    description="Get panchang for all days in a month.",
    responses={400: {"model": ErrorResponse}},
)
async def get_monthly_panchang(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    timezone_offset: float = Query(..., ge=-12, le=14),
):
    """Get panchang for an entire month."""
    try:
        service = PanchangService()
        monthly_data = service.get_monthly_panchang(
            year=year,
            month=month,
            latitude=latitude,
            longitude=longitude,
            timezone_offset=timezone_offset,
        )
        
        return {
            "year": year,
            "month": month,
            "days": [
                _convert_panchang_to_response(p).model_dump(mode='json')
                for p in monthly_data
            ],
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Monthly panchang calculation error: {str(e)}",
        )


@router.get(
    "/inauspicious",
    summary="Get Inauspicious Periods",
    description="""
    Get inauspicious time periods for a date.
    
    Includes:
    - Rahu Kalam
    - Yamagandam
    - Gulika Kalam
    
    These periods are calculated based on sunrise time and weekday.
    """,
    responses={400: {"model": ErrorResponse}},
)
async def get_inauspicious_periods(
    panchang_date: date = Query(default=None),
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    timezone_offset: float = Query(..., ge=-12, le=14),
):
    """Get inauspicious periods for a date."""
    try:
        target_date = panchang_date or date.today()
        
        service = PanchangService()
        panchang = service.calculate_panchang(
            date=target_date,
            latitude=latitude,
            longitude=longitude,
            timezone_offset=timezone_offset,
        )
        
        return {
            "date": target_date,
            "sunrise": panchang.sunrise,
            "sunset": panchang.sunset,
            "rahu_kalam": {
                "start": panchang.rahu_kalam[0],
                "end": panchang.rahu_kalam[1],
                "description": "Inauspicious for starting new ventures",
            },
            "yamagandam": {
                "start": panchang.yamagandam[0],
                "end": panchang.yamagandam[1],
                "description": "Inauspicious, associated with Yama (death)",
            },
            "gulika_kalam": {
                "start": panchang.gulika_kalam[0],
                "end": panchang.gulika_kalam[1],
                "description": "Inauspicious, ruled by Saturn's son Gulika",
            },
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Calculation error: {str(e)}",
        )


@router.get(
    "/tithis",
    summary="List Tithis",
    description="Get list of all 30 tithis with their characteristics.",
)
async def list_tithis():
    """List all tithis."""
    from src.services.panchang import TITHI_NAMES
    
    tithis = []
    for i, name in enumerate(TITHI_NAMES, 1):
        paksha = "Shukla" if i <= 15 else "Krishna"
        tithi_in_paksha = i if i <= 15 else i - 15
        tithis.append({
            "index": i,
            "name": name,
            "paksha": paksha,
            "tithi_in_paksha": tithi_in_paksha,
        })
    
    return {"tithis": tithis}


@router.get(
    "/yogas",
    summary="List Yogas",
    description="Get list of all 27 yogas with meanings.",
)
async def list_yogas():
    """List all yogas."""
    from src.services.panchang import YOGA_NAMES, YOGA_MEANINGS
    
    yogas = []
    for i, (name, meaning) in enumerate(zip(YOGA_NAMES, YOGA_MEANINGS), 1):
        yogas.append({
            "index": i,
            "name": name,
            "meaning": meaning,
        })
    
    return {"yogas": yogas}


@router.get(
    "/karanas",
    summary="List Karanas",
    description="Get list of all karanas.",
)
async def list_karanas():
    """List all karanas."""
    from src.services.panchang import KARANA_NAMES
    
    karanas = []
    for i, name in enumerate(KARANA_NAMES, 1):
        karanas.append({
            "index": i,
            "name": name,
        })
    
    return {"karanas": karanas}
