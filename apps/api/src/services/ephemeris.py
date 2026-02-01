"""
Jyotish Platform - Swiss Ephemeris Service
Core astronomical calculation engine using pyswisseph
"""
import swisseph as swe
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from functools import lru_cache
import math

from src.core.config import (
    get_settings, 
    AYANAMSA_OPTIONS, 
    NAKSHATRAS, 
    RASHIS, 
    GRAHAS,
    VIMSHOTTARI_PERIODS,
    VIMSHOTTARI_SEQUENCE
)


@dataclass
class PlanetPosition:
    """Represents a planet's position in the chart."""
    planet_id: int
    name: str
    english_name: str
    longitude: float  # Sidereal longitude
    latitude: float
    speed: float
    is_retrograde: bool
    rashi_index: int  # 1-12
    rashi_name: str
    rashi_english: str
    degree_in_rashi: float  # 0-30
    nakshatra_index: int  # 1-27
    nakshatra_name: str
    nakshatra_pada: int  # 1-4
    nakshatra_lord: str
    symbol: str


@dataclass
class HousePosition:
    """Represents a house cusp position."""
    house_number: int  # 1-12
    longitude: float
    rashi_index: int
    rashi_name: str
    degree_in_rashi: float


@dataclass
class BirthChart:
    """Complete birth chart data."""
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
    planets: List[PlanetPosition]
    houses: List[HousePosition]
    
    # Additional calculated values
    moon_rashi: int = 0
    moon_nakshatra: int = 0
    sun_rashi: int = 0


@dataclass 
class DashaPeriod:
    """Represents a dasha period."""
    planet: str
    start_date: datetime
    end_date: datetime
    level: int  # 1=Maha, 2=Antar, 3=Pratyantar
    duration_years: float


