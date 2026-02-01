"""
Jyotish Platform - Matchmaking Router
"""
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status

from src.core.security import get_current_user_optional
from src.services.ephemeris import EphemerisService
from src.services.matchmaking import MatchmakingService
from src.schemas import (
    BirthDataInput,
    MatchmakingRequest,
    MatchmakingResponse,
    PoruthamResponse,
    PoruthamCheckResponse,
    AshtakootaResponse,
    AshtakootaFactorResponse,
    ErrorResponse,
)

router = APIRouter()


def _get_chart_for_matching(data: BirthDataInput):
    """Calculate birth chart for matching."""
    service = EphemerisService(ayanamsa=data.ayanamsa)
    return service.calculate_birth_chart(
        birth_datetime=data.datetime,
        latitude=data.latitude,
        longitude=data.longitude,
        timezone_offset=data.timezone_offset,
    )


def _convert_porutham_to_response(result: dict) -> PoruthamResponse:
    """Convert Porutham result to response schema."""
    checks = []
    for check in result["checks"]:
        checks.append(PoruthamCheckResponse(
            name=check["name"],
            passed=check["passed"],
            is_essential=check.get("is_essential", False),
            description=check.get("description", ""),
            remedy=check.get("remedy"),
        ))
    
    return PoruthamResponse(
        total_matches=result["total_matches"],
        passed_matches=result["passed_matches"],
        essential_failed=result.get("essential_failed", []),
        is_compatible=result["is_compatible"],
        checks=checks,
        recommendation=result.get("recommendation", ""),
    )


def _convert_ashtakoota_to_response(result: dict) -> AshtakootaResponse:
    """Convert Ashtakoota result to response schema."""
    factors = []
    for factor in result["factors"]:
        factors.append(AshtakootaFactorResponse(
            name=factor["name"],
            max_points=factor["max_points"],
            obtained_points=factor["obtained_points"],
            description=factor.get("description", ""),
            dosha=factor.get("dosha"),
        ))
    
    return AshtakootaResponse(
        total_points=result["total_points"],
        max_points=36,
        percentage=round(result["total_points"] / 36 * 100, 1),
        factors=factors,
        doshas=result.get("doshas", []),
        is_compatible=result["is_compatible"],
        recommendation=result.get("recommendation", ""),
    )


