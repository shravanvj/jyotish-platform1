"""
Jyotish Platform - Matchmaking Service
Implements South Indian Porutham and North Indian Ashtakoota Guna Milan
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum

from src.core.config import NAKSHATRAS, RASHIS


class MatchResult(Enum):
    """Result of a compatibility check."""
    PASS = "pass"
    FAIL = "fail"
    PARTIAL = "partial"
    EXCEPTION = "exception"


@dataclass
class PortuthamResult:
    """Result of a single Porutham check."""
    name: str
    tamil_name: str
    result: MatchResult
    score: float  # 0.0 to 1.0
    description: str
    is_essential: bool
    exception_applied: Optional[str] = None


@dataclass
class SouthIndianMatchResult:
    """Complete South Indian matching result."""
    poruthams: List[PortuthamResult]
    total_matched: int
    total_checked: int
    percentage: float
    overall_recommendation: str
    has_hard_blockers: bool
    blocker_details: List[str]
    region_variant: str  # Tamil, Telugu, etc.


@dataclass
class AshtakootaResult:
    """Result of a single Ashtakoota check."""
    name: str
    hindi_name: str
    max_points: int
    scored_points: float
    description: str
    details: Dict


@dataclass
class NorthIndianMatchResult:
    """Complete North Indian Ashtakoota result."""
    kootas: List[AshtakootaResult]
    total_points: float
    max_points: int  # 36
    percentage: float
    overall_recommendation: str
    nadi_dosha: bool
    bhakoot_dosha: bool
    exceptions_applied: List[str]


# Nakshatra groupings for various calculations
NAKSHATRA_GANA = {
    # Deva (Divine) Gana - 1
    1: 1, 5: 1, 7: 1, 8: 1, 13: 1, 15: 1, 17: 1, 22: 1, 27: 1,
    # Manushya (Human) Gana - 2
    2: 2, 4: 2, 6: 2, 11: 2, 12: 2, 20: 2, 21: 2, 25: 2, 26: 2,
    # Rakshasa (Demon) Gana - 3
    3: 3, 9: 3, 10: 3, 14: 3, 16: 3, 18: 3, 19: 3, 23: 3, 24: 3,
}

# Yoni (Animal symbol) for nakshatras
NAKSHATRA_YONI = {
    1: ("Horse", "M"), 2: ("Elephant", "M"), 3: ("Goat", "F"), 4: ("Serpent", "M"),
    5: ("Serpent", "F"), 6: ("Dog", "F"), 7: ("Cat", "F"), 8: ("Goat", "M"),
    9: ("Cat", "M"), 10: ("Rat", "M"), 11: ("Rat", "F"), 12: ("Buffalo", "M"),
    13: ("Buffalo", "F"), 14: ("Tiger", "F"), 15: ("Buffalo", "M"), 16: ("Tiger", "M"),
    17: ("Deer", "F"), 18: ("Deer", "M"), 19: ("Dog", "M"), 20: ("Monkey", "M"),
    21: ("Mongoose", "M"), 22: ("Monkey", "F"), 23: ("Lion", "F"), 24: ("Horse", "F"),
    25: ("Lion", "M"), 26: ("Cow", "F"), 27: ("Elephant", "F"),
}

# Yoni compatibility matrix (1=best, 0=worst, 0.5=neutral)
YONI_ENEMIES = {
    ("Horse", "Buffalo"): 0, ("Elephant", "Lion"): 0, ("Goat", "Monkey"): 0,
    ("Serpent", "Mongoose"): 0, ("Dog", "Deer"): 0, ("Cat", "Rat"): 0,
    ("Tiger", "Cow"): 0,
}

# Nadi for nakshatras (1=Aadi, 2=Madhya, 3=Antya)
NAKSHATRA_NADI = {
    1: 1, 2: 2, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 2, 9: 3,
    10: 1, 11: 2, 12: 3, 13: 3, 14: 2, 15: 1, 16: 1, 17: 2, 18: 3,
    19: 1, 20: 2, 21: 3, 22: 3, 23: 2, 24: 1, 25: 1, 26: 2, 27: 3,
}

# Varna for rashis
RASHI_VARNA = {
    1: 4, 2: 3, 3: 3, 4: 1, 5: 4, 6: 3,
    7: 3, 8: 1, 9: 4, 10: 3, 11: 3, 12: 1,
}  # 4=Brahmin, 3=Kshatriya, 2=Vaishya, 1=Shudra

# Vashya relationships
VASHYA_TYPES = {
    1: "Chatushpad", 2: "Chatushpad", 3: "Dwipad", 4: "Keeta",
    5: "Chatushpad", 6: "Dwipad", 7: "Dwipad", 8: "Keeta",
    9: "Chatushpad", 10: "Jalachara", 11: "Dwipad", 12: "Jalachara",
}

# Rajju categories (body parts)
NAKSHATRA_RAJJU = {
    # Pada (Feet)
    1: "Pada", 6: "Pada", 7: "Pada", 12: "Pada", 13: "Pada",
    18: "Pada", 19: "Pada", 24: "Pada", 25: "Pada",
    # Kati (Waist)  
    2: "Kati", 5: "Kati", 8: "Kati", 11: "Kati", 14: "Kati",
    17: "Kati", 20: "Kati", 23: "Kati", 26: "Kati",
    # Nabhi (Navel)
    3: "Nabhi", 4: "Nabhi", 9: "Nabhi", 10: "Nabhi", 15: "Nabhi",
    16: "Nabhi", 21: "Nabhi", 22: "Nabhi", 27: "Nabhi",
}

# Vedha (affliction) pairs - nakshatras that should not be matched
VEDHA_PAIRS = [
    (1, 18), (2, 17), (3, 16), (4, 15), (5, 14), (6, 13), (7, 12),
    (8, 11), (9, 10), (19, 27), (20, 26), (21, 25), (22, 24), (23, 23)
]


class MatchmakingService:
    """
    Service for calculating marriage compatibility.
    Supports both South Indian and North Indian systems.
    """
    
    def __init__(self):
        """Initialize the matchmaking service."""
        pass
    
    def calculate_south_indian_match(
        self,
        bride_nakshatra: int,
        bride_rashi: int,
        groom_nakshatra: int,
        groom_rashi: int,
        region_variant: str = "tamil"
    ) -> SouthIndianMatchResult:
        """
        Calculate South Indian Porutham matching.
        
        Args:
            bride_nakshatra: Bride's nakshatra (1-27)
            bride_rashi: Bride's moon sign (1-12)
            groom_nakshatra: Groom's nakshatra (1-27)
            groom_rashi: Groom's moon sign (1-12)
            region_variant: "tamil", "telugu", "kerala"
        
        Returns:
            Complete matching result
        """
        poruthams = []
        blockers = []
        
        # 1. Dinam Porutham (Star compatibility by count)
        dinam = self._check_dinam(bride_nakshatra, groom_nakshatra)
        poruthams.append(dinam)
        
        # 2. Ganam Porutham (Temperament)
        ganam = self._check_ganam(bride_nakshatra, groom_nakshatra)
        poruthams.append(ganam)
        
        # 3. Mahendra Porutham (Prosperity)
        mahendra = self._check_mahendra(bride_nakshatra, groom_nakshatra)
        poruthams.append(mahendra)
        
        # 4. Stree Deergham (Longevity of wife)
        stree_deergham = self._check_stree_deergham(bride_nakshatra, groom_nakshatra)
        poruthams.append(stree_deergham)
        
        # 5. Yoni Porutham (Sexual compatibility)
        yoni = self._check_yoni(bride_nakshatra, groom_nakshatra)
        poruthams.append(yoni)
        
        # 6. Rashi Porutham (Moon sign compatibility)
        rashi = self._check_rashi_porutham(bride_rashi, groom_rashi)
        poruthams.append(rashi)
        
        # 7. Rasiyathipathi Porutham (Sign lord compatibility)
        rasiyathipathi = self._check_rasiyathipathi(bride_rashi, groom_rashi)
        poruthams.append(rasiyathipathi)
        
        # 8. Vasya Porutham (Mutual attraction)
        vasya = self._check_vasya(bride_rashi, groom_rashi)
        poruthams.append(vasya)
        
        # 9. Rajju Porutham (Longevity) - ESSENTIAL
        rajju = self._check_rajju(bride_nakshatra, groom_nakshatra)
        poruthams.append(rajju)
        if rajju.result == MatchResult.FAIL:
            blockers.append("Rajju Porutham failed - potential for widowhood")
        
        # 10. Vedha Porutham (Affliction) - ESSENTIAL
        vedha = self._check_vedha(bride_nakshatra, groom_nakshatra)
        poruthams.append(vedha)
        if vedha.result == MatchResult.FAIL:
            blockers.append("Vedha Porutham failed - mutual affliction")
        
        # Calculate totals
        passed = sum(1 for p in poruthams if p.result == MatchResult.PASS)
        total = len(poruthams)
        percentage = (passed / total) * 100
        
        # Determine recommendation
        has_blockers = len(blockers) > 0
        if has_blockers:
            recommendation = "Not Recommended - Essential poruthams failed"
        elif percentage >= 70:
            recommendation = "Highly Compatible - Excellent match"
        elif percentage >= 50:
            recommendation = "Compatible - Good match with minor differences"
        else:
            recommendation = "Low Compatibility - Significant differences exist"
        
        return SouthIndianMatchResult(
            poruthams=poruthams,
            total_matched=passed,
            total_checked=total,
            percentage=percentage,
            overall_recommendation=recommendation,
            has_hard_blockers=has_blockers,
            blocker_details=blockers,
            region_variant=region_variant
        )
    
    def _check_dinam(self, bride_nak: int, groom_nak: int) -> PortuthamResult:
        """Check Dinam Porutham (Nakshatra count compatibility)."""
        # Count from bride to groom and groom to bride
        count1 = ((groom_nak - bride_nak) % 27) + 1
        count2 = ((bride_nak - groom_nak) % 27) + 1
        
        # Auspicious counts: not 2, 4, 6, 8, 9 (from each)
        inauspicious = {2, 4, 6, 8, 9}
        
        result = MatchResult.PASS if (count1 not in inauspicious and count2 not in inauspicious) else MatchResult.FAIL
        
        return PortuthamResult(
            name="Dinam",
            tamil_name="தினம்",
            result=result,
            score=1.0 if result == MatchResult.PASS else 0.0,
            description="Evaluates daily happiness and health through nakshatra counting",
            is_essential=False
        )
    
    def _check_ganam(self, bride_nak: int, groom_nak: int) -> PortuthamResult:
        """Check Ganam Porutham (Temperament compatibility)."""
        bride_gana = NAKSHATRA_GANA.get(bride_nak, 2)
        groom_gana = NAKSHATRA_GANA.get(groom_nak, 2)
        
        # Compatibility matrix: same gana or bride Deva is compatible with all
        if bride_gana == groom_gana:
            result = MatchResult.PASS
            score = 1.0
        elif bride_gana == 1:  # Deva bride compatible with all
            result = MatchResult.PASS
            score = 0.8
        elif groom_gana == 1 and bride_gana == 2:  # Manushya bride with Deva groom
            result = MatchResult.PASS
            score = 0.7
        elif bride_gana == 3 or groom_gana == 3:  # Rakshasa involved
            result = MatchResult.FAIL
            score = 0.2
        else:
            result = MatchResult.PARTIAL
            score = 0.5
        
        gana_names = {1: "Deva (Divine)", 2: "Manushya (Human)", 3: "Rakshasa (Demon)"}
        
        return PortuthamResult(
            name="Ganam",
            tamil_name="கணம்",
            result=result,
            score=score,
            description=f"Bride: {gana_names[bride_gana]}, Groom: {gana_names[groom_gana]}. Evaluates temperament and mental compatibility.",
            is_essential=False
        )
    
    def _check_mahendra(self, bride_nak: int, groom_nak: int) -> PortuthamResult:
        """Check Mahendra Porutham (Prosperity and progeny)."""
        count = ((groom_nak - bride_nak) % 27) + 1
        
        # Auspicious if count is 4, 7, 10, 13, 16, 19, 22, 25
        auspicious_counts = {4, 7, 10, 13, 16, 19, 22, 25}
        result = MatchResult.PASS if count in auspicious_counts else MatchResult.FAIL
        
        return PortuthamResult(
            name="Mahendra",
            tamil_name="மகேந்திரம்",
            result=result,
            score=1.0 if result == MatchResult.PASS else 0.0,
            description="Evaluates prosperity, wealth, and progeny. Count: " + str(count),
            is_essential=False
        )
    
    def _check_stree_deergham(self, bride_nak: int, groom_nak: int) -> PortuthamResult:
        """Check Stree Deergham Porutham (Wife's longevity)."""
        # Count from bride's nakshatra to groom's
        count = ((groom_nak - bride_nak) % 27)
        
        # If groom's nakshatra is at least 13 away (forward), it's good
        result = MatchResult.PASS if count >= 13 else MatchResult.FAIL
        
        return PortuthamResult(
            name="Stree Deergham",
            tamil_name="ஸ்த்ரீ தீர்க்கம்",
            result=result,
            score=1.0 if result == MatchResult.PASS else 0.0,
            description="Evaluates the longevity and well-being of the bride. Forward count: " + str(count),
            is_essential=False
        )
    
    def _check_yoni(self, bride_nak: int, groom_nak: int) -> PortuthamResult:
        """Check Yoni Porutham (Physical/sexual compatibility)."""
        bride_yoni = NAKSHATRA_YONI.get(bride_nak, ("Unknown", "M"))
        groom_yoni = NAKSHATRA_YONI.get(groom_nak, ("Unknown", "M"))
        
        bride_animal = bride_yoni[0]
        groom_animal = groom_yoni[0]
        
        # Check if enemies
        if (bride_animal, groom_animal) in YONI_ENEMIES or (groom_animal, bride_animal) in YONI_ENEMIES:
            result = MatchResult.FAIL
            score = 0.0
        elif bride_animal == groom_animal:
            # Same animal is best
            result = MatchResult.PASS
            score = 1.0
        else:
            # Different animals but not enemies
            result = MatchResult.PASS
            score = 0.7
        
        return PortuthamResult(
            name="Yoni",
            tamil_name="யோனி",
            result=result,
            score=score,
            description=f"Bride: {bride_animal}, Groom: {groom_animal}. Evaluates physical compatibility.",
            is_essential=False
        )
    
    def _check_rashi_porutham(self, bride_rashi: int, groom_rashi: int) -> PortuthamResult:
        """Check Rashi Porutham (Moon sign compatibility)."""
        # Count from bride's rashi to groom's
        count = ((groom_rashi - bride_rashi) % 12) + 1
        
        # Inauspicious positions: 6, 8 (6/8 relationship)
        if count in {6, 8}:
            result = MatchResult.FAIL
            score = 0.0
        elif count in {1, 2, 3, 4, 5, 7, 9, 10, 11, 12}:
            result = MatchResult.PASS
            score = 1.0 if count in {1, 5, 7, 9} else 0.8
        else:
            result = MatchResult.PARTIAL
            score = 0.5
        
        return PortuthamResult(
            name="Rashi",
            tamil_name="ராசி",
            result=result,
            score=score,
            description=f"Moon sign relationship. Count from bride to groom: {count}",
            is_essential=False
        )
    
    def _check_rasiyathipathi(self, bride_rashi: int, groom_rashi: int) -> PortuthamResult:
        """Check Rasiyathipathi Porutham (Sign lord compatibility)."""
        # Rashi lords
        lords = {
            1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon",
            5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars",
            9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
        }
        
        bride_lord = lords[bride_rashi]
        groom_lord = lords[groom_rashi]
        
        # Friendship matrix (simplified)
        friends = {
            "Sun": {"Moon", "Mars", "Jupiter"},
            "Moon": {"Sun", "Mercury"},
            "Mars": {"Sun", "Moon", "Jupiter"},
            "Mercury": {"Sun", "Venus"},
            "Jupiter": {"Sun", "Moon", "Mars"},
            "Venus": {"Mercury", "Saturn"},
            "Saturn": {"Mercury", "Venus"},
        }
        
        if bride_lord == groom_lord:
            result = MatchResult.PASS
            score = 1.0
        elif groom_lord in friends.get(bride_lord, set()) and bride_lord in friends.get(groom_lord, set()):
            result = MatchResult.PASS
            score = 1.0
        elif groom_lord in friends.get(bride_lord, set()) or bride_lord in friends.get(groom_lord, set()):
            result = MatchResult.PARTIAL
            score = 0.5
        else:
            result = MatchResult.FAIL
            score = 0.0
        
        return PortuthamResult(
            name="Rasiyathipathi",
            tamil_name="ராசியாதிபதி",
            result=result,
            score=score,
            description=f"Sign lords - Bride: {bride_lord}, Groom: {groom_lord}",
            is_essential=False
        )
    
    def _check_vasya(self, bride_rashi: int, groom_rashi: int) -> PortuthamResult:
        """Check Vasya Porutham (Mutual attraction and control)."""
        bride_type = VASHYA_TYPES.get(bride_rashi, "Unknown")
        groom_type = VASHYA_TYPES.get(groom_rashi, "Unknown")
        
        # Vasya compatibility
        vasya_compat = {
            ("Chatushpad", "Chatushpad"): 1.0,
            ("Dwipad", "Dwipad"): 1.0,
            ("Dwipad", "Chatushpad"): 0.5,  # Human controls animal
            ("Jalachara", "Jalachara"): 1.0,
            ("Keeta", "Keeta"): 1.0,
        }
        
        score = vasya_compat.get((bride_type, groom_type), 0.0)
        if score == 0.0:
            score = vasya_compat.get((groom_type, bride_type), 0.25)
        
        result = MatchResult.PASS if score >= 0.5 else MatchResult.FAIL
        
        return PortuthamResult(
            name="Vasya",
            tamil_name="வஸ்யம்",
            result=result,
            score=score,
            description=f"Mutual attraction - Bride: {bride_type}, Groom: {groom_type}",
            is_essential=False
        )
    
    def _check_rajju(self, bride_nak: int, groom_nak: int) -> PortuthamResult:
        """Check Rajju Porutham (Essential - relates to marital cord)."""
        bride_rajju = NAKSHATRA_RAJJU.get(bride_nak, "Unknown")
        groom_rajju = NAKSHATRA_RAJJU.get(groom_nak, "Unknown")
        
        # Same Rajju is inauspicious (same body part)
        if bride_rajju == groom_rajju:
            result = MatchResult.FAIL
            score = 0.0
            description = f"Same Rajju ({bride_rajju}) - Inauspicious. May indicate difficulties."
        else:
            result = MatchResult.PASS
            score = 1.0
            description = f"Different Rajju (Bride: {bride_rajju}, Groom: {groom_rajju}) - Auspicious"
        
        return PortuthamResult(
            name="Rajju",
            tamil_name="ரஜ்ஜு",
            result=result,
            score=score,
            description=description,
            is_essential=True
        )
    
    def _check_vedha(self, bride_nak: int, groom_nak: int) -> PortuthamResult:
        """Check Vedha Porutham (Essential - mutual affliction)."""
        # Check if the pair is in Vedha
        is_vedha = False
        for pair in VEDHA_PAIRS:
            if (bride_nak, groom_nak) == pair or (groom_nak, bride_nak) == pair:
                is_vedha = True
                break
        
        if is_vedha:
            result = MatchResult.FAIL
            score = 0.0
            description = "Vedha exists between the nakshatras - Strong affliction"
        else:
            result = MatchResult.PASS
            score = 1.0
            description = "No Vedha - Clear of mutual affliction"
        
        return PortuthamResult(
            name="Vedha",
            tamil_name="வேதை",
            result=result,
            score=score,
            description=description,
            is_essential=True
        )
    
    # ============ North Indian Ashtakoota System ============
    
    def calculate_north_indian_match(
        self,
        bride_nakshatra: int,
        bride_rashi: int,
        groom_nakshatra: int,
        groom_rashi: int,
        apply_exceptions: bool = True
    ) -> NorthIndianMatchResult:
        """
        Calculate North Indian Ashtakoota (8 factors) Guna Milan.
        Maximum score is 36 points.
        
        Args:
            bride_nakshatra: Bride's nakshatra (1-27)
            bride_rashi: Bride's moon sign (1-12)
            groom_nakshatra: Groom's nakshatra (1-27)
            groom_rashi: Groom's moon sign (1-12)
            apply_exceptions: Whether to apply exception rules
        
        Returns:
            Complete Ashtakoota matching result
        """
        kootas = []
        exceptions = []
        
        # 1. Varna (Spiritual/Ego compatibility) - 1 point
        varna = self._check_varna_koota(bride_rashi, groom_rashi)
        kootas.append(varna)
        
        # 2. Vashya (Dominance) - 2 points
        vashya = self._check_vashya_koota(bride_rashi, groom_rashi)
        kootas.append(vashya)
        
        # 3. Tara (Birth star compatibility) - 3 points
        tara = self._check_tara_koota(bride_nakshatra, groom_nakshatra)
        kootas.append(tara)
        
        # 4. Yoni (Sexual compatibility) - 4 points
        yoni = self._check_yoni_koota(bride_nakshatra, groom_nakshatra)
        kootas.append(yoni)
        
        # 5. Graha Maitri (Mental compatibility) - 5 points
        maitri = self._check_graha_maitri_koota(bride_rashi, groom_rashi)
        kootas.append(maitri)
        
        # 6. Gana (Temperament) - 6 points
        gana = self._check_gana_koota(bride_nakshatra, groom_nakshatra)
        kootas.append(gana)
        
        # 7. Bhakoot (Rashi lord compatibility) - 7 points
        bhakoot = self._check_bhakoot_koota(bride_rashi, groom_rashi)
        kootas.append(bhakoot)
        
        # 8. Nadi (Health/genes) - 8 points (most important)
        nadi = self._check_nadi_koota(bride_nakshatra, groom_nakshatra)
        kootas.append(nadi)
        
        # Calculate totals
        total_points = sum(k.scored_points for k in kootas)
        max_points = 36
        percentage = (total_points / max_points) * 100
        
        # Check for doshas
        nadi_dosha = nadi.scored_points == 0
        bhakoot_dosha = bhakoot.scored_points == 0
        
        # Apply exceptions if enabled
        if apply_exceptions:
            if nadi_dosha:
                # Nadi dosha exceptions
                if bride_rashi == groom_rashi and bride_nakshatra != groom_nakshatra:
                    exceptions.append("Nadi dosha cancelled: Same rashi, different nakshatra")
                    nadi_dosha = False
                    # Add back partial points
                    for k in kootas:
                        if k.name == "Nadi":
                            k.scored_points = 4.0
                            total_points += 4.0
        
        # Determine recommendation
        if percentage >= 75:
            recommendation = "Excellent Match - Highly recommended"
        elif percentage >= 60:
            recommendation = "Good Match - Compatible with minor adjustments"
        elif percentage >= 50:
            recommendation = "Average Match - Some challenges expected"
        elif percentage >= 36:
            recommendation = "Below Average - Significant compatibility issues"
        else:
            recommendation = "Not Recommended - Major incompatibilities"
        
        # Override if critical doshas
        if nadi_dosha and bhakoot_dosha:
            recommendation = "Caution Advised - Both Nadi and Bhakoot doshas present"
        
        return NorthIndianMatchResult(
            kootas=kootas,
            total_points=total_points,
            max_points=max_points,
            percentage=percentage,
            overall_recommendation=recommendation,
            nadi_dosha=nadi_dosha,
            bhakoot_dosha=bhakoot_dosha,
            exceptions_applied=exceptions
        )
    
    def _check_varna_koota(self, bride_rashi: int, groom_rashi: int) -> AshtakootaResult:
        """Check Varna Koota (1 point max)."""
        bride_varna = RASHI_VARNA.get(bride_rashi, 1)
        groom_varna = RASHI_VARNA.get(groom_rashi, 1)
        
        varna_names = {1: "Shudra", 2: "Vaishya", 3: "Kshatriya", 4: "Brahmin"}
        
        # Groom's varna should be equal or higher
        if groom_varna >= bride_varna:
            points = 1.0
        else:
            points = 0.0
        
        return AshtakootaResult(
            name="Varna",
            hindi_name="वर्ण",
            max_points=1,
            scored_points=points,
            description="Spiritual and ego compatibility",
            details={
                "bride_varna": varna_names[bride_varna],
                "groom_varna": varna_names[groom_varna]
            }
        )
    
    def _check_vashya_koota(self, bride_rashi: int, groom_rashi: int) -> AshtakootaResult:
        """Check Vashya Koota (2 points max)."""
        bride_type = VASHYA_TYPES.get(bride_rashi, "Unknown")
        groom_type = VASHYA_TYPES.get(groom_rashi, "Unknown")
        
        # Scoring based on compatibility
        if bride_type == groom_type:
            points = 2.0
        elif (bride_type == "Dwipad" and groom_type == "Chatushpad") or \
             (bride_type == "Chatushpad" and groom_type == "Dwipad"):
            points = 1.0
        elif "Keeta" in [bride_type, groom_type]:
            points = 0.0
        else:
            points = 0.5
        
        return AshtakootaResult(
            name="Vashya",
            hindi_name="वश्य",
            max_points=2,
            scored_points=points,
            description="Mutual attraction and influence",
            details={
                "bride_type": bride_type,
                "groom_type": groom_type
            }
        )
    
    def _check_tara_koota(self, bride_nak: int, groom_nak: int) -> AshtakootaResult:
        """Check Tara Koota (3 points max)."""
        # Count from groom to bride and bride to groom
        count1 = ((bride_nak - groom_nak) % 27) + 1
        count2 = ((groom_nak - bride_nak) % 27) + 1
        
        # Calculate tara position (1-9 cycle)
        tara1 = ((count1 - 1) % 9) + 1
        tara2 = ((count2 - 1) % 9) + 1
        
        # Inauspicious taras: 3 (Vipat), 5 (Pratyak), 7 (Naidhana)
        inauspicious = {3, 5, 7}
        
        if tara1 not in inauspicious and tara2 not in inauspicious:
            points = 3.0
        elif tara1 in inauspicious and tara2 in inauspicious:
            points = 0.0
        else:
            points = 1.5
        
        return AshtakootaResult(
            name="Tara",
            hindi_name="तारा",
            max_points=3,
            scored_points=points,
            description="Birth star compatibility and destiny",
            details={
                "tara_from_groom": tara1,
                "tara_from_bride": tara2
            }
        )
    
    def _check_yoni_koota(self, bride_nak: int, groom_nak: int) -> AshtakootaResult:
        """Check Yoni Koota (4 points max)."""
        bride_yoni = NAKSHATRA_YONI.get(bride_nak, ("Unknown", "M"))
        groom_yoni = NAKSHATRA_YONI.get(groom_nak, ("Unknown", "M"))
        
        bride_animal, bride_gender = bride_yoni
        groom_animal, groom_gender = groom_yoni
        
        # Check enemies
        if (bride_animal, groom_animal) in YONI_ENEMIES or \
           (groom_animal, bride_animal) in YONI_ENEMIES:
            points = 0.0
        elif bride_animal == groom_animal:
            # Same animal
            if bride_gender != groom_gender:
                points = 4.0  # Opposite gender of same animal - best
            else:
                points = 3.0  # Same gender of same animal
        else:
            # Different animals, not enemies
            points = 2.0
        
        return AshtakootaResult(
            name="Yoni",
            hindi_name="योनि",
            max_points=4,
            scored_points=points,
            description="Physical and sexual compatibility",
            details={
                "bride_yoni": f"{bride_animal} ({bride_gender})",
                "groom_yoni": f"{groom_animal} ({groom_gender})"
            }
        )
    
    def _check_graha_maitri_koota(self, bride_rashi: int, groom_rashi: int) -> AshtakootaResult:
        """Check Graha Maitri Koota (5 points max)."""
        lords = {
            1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon",
            5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars",
            9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
        }
        
        # Planet friendship scores
        friendship = {
            ("Sun", "Moon"): 5, ("Sun", "Mars"): 5, ("Sun", "Jupiter"): 5,
            ("Moon", "Sun"): 5, ("Moon", "Mercury"): 4,
            ("Mars", "Sun"): 5, ("Mars", "Moon"): 5, ("Mars", "Jupiter"): 5,
            ("Mercury", "Sun"): 4, ("Mercury", "Venus"): 5,
            ("Jupiter", "Sun"): 5, ("Jupiter", "Moon"): 5, ("Jupiter", "Mars"): 5,
            ("Venus", "Mercury"): 5, ("Venus", "Saturn"): 5,
            ("Saturn", "Mercury"): 4, ("Saturn", "Venus"): 5,
        }
        
        bride_lord = lords[bride_rashi]
        groom_lord = lords[groom_rashi]
        
        if bride_lord == groom_lord:
            points = 5.0
        else:
            pair1 = (bride_lord, groom_lord)
            pair2 = (groom_lord, bride_lord)
            score1 = friendship.get(pair1, 0)
            score2 = friendship.get(pair2, 0)
            points = max(score1, score2, 0)
        
        return AshtakootaResult(
            name="Graha Maitri",
            hindi_name="ग्रह मैत्री",
            max_points=5,
            scored_points=float(points),
            description="Mental compatibility and friendship",
            details={
                "bride_lord": bride_lord,
                "groom_lord": groom_lord
            }
        )
    
    def _check_gana_koota(self, bride_nak: int, groom_nak: int) -> AshtakootaResult:
        """Check Gana Koota (6 points max)."""
        bride_gana = NAKSHATRA_GANA.get(bride_nak, 2)
        groom_gana = NAKSHATRA_GANA.get(groom_nak, 2)
        
        gana_names = {1: "Deva", 2: "Manushya", 3: "Rakshasa"}
        
        # Gana compatibility matrix
        gana_matrix = {
            (1, 1): 6, (1, 2): 5, (1, 3): 1,
            (2, 1): 3, (2, 2): 6, (2, 3): 0,
            (3, 1): 1, (3, 2): 0, (3, 3): 6,
        }
        
        points = gana_matrix.get((bride_gana, groom_gana), 0)
        
        return AshtakootaResult(
            name="Gana",
            hindi_name="गण",
            max_points=6,
            scored_points=float(points),
            description="Temperament and character compatibility",
            details={
                "bride_gana": gana_names[bride_gana],
                "groom_gana": gana_names[groom_gana]
            }
        )
    
    def _check_bhakoot_koota(self, bride_rashi: int, groom_rashi: int) -> AshtakootaResult:
        """Check Bhakoot Koota (7 points max)."""
        # Count from bride to groom
        count = ((groom_rashi - bride_rashi) % 12) + 1
        
        # Inauspicious combinations: 2/12, 5/9, 6/8
        inauspicious_pairs = {(2, 12), (12, 2), (5, 9), (9, 5), (6, 8), (8, 6)}
        
        reverse_count = ((bride_rashi - groom_rashi) % 12) + 1
        
        if (count, reverse_count) in inauspicious_pairs or count in {6, 8}:
            points = 0.0
            dosha = True
        else:
            points = 7.0
            dosha = False
        
        return AshtakootaResult(
            name="Bhakoot",
            hindi_name="भकूट",
            max_points=7,
            scored_points=points,
            description="Family welfare and financial prosperity",
            details={
                "position": count,
                "reverse_position": reverse_count,
                "has_dosha": dosha
            }
        )
    
    def _check_nadi_koota(self, bride_nak: int, groom_nak: int) -> AshtakootaResult:
        """Check Nadi Koota (8 points max) - Most important."""
        bride_nadi = NAKSHATRA_NADI.get(bride_nak, 1)
        groom_nadi = NAKSHATRA_NADI.get(groom_nak, 1)
        
        nadi_names = {1: "Aadi (Vata)", 2: "Madhya (Pitta)", 3: "Antya (Kapha)"}
        
        # Same nadi is inauspicious (Nadi Dosha)
        if bride_nadi == groom_nadi:
            points = 0.0
            has_dosha = True
        else:
            points = 8.0
            has_dosha = False
        
        return AshtakootaResult(
            name="Nadi",
            hindi_name="नाड़ी",
            max_points=8,
            scored_points=points,
            description="Health, genes, and progeny",
            details={
                "bride_nadi": nadi_names[bride_nadi],
                "groom_nadi": nadi_names[groom_nadi],
                "has_dosha": has_dosha
            }
        )


# Singleton instance
_matchmaking_service: Optional[MatchmakingService] = None


def get_matchmaking_service() -> MatchmakingService:
    """Get matchmaking service instance."""
    global _matchmaking_service
    if _matchmaking_service is None:
        _matchmaking_service = MatchmakingService()
    return _matchmaking_service