class EphemerisService:
    """
    Swiss Ephemeris wrapper for Vedic astrology calculations.
    All calculations use sidereal zodiac with configurable ayanamsa.
    """
    
    # Swiss Ephemeris planet IDs
    SUN = swe.SUN
    MOON = swe.MOON
    MARS = swe.MARS
    MERCURY = swe.MERCURY
    JUPITER = swe.JUPITER
    VENUS = swe.VENUS
    SATURN = swe.SATURN
    RAHU = swe.MEAN_NODE  # Mean North Node
    
    # Planet mapping for Vedic astrology
    PLANET_MAP = {
        SUN: {"name": "Surya", "english": "Sun", "symbol": "☉"},
        MOON: {"name": "Chandra", "english": "Moon", "symbol": "☽"},
        MARS: {"name": "Mangal", "english": "Mars", "symbol": "♂"},
        MERCURY: {"name": "Budha", "english": "Mercury", "symbol": "☿"},
        JUPITER: {"name": "Guru", "english": "Jupiter", "symbol": "♃"},
        VENUS: {"name": "Shukra", "english": "Venus", "symbol": "♀"},
        SATURN: {"name": "Shani", "english": "Saturn", "symbol": "♄"},
        RAHU: {"name": "Rahu", "english": "North Node", "symbol": "☊"},
    }
    
    def __init__(self, ayanamsa: str = "lahiri"):
        """Initialize the ephemeris service."""
        self.settings = get_settings()
        self.ayanamsa = ayanamsa
        
        # Set ephemeris path if available
        try:
            swe.set_ephe_path(self.settings.ephemeris_path)
        except Exception:
            pass  # Use built-in Moshier ephemeris
        
        # Set ayanamsa
        self._set_ayanamsa(ayanamsa)
    
    def _set_ayanamsa(self, ayanamsa: str) -> None:
        """Set the ayanamsa for sidereal calculations."""
        if ayanamsa not in AYANAMSA_OPTIONS:
            ayanamsa = "lahiri"
        
        ayanamsa_code = AYANAMSA_OPTIONS[ayanamsa]["code"]
        swe.set_sid_mode(ayanamsa_code)
        self.ayanamsa = ayanamsa
    
    def datetime_to_jd(self, dt: datetime) -> float:
        """Convert datetime to Julian Day number."""
        # Ensure UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        
        # Swiss Ephemeris uses Julian calendar before Oct 15, 1582
        gregorian = 1 if dt.year > 1582 or (dt.year == 1582 and dt.month >= 10 and dt.day >= 15) else 0
        
        hour_decimal = dt.hour + dt.minute / 60.0 + dt.second / 3600.0
        
        jd = swe.julday(
            dt.year, 
            dt.month, 
            dt.day, 
            hour_decimal, 
            gregorian
        )
        
        return jd
    
    def jd_to_datetime(self, jd: float) -> datetime:
        """Convert Julian Day number to datetime."""
        result = swe.revjul(jd, 1)  # 1 = Gregorian calendar
        year, month, day, hour_decimal = result
        
        hours = int(hour_decimal)
        minutes = int((hour_decimal - hours) * 60)
        seconds = int(((hour_decimal - hours) * 60 - minutes) * 60)
        
        return datetime(
            int(year), int(month), int(day), 
            hours, minutes, seconds, 
            tzinfo=timezone.utc
        )
    
    def get_ayanamsa_value(self, jd: float) -> float:
        """Get the ayanamsa value for a given Julian Day."""
        return swe.get_ayanamsa(jd)
    
    def get_planet_position(
        self, 
        jd: float, 
        planet_id: int,
        calc_speed: bool = True
    ) -> PlanetPosition:
        """
        Calculate a planet's sidereal position.
        
        Args:
            jd: Julian Day number
            planet_id: Swiss Ephemeris planet ID
            calc_speed: Whether to calculate speed (for retrograde detection)
        
        Returns:
            PlanetPosition with all calculated values
        """
        # Calculate tropical position first
        flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
        if calc_speed:
            flags |= swe.FLG_SPEED
        
        result, ret_flags = swe.calc_ut(jd, planet_id, flags)
        
        longitude = result[0]  # Already sidereal due to flag
        latitude = result[1]
        speed = result[3] if calc_speed else 0.0
        
        # Handle Ketu (opposite to Rahu)
        is_ketu = False
        if planet_id == self.RAHU:
            # For Rahu, we use the position as-is
            pass
        
        # Normalize longitude to 0-360
        longitude = longitude % 360
        
        # Calculate Rashi (sign)
        rashi_index = int(longitude / 30) + 1  # 1-12
        degree_in_rashi = longitude % 30
        
        rashi_data = RASHIS[rashi_index - 1]
        
        # Calculate Nakshatra
        nakshatra_index = int(longitude / (360 / 27)) + 1  # 1-27
        nakshatra_degree = longitude % (360 / 27)
        nakshatra_pada = int(nakshatra_degree / (360 / 27 / 4)) + 1  # 1-4
        
        nakshatra_data = NAKSHATRAS[nakshatra_index - 1]
        
        # Get planet info
        planet_info = self.PLANET_MAP.get(planet_id, {
            "name": "Unknown",
            "english": "Unknown", 
            "symbol": "?"
        })
        
        return PlanetPosition(
            planet_id=planet_id,
            name=planet_info["name"],
            english_name=planet_info["english"],
            longitude=longitude,
            latitude=latitude,
            speed=speed,
            is_retrograde=speed < 0,
            rashi_index=rashi_index,
            rashi_name=rashi_data["name"],
            rashi_english=rashi_data["english"],
            degree_in_rashi=degree_in_rashi,
            nakshatra_index=nakshatra_index,
            nakshatra_name=nakshatra_data["name"],
            nakshatra_pada=nakshatra_pada,
            nakshatra_lord=nakshatra_data["ruler"],
            symbol=planet_info["symbol"]
        )
    
    def get_ketu_position(self, rahu_position: PlanetPosition) -> PlanetPosition:
        """Calculate Ketu position (180° opposite to Rahu)."""
        ketu_longitude = (rahu_position.longitude + 180) % 360
        
        # Calculate Rashi
        rashi_index = int(ketu_longitude / 30) + 1
        degree_in_rashi = ketu_longitude % 30
        rashi_data = RASHIS[rashi_index - 1]
        
        # Calculate Nakshatra
        nakshatra_index = int(ketu_longitude / (360 / 27)) + 1
        nakshatra_degree = ketu_longitude % (360 / 27)
        nakshatra_pada = int(nakshatra_degree / (360 / 27 / 4)) + 1
        nakshatra_data = NAKSHATRAS[nakshatra_index - 1]
        
        return PlanetPosition(
            planet_id=-1,  # Custom ID for Ketu
            name="Ketu",
            english_name="South Node",
            longitude=ketu_longitude,
            latitude=-rahu_position.latitude,
            speed=-rahu_position.speed,  # Opposite motion
            is_retrograde=True,  # Always retrograde
            rashi_index=rashi_index,
            rashi_name=rashi_data["name"],
            rashi_english=rashi_data["english"],
            degree_in_rashi=degree_in_rashi,
            nakshatra_index=nakshatra_index,
            nakshatra_name=nakshatra_data["name"],
            nakshatra_pada=nakshatra_pada,
            nakshatra_lord=nakshatra_data["ruler"],
            symbol="☋"
        )
    
    def calculate_ascendant(
        self,
        jd: float,
        latitude: float,
        longitude: float
    ) -> Tuple[float, int, int]:
        """
        Calculate the Ascendant (Lagna).
        
        Returns:
            Tuple of (ascendant_longitude, rashi_index, nakshatra_index)
        """
        # Use Placidus house system for ascendant calculation
        houses, ascmc = swe.houses_ex(
            jd, 
            latitude, 
            longitude, 
            b'P',  # Placidus
            swe.FLG_SIDEREAL
        )
        
        ascendant = ascmc[0]  # Ascendant is first element
        
        # Normalize
        ascendant = ascendant % 360
        
        # Calculate Rashi and Nakshatra
        rashi_index = int(ascendant / 30) + 1
        nakshatra_index = int(ascendant / (360 / 27)) + 1
        
        return ascendant, rashi_index, nakshatra_index
    
    def calculate_houses(
        self,
        jd: float,
        latitude: float,
        longitude: float,
        house_system: str = "P"  # Placidus default
    ) -> List[HousePosition]:
        """
        Calculate house cusps.
        
        House systems:
        - P: Placidus
        - K: Koch
        - E: Equal
        - W: Whole Sign
        """
        houses, ascmc = swe.houses_ex(
            jd,
            latitude,
            longitude,
            house_system.encode(),
            swe.FLG_SIDEREAL
        )
        
        house_positions = []
        for i, cusp in enumerate(houses[:12], 1):
            cusp = cusp % 360
            rashi_index = int(cusp / 30) + 1
            degree_in_rashi = cusp % 30
            
            house_positions.append(HousePosition(
                house_number=i,
                longitude=cusp,
                rashi_index=rashi_index,
                rashi_name=RASHIS[rashi_index - 1]["name"],
                degree_in_rashi=degree_in_rashi
            ))
        
        return house_positions
    
    def calculate_birth_chart(
        self,
        birth_datetime: datetime,
        latitude: float,
        longitude: float,
        timezone_offset: float = 0.0,
        ayanamsa: Optional[str] = None
    ) -> BirthChart:
        """
        Calculate a complete birth chart.
        
        Args:
            birth_datetime: Birth date and time (should be in UTC or have timezone info)
            latitude: Birth location latitude
            longitude: Birth location longitude  
            timezone_offset: Hours offset from UTC (for display purposes)
            ayanamsa: Ayanamsa to use (defaults to instance setting)
        
        Returns:
            Complete BirthChart object
        """
        if ayanamsa and ayanamsa != self.ayanamsa:
            self._set_ayanamsa(ayanamsa)
        
        # Convert to Julian Day
        jd = self.datetime_to_jd(birth_datetime)
        
        # Get ayanamsa value
        ayanamsa_value = self.get_ayanamsa_value(jd)
        
        # Calculate Ascendant
        ascendant, asc_rashi, asc_nakshatra = self.calculate_ascendant(
            jd, latitude, longitude
        )
        
        # Calculate all planet positions
        planets = []
        
        # Main planets
        for planet_id in [
            self.SUN, self.MOON, self.MARS, self.MERCURY,
            self.JUPITER, self.VENUS, self.SATURN, self.RAHU
        ]:
            position = self.get_planet_position(jd, planet_id)
            planets.append(position)
            
            # Store Moon position for quick reference
            if planet_id == self.MOON:
                moon_rashi = position.rashi_index
                moon_nakshatra = position.nakshatra_index
            elif planet_id == self.SUN:
                sun_rashi = position.rashi_index
        
        # Add Ketu (calculated from Rahu)
        rahu_position = planets[-1]  # Last added was Rahu
        ketu_position = self.get_ketu_position(rahu_position)
        planets.append(ketu_position)
        
        # Calculate houses
        houses = self.calculate_houses(jd, latitude, longitude)
        
        return BirthChart(
            datetime_utc=birth_datetime if birth_datetime.tzinfo else birth_datetime.replace(tzinfo=timezone.utc),
            julian_day=jd,
            latitude=latitude,
            longitude=longitude,
            timezone_offset=timezone_offset,
            ayanamsa=self.ayanamsa,
            ayanamsa_value=ayanamsa_value,
            ascendant=ascendant,
            ascendant_rashi=asc_rashi,
            ascendant_nakshatra=asc_nakshatra,
            planets=planets,
            houses=houses,
            moon_rashi=moon_rashi,
            moon_nakshatra=moon_nakshatra,
            sun_rashi=sun_rashi
        )
    
    def calculate_divisional_chart(
        self,
        birth_chart: BirthChart,
        division: int
    ) -> Dict[str, int]:
        """
        Calculate a divisional chart (Varga).
        
        Common divisions:
        - D1: Rashi (birth chart)
        - D9: Navamsa (marriage, dharma)
        - D10: Dasamsa (career)
        - D7: Saptamsa (children)
        - D12: Dwadasamsa (parents)
        
        Returns:
            Dictionary mapping planet names to their sign in the divisional chart
        """
        divisional_positions = {}
        
        for planet in birth_chart.planets:
            # Calculate divisional chart position
            if division == 9:  # Navamsa
                navamsa_sign = self._calculate_navamsa(planet.longitude)
                divisional_positions[planet.name] = navamsa_sign
            elif division == 10:  # Dasamsa
                dasamsa_sign = self._calculate_dasamsa(planet.longitude)
                divisional_positions[planet.name] = dasamsa_sign
            elif division == 7:  # Saptamsa
                saptamsa_sign = self._calculate_saptamsa(planet.longitude)
                divisional_positions[planet.name] = saptamsa_sign
            elif division == 12:  # Dwadasamsa
                dwadasamsa_sign = self._calculate_dwadasamsa(planet.longitude)
                divisional_positions[planet.name] = dwadasamsa_sign
            else:
                # Generic calculation for other divisions
                divisional_positions[planet.name] = self._calculate_generic_varga(
                    planet.longitude, division
                )
        
        return divisional_positions
    
    def _calculate_navamsa(self, longitude: float) -> int:
        """Calculate Navamsa (D9) position."""
        # Each sign is divided into 9 parts of 3°20' each
        # The navamsa cycle starts from the sign's element
        rashi = int(longitude / 30)  # 0-11
        degree_in_rashi = longitude % 30
        navamsa_part = int(degree_in_rashi / (30 / 9))  # 0-8
        
        # Starting point based on element
        element = rashi % 4  # 0=Fire, 1=Earth, 2=Air, 3=Water
        start_signs = [0, 9, 6, 3]  # Aries, Capricorn, Libra, Cancer
        
        navamsa_sign = (start_signs[element] + navamsa_part) % 12 + 1
        return navamsa_sign
    
    def _calculate_dasamsa(self, longitude: float) -> int:
        """Calculate Dasamsa (D10) position."""
        rashi = int(longitude / 30)  # 0-11
        degree_in_rashi = longitude % 30
        dasamsa_part = int(degree_in_rashi / 3)  # 0-9
        
        # Odd signs start from same sign, even from 9th
        if rashi % 2 == 0:  # Odd sign (0-indexed)
            start = rashi
        else:  # Even sign
            start = (rashi + 8) % 12
        
        dasamsa_sign = (start + dasamsa_part) % 12 + 1
        return dasamsa_sign
    
    def _calculate_saptamsa(self, longitude: float) -> int:
        """Calculate Saptamsa (D7) position."""
        rashi = int(longitude / 30)
        degree_in_rashi = longitude % 30
        saptamsa_part = int(degree_in_rashi / (30 / 7))
        
        # Odd signs start from same sign, even from 7th
        if rashi % 2 == 0:
            start = rashi
        else:
            start = (rashi + 6) % 12
        
        return (start + saptamsa_part) % 12 + 1
    
    def _calculate_dwadasamsa(self, longitude: float) -> int:
        """Calculate Dwadasamsa (D12) position."""
        rashi = int(longitude / 30)
        degree_in_rashi = longitude % 30
        dwadasamsa_part = int(degree_in_rashi / 2.5)
        
        return (rashi + dwadasamsa_part) % 12 + 1
    
    def _calculate_generic_varga(self, longitude: float, division: int) -> int:
        """Calculate generic divisional chart position."""
        rashi = int(longitude / 30)
        degree_in_rashi = longitude % 30
        part = int(degree_in_rashi / (30 / division))
        return (rashi + part) % 12 + 1
    
    def calculate_vimshottari_dasha(
        self,
        moon_longitude: float,
        birth_datetime: datetime,
        years_forward: int = 120
    ) -> List[DashaPeriod]:
        """
        Calculate Vimshottari Dasha periods.
        
        The Vimshottari system is a 120-year planetary period system
        based on the Moon's nakshatra at birth.
        """
        # Determine starting dasha from Moon's nakshatra
        nakshatra_index = int(moon_longitude / (360 / 27))  # 0-26
        nakshatra_lord_sequence = [
            "Ketu", "Venus", "Sun", "Moon", "Mars",
            "Rahu", "Jupiter", "Saturn", "Mercury"
        ]
        
        # Each nakshatra is ruled by a planet in sequence
        start_dasha_lord = nakshatra_lord_sequence[nakshatra_index % 9]
        
        # Calculate how much of the first dasha has passed
        nakshatra_span = 360 / 27  # 13°20'
        position_in_nakshatra = moon_longitude % nakshatra_span
        fraction_passed = position_in_nakshatra / nakshatra_span
        
        # Build dasha periods
        dasha_periods = []
        current_date = birth_datetime
        
        # Find starting index
        start_index = VIMSHOTTARI_SEQUENCE.index(start_dasha_lord)
        
        # Calculate first (partial) Maha Dasha
        first_period_years = VIMSHOTTARI_PERIODS[start_dasha_lord]
        remaining_years = first_period_years * (1 - fraction_passed)
        
        # Add first partial dasha
        end_date = self._add_years(current_date, remaining_years)
        dasha_periods.append(DashaPeriod(
            planet=start_dasha_lord,
            start_date=current_date,
            end_date=end_date,
            level=1,
            duration_years=remaining_years
        ))
        current_date = end_date
        
        # Add subsequent full dashas
        for i in range(1, 10):  # Cover full 120-year cycle
            dasha_index = (start_index + i) % 9
            dasha_lord = VIMSHOTTARI_SEQUENCE[dasha_index]
            period_years = VIMSHOTTARI_PERIODS[dasha_lord]
            
            end_date = self._add_years(current_date, period_years)
            
            # Only add if within our forward range
            if (current_date - birth_datetime).days / 365.25 > years_forward:
                break
            
            dasha_periods.append(DashaPeriod(
                planet=dasha_lord,
                start_date=current_date,
                end_date=end_date,
                level=1,
                duration_years=period_years
            ))
            current_date = end_date
        
        return dasha_periods
    
    def calculate_antardasha(
        self,
        maha_dasha: DashaPeriod
    ) -> List[DashaPeriod]:
        """Calculate Antardasha (sub-periods) within a Maha Dasha."""
        antardasha_periods = []
        
        maha_lord = maha_dasha.planet
        maha_start_index = VIMSHOTTARI_SEQUENCE.index(maha_lord)
        
        total_days = (maha_dasha.end_date - maha_dasha.start_date).days
        current_date = maha_dasha.start_date
        
        for i in range(9):
            antar_index = (maha_start_index + i) % 9
            antar_lord = VIMSHOTTARI_SEQUENCE[antar_index]
            
            # Antardasha duration is proportional to its Maha Dasha period
            antar_ratio = VIMSHOTTARI_PERIODS[antar_lord] / 120
            antar_days = total_days * antar_ratio
            antar_years = antar_days / 365.25
            
            from datetime import timedelta
            end_date = current_date + timedelta(days=antar_days)
            
            antardasha_periods.append(DashaPeriod(
                planet=antar_lord,
                start_date=current_date,
                end_date=end_date,
                level=2,
                duration_years=antar_years
            ))
            
            current_date = end_date
        
        return antardasha_periods
    
    def _add_years(self, dt: datetime, years: float) -> datetime:
        """Add fractional years to a datetime."""
        from datetime import timedelta
        days = years * 365.25
        return dt + timedelta(days=days)
    
    def get_current_transits(
        self,
        dt: Optional[datetime] = None
    ) -> List[PlanetPosition]:
        """Get current planetary positions for transit analysis."""
        if dt is None:
            dt = datetime.now(timezone.utc)
        
        jd = self.datetime_to_jd(dt)
        
        transits = []
        for planet_id in [
            self.SUN, self.MOON, self.MARS, self.MERCURY,
            self.JUPITER, self.VENUS, self.SATURN, self.RAHU
        ]:
            position = self.get_planet_position(jd, planet_id)
            transits.append(position)
        
        # Add Ketu
        rahu_position = transits[-1]
        ketu_position = self.get_ketu_position(rahu_position)
        transits.append(ketu_position)
        
        return transits


# Create a singleton instance with default settings
@lru_cache(maxsize=1)
def get_ephemeris_service(ayanamsa: str = "lahiri") -> EphemerisService:
    """Get cached ephemeris service instance."""
    return EphemerisService(ayanamsa=ayanamsa)
