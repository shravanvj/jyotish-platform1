"""
Jyotish Platform - Panchang Service
Calculates Hindu calendar elements: Tithi, Nakshatra, Yoga, Karana, etc.
"""
import swisseph as swe
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import math

from src.services.ephemeris import EphemerisService, get_ephemeris_service


@dataclass
class TithiInfo:
    """Tithi (lunar day) information."""
    number: int  # 1-30
    name: str
    paksha: str  # Shukla or Krishna
    end_time: Optional[datetime]
    percent_elapsed: float


@dataclass
class NakshatraInfo:
    """Nakshatra information for panchang."""
    number: int  # 1-27
    name: str
    ruler: str
    end_time: Optional[datetime]
    pada: int  # 1-4


@dataclass
class YogaInfo:
    """Yoga information (Sun + Moon longitudes)."""
    number: int  # 1-27
    name: str
    nature: str  # Auspicious/Inauspicious
    end_time: Optional[datetime]


@dataclass
class KaranaInfo:
    """Karana information (half tithi)."""
    number: int  # 1-11 (11 unique karanas)
    name: str
    nature: str
    end_time: Optional[datetime]


@dataclass
class SunTiming:
    """Sun-related timings."""
    sunrise: datetime
    sunset: datetime
    noon: datetime
    day_duration: timedelta


@dataclass
class MoonTiming:
    """Moon-related timings."""
    moonrise: Optional[datetime]
    moonset: Optional[datetime]


@dataclass
class InauspiciousPeriod:
    """Inauspicious time period (Rahu Kalam, etc.)."""
    name: str
    start: datetime
    end: datetime
    duration: timedelta


@dataclass
class Panchang:
    """Complete Panchang for a date and location."""
    date: datetime
    location_name: Optional[str]
    latitude: float
    longitude: float
    timezone_name: str
    
    # Core elements
    tithi: TithiInfo
    nakshatra: NakshatraInfo
    yoga: YogaInfo
    karana: KaranaInfo
    
    # Timings
    sun_timing: SunTiming
    moon_timing: MoonTiming
    
    # Weekday
    vaara: str  # Day of week in Sanskrit
    vaara_lord: str  # Ruling planet
    
    # Inauspicious periods
    rahu_kalam: InauspiciousPeriod
    yamagandam: InauspiciousPeriod
    gulika_kalam: InauspiciousPeriod
    
    # Additional
    masa: str  # Lunar month
    paksha: str  # Bright/Dark fortnight
    samvatsara: str  # Vedic year
    ayanamsa_used: str


# Tithi names
TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
]

# Yoga names and natures
YOGA_DATA = [
    ("Vishkambha", "Inauspicious"), ("Priti", "Auspicious"), 
    ("Ayushman", "Auspicious"), ("Saubhagya", "Auspicious"),
    ("Shobhana", "Auspicious"), ("Atiganda", "Inauspicious"),
    ("Sukarman", "Auspicious"), ("Dhriti", "Auspicious"),
    ("Shula", "Inauspicious"), ("Ganda", "Inauspicious"),
    ("Vriddhi", "Auspicious"), ("Dhruva", "Auspicious"),
    ("Vyaghata", "Inauspicious"), ("Harshana", "Auspicious"),
    ("Vajra", "Inauspicious"), ("Siddhi", "Auspicious"),
    ("Vyatipata", "Inauspicious"), ("Variyan", "Auspicious"),
    ("Parigha", "Inauspicious"), ("Shiva", "Auspicious"),
    ("Siddha", "Auspicious"), ("Sadhya", "Auspicious"),
    ("Shubha", "Auspicious"), ("Shukla", "Auspicious"),
    ("Brahma", "Auspicious"), ("Indra", "Auspicious"),
    ("Vaidhriti", "Inauspicious")
]

# Karana names
KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara",
    "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"
]

# Weekday data (Sanskrit names)
VAARA_DATA = [
    ("Ravivara", "Sun"),      # Sunday
    ("Somavara", "Moon"),     # Monday
    ("Mangalavara", "Mars"),  # Tuesday
    ("Budhavara", "Mercury"), # Wednesday
    ("Guruvara", "Jupiter"),  # Thursday
    ("Shukravara", "Venus"),  # Friday
    ("Shanivara", "Saturn")   # Saturday
]

# Rahu Kalam order by weekday (fractions of day from sunrise)
# Sunday=0, Monday=1, etc.
RAHU_KALAM_ORDER = [8, 2, 7, 5, 6, 4, 3]  # Which 1.5-hour segment
YAMAGANDAM_ORDER = [5, 4, 3, 2, 1, 7, 6]
GULIKA_ORDER = [7, 6, 5, 4, 3, 2, 1]


