"""
Jyotish Platform - Horoscope Router
Daily, weekly, monthly, and yearly horoscopes based on Moon sign (Rashi)
"""
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel, Field
from enum import Enum

from src.core.config import RASHI_DATA


router = APIRouter()


class HoroscopeType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class AspectType(str, Enum):
    """Life aspects for detailed horoscope."""
    GENERAL = "general"
    LOVE = "love"
    CAREER = "career"
    FINANCE = "finance"
    HEALTH = "health"
    FAMILY = "family"


# Response Models
class RashiInfo(BaseModel):
    """Information about a Rashi (Moon sign)."""
    number: int
    name: str
    name_sanskrit: str
    symbol: str
    element: str
    ruling_planet: str
    qualities: List[str]


class AspectPrediction(BaseModel):
    """Prediction for a specific life aspect."""
    aspect: str
    rating: int = Field(..., ge=1, le=5, description="1-5 star rating")
    summary: str
    details: str
    advice: str


class DailyHoroscope(BaseModel):
    """Daily horoscope response."""
    rashi: RashiInfo
    date: date
    
    overall_rating: int = Field(..., ge=1, le=5)
    lucky_number: int
    lucky_color: str
    lucky_time: str
    
    general: str
    love: str
    career: str
    health: str
    finance: str
    
    do_today: List[str]
    avoid_today: List[str]


class WeeklyHoroscope(BaseModel):
    """Weekly horoscope response."""
    rashi: RashiInfo
    week_start: date
    week_end: date
    
    overall_rating: int
    theme_of_week: str
    
    general_overview: str
    love_relationships: str
    career_finance: str
    health_wellness: str
    
    best_days: List[date]
    challenging_days: List[date]
    
    weekly_advice: str


class MonthlyHoroscope(BaseModel):
    """Monthly horoscope response."""
    rashi: RashiInfo
    month: int
    year: int
    month_name: str
    
    overall_rating: int
    theme_of_month: str
    
    general_overview: str
    love_relationships: str
    career_profession: str
    finance_wealth: str
    health_wellness: str
    family_home: str
    
    planetary_influences: List[str]
    important_dates: List[dict]
    monthly_advice: str


class YearlyHoroscope(BaseModel):
    """Yearly horoscope response."""
    rashi: RashiInfo
    year: int
    
    overall_rating: int
    year_theme: str
    
    overview: str
    
    # Quarter predictions
    q1_jan_mar: str
    q2_apr_jun: str
    q3_jul_sep: str
    q4_oct_dec: str
    
    # Aspects
    love_relationships: str
    career_profession: str
    finance_investments: str
    health_wellness: str
    family_home: str
    education_learning: str
    travel_adventure: str
    spiritual_growth: str
    
    key_planetary_transits: List[dict]
    best_months: List[str]
    challenging_months: List[str]
    
    yearly_advice: str


# Helper functions
def get_rashi_info(rashi_number: int) -> RashiInfo:
    """Get Rashi information by number (1-12)."""
    if not 1 <= rashi_number <= 12:
        raise HTTPException(status_code=400, detail="Invalid rashi number. Must be 1-12")
    
    rashi = RASHI_DATA[rashi_number - 1]
    
    qualities = []
    if rashi["element"] == "Fire":
        qualities = ["Dynamic", "Passionate", "Energetic", "Courageous"]
    elif rashi["element"] == "Earth":
        qualities = ["Practical", "Grounded", "Patient", "Reliable"]
    elif rashi["element"] == "Air":
        qualities = ["Intellectual", "Communicative", "Social", "Adaptable"]
    elif rashi["element"] == "Water":
        qualities = ["Emotional", "Intuitive", "Nurturing", "Sensitive"]
    
    return RashiInfo(
        number=rashi_number,
        name=rashi["name"],
        name_sanskrit=rashi["name"],  # Would have Sanskrit names in full implementation
        symbol=rashi["symbol"],
        element=rashi["element"],
        ruling_planet=rashi["ruler"],
        qualities=qualities
    )


