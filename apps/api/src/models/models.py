"""
Jyotish Platform - Database Models
"""
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, Text, JSON, 
    ForeignKey, Enum, Index, LargeBinary, BigInteger
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

from src.core.database import Base


# Enums
class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PREMIUM = "premium"
    PROFESSIONAL = "professional"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"


class ReportType(str, enum.Enum):
    BIRTH_CHART = "birth_chart"
    COMPATIBILITY = "compatibility"
    DASHA = "dasha"
    TRANSIT = "transit"
    YEARLY = "yearly"
    COMPREHENSIVE = "comprehensive"


class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


# Mixin for timestamps
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )


# User Model
class User(Base, TimestampMixin):
    """User account model."""
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Account status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Subscription
    subscription_tier: Mapped[SubscriptionTier] = mapped_column(
        Enum(SubscriptionTier), 
        default=SubscriptionTier.FREE
    )
    
    # OAuth providers
    google_id: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Preferences
    preferences: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    
    # Relationships
    profiles: Mapped[List["BirthProfile"]] = relationship(
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    subscription: Mapped[Optional["Subscription"]] = relationship(
        back_populates="user",
        uselist=False
    )
    reports: Mapped[List["Report"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )
    api_keys: Mapped[List["ApiKey"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )


# Birth Profile Model
class BirthProfile(Base, TimestampMixin):
    """
    Saved birth profile with encrypted birth data.
    """
    __tablename__ = "birth_profiles"
    __table_args__ = {"schema": "astro"}
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        index=True
    )
    
    # Display name for the profile
    name: Mapped[str] = mapped_column(String(255))
    
    # Encrypted birth data (datetime, location)
    encrypted_data: Mapped[bytes] = mapped_column(LargeBinary)
    encrypted_dek: Mapped[bytes] = mapped_column(LargeBinary)  # Data encryption key
    
    # Public metadata (not encrypted, for display/sorting)
    birth_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    birth_place: Mapped[str] = mapped_column(String(500))  # City/location name
    
    # Cached chart data (can be regenerated from encrypted data)
    moon_sign: Mapped[Optional[str]] = mapped_column(String(50))
    sun_sign: Mapped[Optional[str]] = mapped_column(String(50))
    ascendant_sign: Mapped[Optional[str]] = mapped_column(String(50))
    moon_nakshatra: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Profile type
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    relationship: Mapped[Optional[str]] = mapped_column(String(100))  # self, spouse, child, etc.
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="profiles")


# Subscription Model
class Subscription(Base, TimestampMixin):
    """User subscription details."""
    __tablename__ = "subscriptions"
    __table_args__ = {"schema": "billing"}
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        unique=True
    )
    
    # Stripe integration
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255))
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255))
    stripe_price_id: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Subscription details
    tier: Mapped[SubscriptionTier] = mapped_column(Enum(SubscriptionTier))
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.ACTIVE
    )
    
    # Billing period
    current_period_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    current_period_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="subscription")


# Report Model
class Report(Base, TimestampMixin):
    """Generated PDF reports."""
    __tablename__ = "reports"
    __table_args__ = {"schema": "astro"}
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        index=True
    )
    
    # Report details
    report_type: Mapped[ReportType] = mapped_column(Enum(ReportType))
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus),
        default=ReportStatus.PENDING
    )
    
    # Report configuration
    config: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # File storage
    file_path: Mapped[Optional[str]] = mapped_column(String(500))
    file_size: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Processing
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="reports")


# API Key Model
class ApiKey(Base, TimestampMixin):
    """Developer API keys."""
    __tablename__ = "api_keys"
    __table_args__ = {"schema": "api"}
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        index=True
    )
    
    # Key identification
    name: Mapped[str] = mapped_column(String(255))
    key_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    key_prefix: Mapped[str] = mapped_column(String(20))  # First chars for identification
    
    # Permissions and limits
    scopes: Mapped[list] = mapped_column(JSON, default=list)  # ['read', 'write', 'reports']
    rate_limit: Mapped[int] = mapped_column(Integer, default=100)  # requests per minute
    monthly_quota: Mapped[int] = mapped_column(Integer, default=10000)
    
    # Usage tracking
    requests_this_month: Mapped[int] = mapped_column(BigInteger, default=0)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="api_keys")


# API Usage Log
class ApiUsageLog(Base):
    """API usage tracking for billing and analytics."""
    __tablename__ = "api_usage_logs"
    __table_args__ = (
        Index('ix_api_usage_api_key_created', 'api_key_id', 'created_at'),
        {"schema": "api"}
    )
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    api_key_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("api.api_keys.id", ondelete="CASCADE"),
        index=True
    )
    
    endpoint: Mapped[str] = mapped_column(String(255))
    method: Mapped[str] = mapped_column(String(10))
    status_code: Mapped[int] = mapped_column(Integer)
    response_time_ms: Mapped[int] = mapped_column(Integer)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


# Saved Matchmaking Comparison
class MatchComparison(Base, TimestampMixin):
    """Saved matchmaking comparisons between two profiles."""
    __tablename__ = "match_comparisons"
    __table_args__ = {"schema": "astro"}
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        index=True
    )
    
    # Can reference saved profiles or use one-time data
    profile1_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("astro.birth_profiles.id", ondelete="SET NULL"),
        nullable=True
    )
    profile2_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("astro.birth_profiles.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # One-time profile data (if not using saved profiles)
    profile1_data: Mapped[Optional[dict]] = mapped_column(JSON)
    profile2_data: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Cached results
    porutham_result: Mapped[Optional[dict]] = mapped_column(JSON)
    ashtakoota_result: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Comparison metadata
    name: Mapped[Optional[str]] = mapped_column(String(255))
    notes: Mapped[Optional[str]] = mapped_column(Text)


# Horoscope Cache
class HoroscopeCache(Base):
    """Cached horoscope content by sign and date."""
    __tablename__ = "horoscope_cache"
    __table_args__ = (
        Index('ix_horoscope_unique', 'sign', 'horoscope_type', 'date', unique=True),
        {"schema": "astro"}
    )
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    sign: Mapped[str] = mapped_column(String(20))  # rashi name
    horoscope_type: Mapped[str] = mapped_column(String(20))  # daily, weekly, monthly, yearly
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    content: Mapped[dict] = mapped_column(JSON)  # Structured horoscope data
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