class PanchangService:
    """Service for calculating Panchang (Hindu almanac)."""
    
    def __init__(self, ayanamsa: str = "lahiri"):
        """Initialize with ephemeris service."""
        self.ephemeris = get_ephemeris_service(ayanamsa)
        self.ayanamsa = ayanamsa
    
    def calculate_panchang(
        self,
        date: datetime,
        latitude: float,
        longitude: float,
        timezone_name: str = "UTC",
        location_name: Optional[str] = None
    ) -> Panchang:
        """
        Calculate complete Panchang for a given date and location.
        
        Args:
            date: Date for panchang (time component indicates local midnight)
            latitude: Location latitude
            longitude: Location longitude
            timezone_name: Timezone name (e.g., 'Asia/Kolkata')
            location_name: Human-readable location name
        
        Returns:
            Complete Panchang object
        """
        # Calculate sunrise and sunset first (anchors all other calculations)
        sun_timing = self._calculate_sun_timing(date, latitude, longitude)
        
        # Calculate moon timings
        moon_timing = self._calculate_moon_timing(date, latitude, longitude)
        
        # Use sunrise as reference for panchang calculations
        reference_time = sun_timing.sunrise
        jd = self.ephemeris.datetime_to_jd(reference_time)
        
        # Get Sun and Moon positions
        sun_pos = self.ephemeris.get_planet_position(jd, swe.SUN)
        moon_pos = self.ephemeris.get_planet_position(jd, swe.MOON)
        
        # Calculate Tithi
        tithi = self._calculate_tithi(jd, sun_pos.longitude, moon_pos.longitude)
        
        # Calculate Nakshatra
        nakshatra = self._calculate_nakshatra(jd, moon_pos.longitude)
        
        # Calculate Yoga
        yoga = self._calculate_yoga(jd, sun_pos.longitude, moon_pos.longitude)
        
        # Calculate Karana
        karana = self._calculate_karana(tithi.number, tithi.percent_elapsed)
        
        # Weekday
        weekday = date.weekday()  # 0=Monday in Python, but we need Sunday=0
        # Adjust: Python Monday=0, we need Sunday=0
        vedic_weekday = (weekday + 1) % 7
        vaara, vaara_lord = VAARA_DATA[vedic_weekday]
        
        # Calculate inauspicious periods
        rahu_kalam = self._calculate_inauspicious_period(
            sun_timing, vedic_weekday, "Rahu Kalam", RAHU_KALAM_ORDER
        )
        yamagandam = self._calculate_inauspicious_period(
            sun_timing, vedic_weekday, "Yamagandam", YAMAGANDAM_ORDER
        )
        gulika_kalam = self._calculate_inauspicious_period(
            sun_timing, vedic_weekday, "Gulika Kalam", GULIKA_ORDER
        )
        
        # Lunar month and year (simplified)
        masa = self._get_lunar_month(moon_pos.rashi_index, tithi.paksha)
        samvatsara = self._get_samvatsara(date.year)
        
        return Panchang(
            date=date,
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            timezone_name=timezone_name,
            tithi=tithi,
            nakshatra=nakshatra,
            yoga=yoga,
            karana=karana,
            sun_timing=sun_timing,
            moon_timing=moon_timing,
            vaara=vaara,
            vaara_lord=vaara_lord,
            rahu_kalam=rahu_kalam,
            yamagandam=yamagandam,
            gulika_kalam=gulika_kalam,
            masa=masa,
            paksha=tithi.paksha,
            samvatsara=samvatsara,
            ayanamsa_used=self.ayanamsa
        )
    
    def _calculate_sun_timing(
        self,
        date: datetime,
        latitude: float,
        longitude: float
    ) -> SunTiming:
        """Calculate sunrise, sunset, and related timings."""
        # Get Julian day for the date at noon
        noon_dt = date.replace(hour=12, minute=0, second=0, microsecond=0)
        jd_noon = self.ephemeris.datetime_to_jd(noon_dt)
        
        # Calculate sunrise
        try:
            sunrise_jd = swe.rise_trans(
                jd_noon - 0.5,  # Start searching from previous midnight
                swe.SUN,
                "",  # Empty star name
                swe.FLG_SWIEPH,
                swe.CALC_RISE,
                (longitude, latitude, 0),  # geopos
                0, 0, 0  # atpress, attemp, flags
            )[1][0]
            sunrise = self.ephemeris.jd_to_datetime(sunrise_jd)
        except Exception:
            # Fallback calculation
            sunrise = date.replace(hour=6, minute=0)
        
        # Calculate sunset
        try:
            sunset_jd = swe.rise_trans(
                jd_noon,
                swe.SUN,
                "",
                swe.FLG_SWIEPH,
                swe.CALC_SET,
                (longitude, latitude, 0),
                0, 0, 0
            )[1][0]
            sunset = self.ephemeris.jd_to_datetime(sunset_jd)
        except Exception:
            sunset = date.replace(hour=18, minute=0)
        
        # Calculate noon (midpoint)
        noon = sunrise + (sunset - sunrise) / 2
        
        # Day duration
        day_duration = sunset - sunrise
        
        return SunTiming(
            sunrise=sunrise,
            sunset=sunset,
            noon=noon,
            day_duration=day_duration
        )
    
    def _calculate_moon_timing(
        self,
        date: datetime,
        latitude: float,
        longitude: float
    ) -> MoonTiming:
        """Calculate moonrise and moonset."""
        jd = self.ephemeris.datetime_to_jd(date)
        
        moonrise = None
        moonset = None
        
        try:
            moonrise_result = swe.rise_trans(
                jd,
                swe.MOON,
                "",
                swe.FLG_SWIEPH,
                swe.CALC_RISE,
                (longitude, latitude, 0),
                0, 0, 0
            )
            if moonrise_result[0] >= 0:
                moonrise = self.ephemeris.jd_to_datetime(moonrise_result[1][0])
        except Exception:
            pass
        
        try:
            moonset_result = swe.rise_trans(
                jd,
                swe.MOON,
                "",
                swe.FLG_SWIEPH,
                swe.CALC_SET,
                (longitude, latitude, 0),
                0, 0, 0
            )
            if moonset_result[0] >= 0:
                moonset = self.ephemeris.jd_to_datetime(moonset_result[1][0])
        except Exception:
            pass
        
        return MoonTiming(moonrise=moonrise, moonset=moonset)
    
    def _calculate_tithi(
        self,
        jd: float,
        sun_longitude: float,
        moon_longitude: float
    ) -> TithiInfo:
        """
        Calculate Tithi (lunar day).
        Tithi = (Moon longitude - Sun longitude) / 12
        """
        # Calculate the angular difference
        diff = (moon_longitude - sun_longitude) % 360
        
        # Each tithi is 12 degrees
        tithi_number = int(diff / 12) + 1  # 1-30
        
        # Determine paksha
        if tithi_number <= 15:
            paksha = "Shukla"  # Bright fortnight
            name = TITHI_NAMES[tithi_number - 1]
        else:
            paksha = "Krishna"  # Dark fortnight
            name = TITHI_NAMES[tithi_number - 1]
        
        # Calculate percentage elapsed
        percent_elapsed = (diff % 12) / 12 * 100
        
        # Calculate end time (approximate)
        # Average tithi duration is ~23.6 hours
        remaining_degrees = 12 - (diff % 12)
        # Moon moves ~13.2° per day, Sun ~1° per day, relative ~12.2° per day
        hours_remaining = (remaining_degrees / 12.2) * 24
        end_time = self.ephemeris.jd_to_datetime(jd + hours_remaining / 24)
        
        return TithiInfo(
            number=tithi_number,
            name=name,
            paksha=paksha,
            end_time=end_time,
            percent_elapsed=percent_elapsed
        )
    
    def _calculate_nakshatra(
        self,
        jd: float,
        moon_longitude: float
    ) -> NakshatraInfo:
        """Calculate the Moon's Nakshatra."""
        from src.core.config import NAKSHATRAS
        
        # Each nakshatra spans 13°20' (360/27)
        nakshatra_span = 360 / 27
        nakshatra_index = int(moon_longitude / nakshatra_span)  # 0-26
        
        nakshatra_data = NAKSHATRAS[nakshatra_index]
        
        # Calculate pada (quarter)
        degree_in_nakshatra = moon_longitude % nakshatra_span
        pada = int(degree_in_nakshatra / (nakshatra_span / 4)) + 1  # 1-4
        
        # Calculate end time
        remaining_degrees = nakshatra_span - degree_in_nakshatra
        hours_remaining = (remaining_degrees / 13.2) * 24  # Moon's daily motion
        end_time = self.ephemeris.jd_to_datetime(jd + hours_remaining / 24)
        
        return NakshatraInfo(
            number=nakshatra_index + 1,
            name=nakshatra_data["name"],
            ruler=nakshatra_data["ruler"],
            end_time=end_time,
            pada=pada
        )
    
    def _calculate_yoga(
        self,
        jd: float,
        sun_longitude: float,
        moon_longitude: float
    ) -> YogaInfo:
        """
        Calculate Yoga.
        Yoga = (Sun longitude + Moon longitude) / (360/27)
        """
        total = (sun_longitude + moon_longitude) % 360
        yoga_span = 360 / 27
        yoga_index = int(total / yoga_span)  # 0-26
        
        yoga_name, nature = YOGA_DATA[yoga_index]
        
        # Calculate end time
        remaining_degrees = yoga_span - (total % yoga_span)
        # Combined motion of Sun and Moon
        hours_remaining = (remaining_degrees / 14.2) * 24
        end_time = self.ephemeris.jd_to_datetime(jd + hours_remaining / 24)
        
        return YogaInfo(
            number=yoga_index + 1,
            name=yoga_name,
            nature=nature,
            end_time=end_time
        )
    
    def _calculate_karana(
        self,
        tithi_number: int,
        tithi_percent: float
    ) -> KaranaInfo:
        """
        Calculate Karana (half of a tithi).
        There are 11 karanas, with 7 moving karanas (repeat 8 times = 56)
        and 4 fixed karanas (4 total = 60 half-tithis in a month).
        """
        # Each tithi has 2 karanas
        karana_number = (tithi_number - 1) * 2 + (1 if tithi_percent < 50 else 2)
        
        # Determine which karana
        if karana_number <= 1:
            karana_name = KARANA_NAMES[10]  # Kimstughna
            nature = "Fixed"
        elif karana_number >= 58:
            # Last 4 are fixed karanas
            fixed_index = karana_number - 58  # 0-3
            karana_name = KARANA_NAMES[7 + fixed_index]  # Shakuni, Chatushpada, Naga, Kimstughna
            nature = "Fixed"
        else:
            # Moving karanas cycle
            moving_index = (karana_number - 2) % 7
            karana_name = KARANA_NAMES[moving_index]
            nature = "Movable"
        
        return KaranaInfo(
            number=karana_number,
            name=karana_name,
            nature=nature,
            end_time=None  # Can be calculated from tithi
        )
    
    def _calculate_inauspicious_period(
        self,
        sun_timing: SunTiming,
        weekday: int,
        name: str,
        order: List[int]
    ) -> InauspiciousPeriod:
        """Calculate an inauspicious period like Rahu Kalam."""
        # Divide daytime into 8 parts
        segment_duration = sun_timing.day_duration / 8
        
        # Get the segment number for this weekday
        segment = order[weekday]
        
        # Calculate start and end
        start = sun_timing.sunrise + segment_duration * (segment - 1)
        end = start + segment_duration
        
        return InauspiciousPeriod(
            name=name,
            start=start,
            end=end,
            duration=segment_duration
        )
    
    def _get_lunar_month(self, moon_rashi: int, paksha: str) -> str:
        """Get the lunar month name based on Moon's position."""
        # Simplified mapping - full implementation would check full moon rashi
        MASA_NAMES = [
            "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha",
            "Shravana", "Bhadrapada", "Ashwin", "Kartik",
            "Margashirsha", "Pausha", "Magha", "Phalguna"
        ]
        
        # Approximate: use moon rashi for now
        return MASA_NAMES[(moon_rashi - 1) % 12]
    
    def _get_samvatsara(self, year: int) -> str:
        """Get the Vedic year name (60-year cycle)."""
        SAMVATSARA_NAMES = [
            "Prabhava", "Vibhava", "Shukla", "Pramodoota", "Prajothpatti",
            "Angirasa", "Srimukha", "Bhava", "Yuva", "Dhatru",
            "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrusha",
            "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya",
            "Sarvajith", "Sarvadhari", "Virodhi", "Vikruthi", "Khara",
            "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi",
            "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava",
            "Shubhakruthu", "Shobhakruthu", "Krodhi", "Vishvavasu", "Parabhava",
            "Plavanga", "Keelaka", "Saumya", "Sadharana", "Virodhikruthu",
            "Paridhavi", "Pramadeecha", "Ananda", "Rakshasa", "Nala",
            "Pingala", "Kalayukthi", "Siddharthi", "Raudra", "Durmathi",
            "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
        ]
        
        # The cycle is based on Jupiter's position, simplified here
        index = (year - 1987) % 60  # 1987 was Prabhava
        return SAMVATSARA_NAMES[index]
    
    def get_monthly_panchang(
        self,
        year: int,
        month: int,
        latitude: float,
        longitude: float,
        timezone_name: str = "UTC"
    ) -> List[Panchang]:
        """Generate panchang for an entire month."""
        import calendar
        
        panchangs = []
        num_days = calendar.monthrange(year, month)[1]
        
        for day in range(1, num_days + 1):
            date = datetime(year, month, day, tzinfo=timezone.utc)
            panchang = self.calculate_panchang(
                date, latitude, longitude, timezone_name
            )
            panchangs.append(panchang)
        
        return panchangs


# Singleton instance
_panchang_service: Optional[PanchangService] = None


def get_panchang_service(ayanamsa: str = "lahiri") -> PanchangService:
    """Get panchang service instance."""
    global _panchang_service
    if _panchang_service is None or _panchang_service.ayanamsa != ayanamsa:
        _panchang_service = PanchangService(ayanamsa)
    return _panchang_service