def get_rashi_by_name(name: str) -> int:
    """Get Rashi number by name."""
    name_lower = name.lower()
    for i, rashi in enumerate(RASHI_DATA, 1):
        if rashi["name"].lower() == name_lower:
            return i
    
    # Try alternative names
    alternatives = {
        "mesha": 1, "aries": 1,
        "vrishabha": 2, "taurus": 2,
        "mithuna": 3, "gemini": 3,
        "karka": 4, "cancer": 4,
        "simha": 5, "leo": 5,
        "kanya": 6, "virgo": 6,
        "tula": 7, "libra": 7,
        "vrishchika": 8, "scorpio": 8,
        "dhanu": 9, "sagittarius": 9,
        "makara": 10, "capricorn": 10,
        "kumbha": 11, "aquarius": 11,
        "meena": 12, "pisces": 12,
    }
    
    if name_lower in alternatives:
        return alternatives[name_lower]
    
    raise HTTPException(status_code=400, detail=f"Unknown rashi: {name}")


def generate_daily_horoscope(rashi_number: int, target_date: date) -> DailyHoroscope:
    """
    Generate daily horoscope based on planetary positions and rashi.
    
    In production, this would use actual planetary calculations.
    For now, returns structured placeholder content.
    """
    rashi_info = get_rashi_info(rashi_number)
    
    # These would be calculated from actual planetary positions
    # Using deterministic values based on date for consistency
    day_seed = (target_date.toordinal() + rashi_number) % 100
    
    colors = ["Red", "Blue", "Green", "Yellow", "Orange", "Purple", "White", "Pink", "Gold", "Silver"]
    times = ["Morning 6-9 AM", "Late Morning 9-12 PM", "Afternoon 12-3 PM", 
             "Evening 3-6 PM", "Night 6-9 PM", "Late Night 9-12 AM"]
    
    return DailyHoroscope(
        rashi=rashi_info,
        date=target_date,
        overall_rating=((day_seed % 5) + 1),
        lucky_number=((day_seed % 9) + 1),
        lucky_color=colors[day_seed % len(colors)],
        lucky_time=times[day_seed % len(times)],
        
        general="Today brings opportunities for personal growth. Focus on your strengths and remain adaptable to changing circumstances. Your natural abilities will help you navigate any challenges.",
        love="Relationships benefit from open communication today. Single natives may encounter meaningful connections. Those in partnerships should express appreciation to their loved ones.",
        career="Professional matters require attention to detail. Collaborative projects show promise. Avoid rushing important decisions; patience will lead to better outcomes.",
        health="Energy levels are favorable. This is a good day for moderate exercise and establishing healthy routines. Pay attention to rest and hydration.",
        finance="Financial stability is indicated. Avoid impulsive purchases and focus on long-term goals. A conservative approach to investments is advised.",
        
        do_today=[
            "Focus on priority tasks",
            "Connect with supportive people",
            "Plan for upcoming opportunities"
        ],
        avoid_today=[
            "Making hasty decisions",
            "Unnecessary arguments",
            "Overcommitting your time"
        ]
    )


# Endpoints
@router.get("/rashis", response_model=List[RashiInfo])
async def list_rashis():
    """
    List all 12 Rashis (Moon signs) with their details.
    """
    return [get_rashi_info(i) for i in range(1, 13)]


@router.get("/daily/{rashi}")
async def get_daily_horoscope(
    rashi: str = Path(..., description="Rashi name or number (1-12)"),
    date: Optional[date] = Query(None, description="Date for horoscope (defaults to today)")
):
    """
    Get daily horoscope for a specific Rashi (Moon sign).
    
    Rashi can be specified by:
    - Number (1-12): 1=Mesha/Aries, 2=Vrishabha/Taurus, etc.
    - Name: Mesha, Vrishabha, Mithuna, etc.
    - Western name: Aries, Taurus, Gemini, etc.
    """
    # Parse rashi
    try:
        rashi_number = int(rashi)
    except ValueError:
        rashi_number = get_rashi_by_name(rashi)
    
    if not 1 <= rashi_number <= 12:
        raise HTTPException(status_code=400, detail="Invalid rashi. Must be 1-12 or valid name")
    
    target_date = date or datetime.now().date()
    
    return generate_daily_horoscope(rashi_number, target_date)


