"""
Jyotish Platform - Configuration Settings
"""
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Application
    app_name: str = "Jyotish Platform"
    app_version: str = "1.0.0"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    
    # Security
    secret_key: str = Field(default="change-me-in-production-12345", alias="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    refresh_token_expire_days: int = 30
    
    # Database
    database_url: str = Field(default="", alias="DATABASE_URL")
    db_pool_size: int = 5
    db_max_overflow: int = 10
    
    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    cache_ttl_seconds: int = 3600  # 1 hour default
    
    # CORS
    cors_origins: str = Field(
        default="http://localhost:3000",
        alias="CORS_ORIGINS"
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    # Ephemeris
    ephemeris_path: str = Field(
        default="/app/.cache/ephemeris",
        alias="EPHEMERIS_PATH"
    )
    default_ayanamsa: str = "lahiri"  # Chitrapaksha ayanamsa
    
    # Geocoding
    nominatim_user_agent: str = "jyotish-platform/1.0"
    geocode_cache_ttl: int = 86400 * 30  # 30 days
    
    # Stripe
    stripe_secret_key: Optional[str] = Field(default=None, alias="STRIPE_SECRET_KEY")
    stripe_webhook_secret: Optional[str] = Field(default=None, alias="STRIPE_WEBHOOK_SECRET")
    stripe_price_premium_monthly: Optional[str] = None
    stripe_price_premium_yearly: Optional[str] = None
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    api_rate_limit_per_minute: int = 100
    
    # PDF Generation
    pdf_temp_dir: str = "/tmp/jyotish_pdfs"
    
    # Email (for notifications)
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    from_email: str = "noreply@jyotish.app"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Ayanamsa options supported by the platform
AYANAMSA_OPTIONS = {
    "lahiri": {
        "code": 1,  # Swiss Ephemeris code
        "name": "Lahiri (Chitrapaksha)",
        "description": "Most commonly used in India. Based on spica at 0° Libra."
    },
    "raman": {
        "code": 3,
        "name": "B.V. Raman",
        "description": "Popular alternative, slightly different from Lahiri."
    },
    "krishnamurti": {
        "code": 5,
        "name": "Krishnamurti (KP)",
        "description": "Used in KP astrology system."
    },
    "yukteshwar": {
        "code": 7,
        "name": "Sri Yukteshwar",
        "description": "Based on the teachings of Sri Yukteshwar."
    },
    "true_chitrapaksha": {
        "code": 27,
        "name": "True Chitrapaksha",
        "description": "Dynamically calculated based on Spica's true position."
    },
}

# Nakshatra data
NAKSHATRAS = [
    {"index": 1, "name": "Ashwini", "deity": "Ashwini Kumaras", "ruler": "Ketu", "symbol": "Horse head"},
    {"index": 2, "name": "Bharani", "deity": "Yama", "ruler": "Venus", "symbol": "Yoni"},
    {"index": 3, "name": "Krittika", "deity": "Agni", "ruler": "Sun", "symbol": "Razor"},
    {"index": 4, "name": "Rohini", "deity": "Brahma", "ruler": "Moon", "symbol": "Chariot"},
    {"index": 5, "name": "Mrigashira", "deity": "Soma", "ruler": "Mars", "symbol": "Deer head"},
    {"index": 6, "name": "Ardra", "deity": "Rudra", "ruler": "Rahu", "symbol": "Teardrop"},
    {"index": 7, "name": "Punarvasu", "deity": "Aditi", "ruler": "Jupiter", "symbol": "Bow"},
    {"index": 8, "name": "Pushya", "deity": "Brihaspati", "ruler": "Saturn", "symbol": "Flower"},
    {"index": 9, "name": "Ashlesha", "deity": "Sarpa", "ruler": "Mercury", "symbol": "Serpent"},
    {"index": 10, "name": "Magha", "deity": "Pitris", "ruler": "Ketu", "symbol": "Throne"},
    {"index": 11, "name": "Purva Phalguni", "deity": "Bhaga", "ruler": "Venus", "symbol": "Hammock"},
    {"index": 12, "name": "Uttara Phalguni", "deity": "Aryaman", "ruler": "Sun", "symbol": "Bed"},
    {"index": 13, "name": "Hasta", "deity": "Savitar", "ruler": "Moon", "symbol": "Hand"},
    {"index": 14, "name": "Chitra", "deity": "Vishwakarma", "ruler": "Mars", "symbol": "Pearl"},
    {"index": 15, "name": "Swati", "deity": "Vayu", "ruler": "Rahu", "symbol": "Coral"},
    {"index": 16, "name": "Vishakha", "deity": "Indra-Agni", "ruler": "Jupiter", "symbol": "Archway"},
    {"index": 17, "name": "Anuradha", "deity": "Mitra", "ruler": "Saturn", "symbol": "Lotus"},
    {"index": 18, "name": "Jyeshtha", "deity": "Indra", "ruler": "Mercury", "symbol": "Earring"},
    {"index": 19, "name": "Mula", "deity": "Nirrti", "ruler": "Ketu", "symbol": "Root"},
    {"index": 20, "name": "Purva Ashadha", "deity": "Apas", "ruler": "Venus", "symbol": "Fan"},
    {"index": 21, "name": "Uttara Ashadha", "deity": "Vishvedevas", "ruler": "Sun", "symbol": "Tusk"},
    {"index": 22, "name": "Shravana", "deity": "Vishnu", "ruler": "Moon", "symbol": "Ear"},
    {"index": 23, "name": "Dhanishta", "deity": "Vasus", "ruler": "Mars", "symbol": "Drum"},
    {"index": 24, "name": "Shatabhisha", "deity": "Varuna", "ruler": "Rahu", "symbol": "Circle"},
    {"index": 25, "name": "Purva Bhadrapada", "deity": "Aja Ekapada", "ruler": "Jupiter", "symbol": "Sword"},
    {"index": 26, "name": "Uttara Bhadrapada", "deity": "Ahir Budhnya", "ruler": "Saturn", "symbol": "Twin"},
    {"index": 27, "name": "Revati", "deity": "Pushan", "ruler": "Mercury", "symbol": "Fish"},
]

# Zodiac signs (Rashis)
RASHIS = [
    {"index": 1, "name": "Mesha", "english": "Aries", "element": "Fire", "ruler": "Mars", "symbol": "♈"},
    {"index": 2, "name": "Vrishabha", "english": "Taurus", "element": "Earth", "ruler": "Venus", "symbol": "♉"},
    {"index": 3, "name": "Mithuna", "english": "Gemini", "element": "Air", "ruler": "Mercury", "symbol": "♊"},
    {"index": 4, "name": "Karka", "english": "Cancer", "element": "Water", "ruler": "Moon", "symbol": "♋"},
    {"index": 5, "name": "Simha", "english": "Leo", "element": "Fire", "ruler": "Sun", "symbol": "♌"},
    {"index": 6, "name": "Kanya", "english": "Virgo", "element": "Earth", "ruler": "Mercury", "symbol": "♍"},
    {"index": 7, "name": "Tula", "english": "Libra", "element": "Air", "ruler": "Venus", "symbol": "♎"},
    {"index": 8, "name": "Vrishchika", "english": "Scorpio", "element": "Water", "ruler": "Mars", "symbol": "♏"},
    {"index": 9, "name": "Dhanu", "english": "Sagittarius", "element": "Fire", "ruler": "Jupiter", "symbol": "♐"},
    {"index": 10, "name": "Makara", "english": "Capricorn", "element": "Earth", "ruler": "Saturn", "symbol": "♑"},
    {"index": 11, "name": "Kumbha", "english": "Aquarius", "element": "Air", "ruler": "Saturn", "symbol": "♒"},
    {"index": 12, "name": "Meena", "english": "Pisces", "element": "Water", "ruler": "Jupiter", "symbol": "♓"},
]

# Planets (Grahas)
GRAHAS = [
    {"index": 0, "name": "Surya", "english": "Sun", "symbol": "☉", "swe_id": 0},
    {"index": 1, "name": "Chandra", "english": "Moon", "symbol": "☽", "swe_id": 1},
    {"index": 2, "name": "Mangal", "english": "Mars", "symbol": "♂", "swe_id": 4},
    {"index": 3, "name": "Budha", "english": "Mercury", "symbol": "☿", "swe_id": 2},
    {"index": 4, "name": "Guru", "english": "Jupiter", "symbol": "♃", "swe_id": 5},
    {"index": 5, "name": "Shukra", "english": "Venus", "symbol": "♀", "swe_id": 3},
    {"index": 6, "name": "Shani", "english": "Saturn", "symbol": "♄", "swe_id": 6},
    {"index": 7, "name": "Rahu", "english": "North Node", "symbol": "☊", "swe_id": 11},
    {"index": 8, "name": "Ketu", "english": "South Node", "symbol": "☋", "swe_id": 11},  # Calculated from Rahu
]

# Vimshottari Dasha periods in years
VIMSHOTTARI_PERIODS = {
    "Ketu": 7,
    "Venus": 20,
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17,
}

# Dasha sequence
VIMSHOTTARI_SEQUENCE = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", 
    "Rahu", "Jupiter", "Saturn", "Mercury"
]