@router.post(
    "/compatibility",
    response_model=MatchmakingResponse,
    summary="Calculate Marriage Compatibility",
    description="""
    Calculate marriage compatibility using traditional Vedic methods.
    
    Supports two systems:
    
    **South Indian Porutham (10 Poruthams)**
    - Dinam, Ganam, Mahendra, Stree Deergham, Yoni
    - Rashi, Rasiyathipathi, Vasya, Rajju (Essential), Vedha (Essential)
    - Essential poruthams (Rajju, Vedha) must pass for compatibility
    
    **North Indian Ashtakoota (36 Points)**
    - Varna (1), Vashya (2), Tara (3), Yoni (4)
    - Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8)
    - Minimum 18 points recommended for marriage
    - Checks for Nadi Dosha, Bhakoot Dosha
    
    Both systems are based on the Moon's position (Nakshatra and Rashi).
    """,
    responses={400: {"model": ErrorResponse}},
)
async def calculate_compatibility(
    data: MatchmakingRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Calculate marriage compatibility."""
    try:
        # Calculate charts for both parties
        bride_chart = _get_chart_for_matching(data.bride)
        groom_chart = _get_chart_for_matching(data.groom)
        
        matching_service = MatchmakingService()
        
        porutham_result = None
        ashtakoota_result = None
        
        # Calculate based on requested system
        if data.system in ["porutham", "both"]:
            porutham = matching_service.calculate_porutham(
                bride_nakshatra=bride_chart.moon_nakshatra,
                groom_nakshatra=groom_chart.moon_nakshatra,
                bride_rashi=bride_chart.moon_rashi,
                groom_rashi=groom_chart.moon_rashi,
            )
            porutham_result = _convert_porutham_to_response(porutham)
        
        if data.system in ["ashtakoota", "both"]:
            ashtakoota = matching_service.calculate_ashtakoota(
                bride_nakshatra=bride_chart.moon_nakshatra,
                groom_nakshatra=groom_chart.moon_nakshatra,
                bride_rashi=bride_chart.moon_rashi,
                groom_rashi=groom_chart.moon_rashi,
            )
            ashtakoota_result = _convert_ashtakoota_to_response(ashtakoota)
        
        # Determine overall compatibility
        overall = "Compatible"
        if porutham_result and not porutham_result.is_compatible:
            overall = "Not Compatible (Essential Porutham Failed)"
        elif ashtakoota_result and ashtakoota_result.total_points < 18:
            overall = "Marginal Compatibility (Low Ashtakoota Score)"
        elif ashtakoota_result and ashtakoota_result.doshas:
            overall = "Compatible with Doshas"
        
        # Generate summary
        summary_parts = []
        if porutham_result:
            summary_parts.append(
                f"Porutham: {porutham_result.passed_matches}/10 matches"
            )
        if ashtakoota_result:
            summary_parts.append(
                f"Ashtakoota: {ashtakoota_result.total_points}/36 points ({ashtakoota_result.percentage}%)"
            )
        
        return MatchmakingResponse(
            porutham=porutham_result,
            ashtakoota=ashtakoota_result,
            overall_compatibility=overall,
            summary=" | ".join(summary_parts),
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Compatibility calculation error: {str(e)}",
        )


@router.post(
    "/porutham",
    response_model=PoruthamResponse,
    summary="Calculate South Indian Porutham",
    description="""
    Calculate 10 Poruthams (South Indian compatibility system).
    
    The 10 Poruthams are:
    1. **Dinam** - Checks compatibility of birth stars
    2. **Ganam** - Temperament compatibility (Deva, Manushya, Rakshasa)
    3. **Mahendra** - Prosperity and health of children
    4. **Stree Deergham** - Longevity of wife and harmony
    5. **Yoni** - Sexual compatibility and attraction
    6. **Rashi** - Mental compatibility
    7. **Rasiyathipathi** - Planetary friendship
    8. **Vasya** - Mutual attraction and control
    9. **Rajju** (Essential) - Longevity of husband
    10. **Vedha** (Essential) - Obstacles and afflictions
    
    Minimum 5-6 matches with both essential poruthams passing is recommended.
    """,
    responses={400: {"model": ErrorResponse}},
)
async def calculate_porutham(
    data: MatchmakingRequest,
):
    """Calculate Porutham only."""
    data.system = "porutham"
    response = await calculate_compatibility(data)
    return response.porutham


@router.post(
    "/ashtakoota",
    response_model=AshtakootaResponse,
    summary="Calculate North Indian Ashtakoota",
    description="""
    Calculate Ashtakoota Gun Milan (North Indian 36-point system).
    
    The 8 factors (Koota) and their maximum points:
    1. **Varna** (1 point) - Spiritual/ego compatibility
    2. **Vashya** (2 points) - Mutual attraction and dominance
    3. **Tara** (3 points) - Birth star compatibility
    4. **Yoni** (4 points) - Sexual compatibility
    5. **Graha Maitri** (5 points) - Planetary friendship
    6. **Gana** (6 points) - Temperament compatibility
    7. **Bhakoot** (7 points) - Emotional compatibility
    8. **Nadi** (8 points) - Health and genes compatibility
    
    **Interpretation:**
    - 0-17 points: Not recommended
    - 18-24 points: Average match
    - 25-32 points: Good match
    - 33-36 points: Excellent match
    
    **Important Doshas:**
    - Nadi Dosha: Same Nadi (health/progeny issues)
    - Bhakoot Dosha: Certain rashi combinations (discord)
    """,
    responses={400: {"model": ErrorResponse}},
)
async def calculate_ashtakoota(
    data: MatchmakingRequest,
):
    """Calculate Ashtakoota only."""
    data.system = "ashtakoota"
    response = await calculate_compatibility(data)
    return response.ashtakoota


@router.get(
    "/nakshatra-compatibility",
    summary="Get Nakshatra Compatibility Table",
    description="Get the traditional nakshatra compatibility lookup table.",
)
async def get_nakshatra_compatibility():
    """Get nakshatra compatibility information."""
    from src.core.config import NAKSHATRAS
    from src.services.matchmaking import (
        NAKSHATRA_GANA,
        NAKSHATRA_YONI,
        NAKSHATRA_NADI,
        NAKSHATRA_RAJJU,
    )
    
    compatibility_data = []
    for nak in NAKSHATRAS:
        name = nak["name"]
        compatibility_data.append({
            "index": nak["index"],
            "name": name,
            "lord": nak["ruler"],
            "gana": NAKSHATRA_GANA.get(name, "Unknown"),
            "yoni": NAKSHATRA_YONI.get(name, "Unknown"),
            "nadi": NAKSHATRA_NADI.get(name, "Unknown"),
            "rajju": NAKSHATRA_RAJJU.get(name, "Unknown"),
        })
    
    return {
        "nakshatras": compatibility_data,
        "gana_types": ["Deva", "Manushya", "Rakshasa"],
        "nadi_types": ["Aadi", "Madhya", "Antya"],
        "rajju_types": ["Paada", "Kati", "Nabhi", "Kantha", "Shiro"],
    }


@router.get(
    "/doshas",
    summary="Get Dosha Information",
    description="Get information about common doshas checked in matchmaking.",
)
async def get_dosha_info():
    """Get dosha information."""
    return {
        "doshas": [
            {
                "name": "Nadi Dosha",
                "description": "Occurs when both partners have the same Nadi (Aadi, Madhya, or Antya). Associated with health issues and problems with progeny.",
                "severity": "High",
                "remedies": [
                    "Nadi Dosha Nivaran Puja",
                    "Mahamrityunjaya Japa",
                    "Certain exception rules can cancel the dosha",
                ],
                "exceptions": [
                    "Same rashi but different nakshatras",
                    "Same nakshatra but different rashis",
                    "Both partners have the same nakshatra",
                ],
            },
            {
                "name": "Bhakoot Dosha",
                "description": "Certain rashi combinations (2-12, 5-9, 6-8) that indicate discord, financial problems, or health issues.",
                "severity": "Medium to High",
                "remedies": [
                    "Bhakoot Dosha Shanti Puja",
                    "Rashi lord propitiation",
                ],
                "combinations": {
                    "2-12": "Financial difficulties",
                    "5-9": "Loss of children/progeny issues",
                    "6-8": "Health problems and discord",
                },
            },
            {
                "name": "Rajju Dosha",
                "description": "Occurs when both partners have nakshatras in the same Rajju category. Associated with widowhood.",
                "severity": "High (Essential Porutham)",
                "rajju_categories": {
                    "Paada (Feet)": "Travel/wandering issues",
                    "Kati (Waist)": "Financial problems",
                    "Nabhi (Navel)": "Loss of children",
                    "Kantha (Neck)": "Loss of wife",
                    "Shiro (Head)": "Death of husband",
                },
            },
            {
                "name": "Vedha Dosha",
                "description": "Certain nakshatra pairs that cause affliction when matched.",
                "severity": "High (Essential Porutham)",
                "affected_pairs": [
                    "Ashwini - Jyeshtha",
                    "Bharani - Anuradha",
                    "Krittika - Vishakha",
                    "Rohini - Swati",
                    "And others...",
                ],
            },
        ],
    }