@router.get("/weekly/{rashi}")
async def get_weekly_horoscope(
    rashi: str = Path(..., description="Rashi name or number (1-12)"),
    week_of: Optional[date] = Query(None, description="Any date within the desired week")
):
    """
    Get weekly horoscope for a specific Rashi.
    """
    try:
        rashi_number = int(rashi)
    except ValueError:
        rashi_number = get_rashi_by_name(rashi)
    
    if not 1 <= rashi_number <= 12:
        raise HTTPException(status_code=400, detail="Invalid rashi")
    
    rashi_info = get_rashi_info(rashi_number)
    
    # Calculate week boundaries
    target_date = week_of or datetime.now().date()
    week_start = target_date - timedelta(days=target_date.weekday())  # Monday
    week_end = week_start + timedelta(days=6)  # Sunday
    
    return WeeklyHoroscope(
        rashi=rashi_info,
        week_start=week_start,
        week_end=week_end,
        
        overall_rating=4,
        theme_of_week="Growth and Opportunity",
        
        general_overview="This week emphasizes personal development and strengthening relationships. Mid-week brings favorable energy for new initiatives.",
        love_relationships="Romantic connections benefit from quality time together. Single natives should remain open to meeting new people through social activities.",
        career_finance="Professional matters progress steadily. Focus on completing existing projects before taking on new responsibilities.",
        health_wellness="Maintain balanced routines. Incorporate stress-relief practices and ensure adequate rest.",
        
        best_days=[week_start + timedelta(days=2), week_start + timedelta(days=4)],
        challenging_days=[week_start + timedelta(days=1)],
        
        weekly_advice="Focus on meaningful connections and avoid spreading yourself too thin. Quality over quantity applies to both work and relationships."
    )


@router.get("/monthly/{rashi}")
async def get_monthly_horoscope(
    rashi: str = Path(..., description="Rashi name or number (1-12)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (1-12)"),
    year: Optional[int] = Query(None, description="Year")
):
    """
    Get monthly horoscope for a specific Rashi.
    """
    try:
        rashi_number = int(rashi)
    except ValueError:
        rashi_number = get_rashi_by_name(rashi)
    
    if not 1 <= rashi_number <= 12:
        raise HTTPException(status_code=400, detail="Invalid rashi")
    
    rashi_info = get_rashi_info(rashi_number)
    
    now = datetime.now()
    target_month = month or now.month
    target_year = year or now.year
    
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    
    return MonthlyHoroscope(
        rashi=rashi_info,
        month=target_month,
        year=target_year,
        month_name=month_names[target_month - 1],
        
        overall_rating=4,
        theme_of_month="Transformation and Progress",
        
        general_overview="This month brings significant opportunities for personal and professional growth. The planetary alignments favor new beginnings and strengthening existing foundations.",
        love_relationships="Emotional connections deepen this month. Communication is key to resolving any misunderstandings. Single natives may find meaningful connections.",
        career_profession="Career matters show positive momentum. This is an excellent time for showcasing your skills and seeking advancement opportunities.",
        finance_wealth="Financial prudence is advised. Focus on building savings and avoid speculative investments. Unexpected expenses may arise mid-month.",
        health_wellness="Health requires attention. Incorporate regular exercise and mindful eating. Stress management practices will prove beneficial.",
        family_home="Family relationships strengthen through quality time. Home improvements or relocations are favored in the latter half of the month.",
        
        planetary_influences=[
            "Sun's transit brings vitality and confidence",
            "Mercury enhances communication skills",
            "Venus favors artistic pursuits and relationships"
        ],
        
        important_dates=[
            {"date": f"{target_year}-{target_month:02d}-07", "description": "Favorable for new beginnings"},
            {"date": f"{target_year}-{target_month:02d}-15", "description": "Full Moon - emotional insights"},
            {"date": f"{target_year}-{target_month:02d}-22", "description": "Opportunities in career"}
        ],
        
        monthly_advice="Focus on building sustainable habits rather than seeking quick results. Patience and persistence will lead to lasting success."
    )


@router.get("/yearly/{rashi}")
async def get_yearly_horoscope(
    rashi: str = Path(..., description="Rashi name or number (1-12)"),
    year: Optional[int] = Query(None, description="Year for horoscope")
):
    """
    Get yearly horoscope for a specific Rashi.
    """
    try:
        rashi_number = int(rashi)
    except ValueError:
        rashi_number = get_rashi_by_name(rashi)
    
    if not 1 <= rashi_number <= 12:
        raise HTTPException(status_code=400, detail="Invalid rashi")
    
    rashi_info = get_rashi_info(rashi_number)
    target_year = year or datetime.now().year
    
    return YearlyHoroscope(
        rashi=rashi_info,
        year=target_year,
        
        overall_rating=4,
        year_theme="Year of Growth and Transformation",
        
        overview=f"The year {target_year} brings significant opportunities for {rashi_info.name} natives. Major planetary transits create favorable conditions for personal evolution and achieving long-term goals.",
        
        q1_jan_mar="The year begins with strong energy for new initiatives. January favors planning while February and March are ideal for implementation.",
        q2_apr_jun="Mid-year brings relationship focus and career opportunities. Travel is favored, and new connections prove beneficial.",
        q3_jul_sep="A period of consolidation and refinement. Focus on health and completing ongoing projects. Financial gains are possible through sustained effort.",
        q4_oct_dec="The year concludes with celebration and achievement. Recognition for efforts comes in unexpected ways. Plan for the year ahead.",
        
        love_relationships="Relationships undergo positive transformation. Committed couples deepen their bond, while singles have excellent opportunities for meaningful connections.",
        career_profession="Professional growth is highlighted throughout the year. Leadership opportunities arise, and recognition for past efforts manifests.",
        finance_investments="Financial stability improves through disciplined approach. Mid-year brings unexpected gains. Avoid speculative ventures in the last quarter.",
        health_wellness="Health requires consistent attention. Establish routines early in the year. Preventive care proves more effective than reactive measures.",
        family_home="Family harmony strengthens. Property matters see favorable resolution. Home improvements or relocations are supported.",
        education_learning="Excellent year for acquiring new skills. Higher education pursuits are favored. Teaching opportunities may arise.",
        travel_adventure="Travel brings positive experiences and new perspectives. Both domestic and international journeys are favored.",
        spiritual_growth="Inner development accelerates. Meditation and self-reflection practices yield profound insights.",
        
        key_planetary_transits=[
            {"planet": "Jupiter", "description": f"Jupiter's favorable aspect brings expansion and opportunities"},
            {"planet": "Saturn", "description": "Saturn teaches valuable lessons about discipline and responsibility"},
            {"planet": "Rahu-Ketu", "description": "Nodal axis shifts bring karmic insights and unexpected changes"}
        ],
        
        best_months=["March", "July", "November"],
        challenging_months=["May", "September"],
        
        yearly_advice=f"Embrace change as an opportunity for growth. The year {target_year} rewards those who maintain balance between ambition and contentment."
    )


@router.get("/today")
async def get_all_daily_horoscopes():
    """
    Get today's horoscope for all 12 Rashis.
    Useful for horoscope listing pages.
    """
    today = datetime.now().date()
    
    horoscopes = []
    for i in range(1, 13):
        horoscope = generate_daily_horoscope(i, today)
        horoscopes.append({
            "rashi": horoscope.rashi,
            "overall_rating": horoscope.overall_rating,
            "general": horoscope.general[:200] + "..." if len(horoscope.general) > 200 else horoscope.general,
            "lucky_number": horoscope.lucky_number,
            "lucky_color": horoscope.lucky_color,
        })
    
    return {
        "date": today.isoformat(),
        "horoscopes": horoscopes
    }
