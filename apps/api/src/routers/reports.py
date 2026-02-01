"""
Jyotish Platform - Reports Router
Generate and manage PDF astrology reports
"""
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, Path, Depends, status, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field
from enum import Enum

from src.core.security import get_current_user
from src.core.database import get_db
from src.models.models import User, Report, BirthProfile, ReportType, ReportStatus, SubscriptionTier
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func


router = APIRouter()


# Dependency to get current user from database
async def get_current_user_from_db(
    token_payload: dict = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get full User model from database using token payload."""
    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    result = await db.execute(
        select(User).where(User.id == UUID(user_id))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    return user


# Request/Response Models
class BirthDetailsInput(BaseModel):
    """Birth details for one-time report generation."""
    name: str = Field(..., description="Name for the report")
    birth_datetime: datetime
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone_offset: float = Field(..., ge=-12, le=14)
    birth_place: str


class ReportCreateRequest(BaseModel):
    """Request to create a new report."""
    report_type: str = Field(..., description="Type of report")
    
    # Option 1: Use saved profile
    profile_id: Optional[UUID] = Field(None, description="Saved profile ID")
    
    # Option 2: Provide birth details directly
    birth_details: Optional[BirthDetailsInput] = None
    
    # For compatibility reports
    partner_profile_id: Optional[UUID] = None
    partner_birth_details: Optional[BirthDetailsInput] = None
    
    # Report options
    include_remedies: bool = Field(True, description="Include remedial measures")
    include_gemstones: bool = Field(True, description="Include gemstone recommendations")
    include_mantras: bool = Field(False, description="Include mantra recommendations")
    language: str = Field("en", description="Report language (en, hi, ta, te)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "report_type": "birth_chart",
                "profile_id": "123e4567-e89b-12d3-a456-426614174000",
                "include_remedies": True,
                "include_gemstones": True,
                "language": "en"
            }
        }


class ReportResponse(BaseModel):
    """Report response model."""
    id: UUID
    report_type: str
    status: str
    
    created_at: datetime
    completed_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    file_size: Optional[int]
    download_url: Optional[str]
    
    config: dict


class ReportListResponse(BaseModel):
    """Response for report listing."""
    reports: List[ReportResponse]
    total: int
    page: int
    page_size: int


class ReportTypeInfo(BaseModel):
    """Information about a report type."""
    type: str
    name: str
    description: str
    price_usd: float
    pages_estimate: str
    generation_time: str
    features: List[str]


# Report type definitions
REPORT_TYPES = {
    "birth_chart": {
        "name": "Birth Chart Report",
        "description": "Comprehensive analysis of your birth chart including planets, houses, aspects, and predictions.",
        "price_usd": 9.99,
        "pages_estimate": "15-20 pages",
        "generation_time": "2-3 minutes",
        "features": [
            "Planet positions and significations",
            "House analysis",
            "Nakshatra insights",
            "Personality analysis",
            "Strengths and challenges",
        ],
        "premium_only": False,
    },
    "compatibility": {
        "name": "Compatibility Report",
        "description": "Detailed marriage compatibility analysis using both Porutham and Ashtakoota systems.",
        "price_usd": 14.99,
        "pages_estimate": "20-25 pages",
        "generation_time": "3-4 minutes",
        "features": [
            "10 Porutham analysis",
            "36-point Ashtakoota",
            "Dosha analysis",
            "Remedies for doshas",
            "Long-term compatibility forecast",
        ],
        "premium_only": False,
    },
    "dasha": {
        "name": "Dasha Analysis Report",
        "description": "Detailed Vimshottari Dasha analysis for the next 20 years.",
        "price_usd": 12.99,
        "pages_estimate": "25-30 pages",
        "generation_time": "2-3 minutes",
        "features": [
            "Current dasha analysis",
            "Upcoming dasha periods",
            "Antardasha breakdown",
            "Predictions for each period",
            "Favorable and challenging times",
        ],
        "premium_only": False,
    },
    "transit": {
        "name": "Transit Report",
        "description": "Analysis of current planetary transits and their effects on your chart.",
        "price_usd": 7.99,
        "pages_estimate": "10-15 pages",
        "generation_time": "1-2 minutes",
        "features": [
            "Current planetary positions",
            "Transit effects on natal planets",
            "Sade Sati analysis",
            "Monthly predictions",
            "Important dates",
        ],
        "premium_only": False,
    },
    "yearly": {
        "name": "Yearly Forecast",
        "description": "Comprehensive predictions for the year ahead.",
        "price_usd": 19.99,
        "pages_estimate": "30-40 pages",
        "generation_time": "4-5 minutes",
        "features": [
            "Month-by-month predictions",
            "Career and finance forecast",
            "Relationship predictions",
            "Health outlook",
            "Auspicious dates",
            "Remedial measures",
        ],
        "premium_only": True,
    },
    "comprehensive": {
        "name": "Comprehensive Life Report",
        "description": "Complete life analysis covering all aspects with detailed predictions.",
        "price_usd": 49.99,
        "pages_estimate": "60-80 pages",
        "generation_time": "8-10 minutes",
        "features": [
            "Full birth chart analysis",
            "All divisional charts",
            "Complete dasha analysis",
            "Career and profession",
            "Marriage and relationships",
            "Health and longevity",
            "Wealth and prosperity",
            "Spiritual growth",
            "Comprehensive remedies",
        ],
        "premium_only": True,
    },
}


# Helper functions
async def get_report_or_404(
    report_id: UUID,
    user_id: UUID,
    db: AsyncSession
) -> Report:
    """Get report by ID, ensuring it belongs to the user."""
    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.user_id == user_id
        )
    )
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return report


def generate_report_pdf(report_id: UUID, report_type: str, config: dict):
    """
    Background task to generate PDF report.
    In production, this would be a Celery task.
    """
    # This would:
    # 1. Load birth data
    # 2. Calculate all required chart data
    # 3. Generate HTML from templates
    # 4. Convert to PDF using WeasyPrint
    # 5. Upload to storage
    # 6. Update report status
    pass


# Endpoints
@router.get("/types", response_model=List[ReportTypeInfo])
async def list_report_types(
    current_user: User = Depends(get_current_user_from_db),
):
    """
    List all available report types with pricing and features.
    """
    types = []
    for type_key, info in REPORT_TYPES.items():
        # Check if user can access premium reports
        is_premium = current_user.subscription_tier.value != "free"
        if info["premium_only"] and not is_premium:
            continue
        
        types.append(ReportTypeInfo(
            type=type_key,
            name=info["name"],
            description=info["description"],
            price_usd=info["price_usd"],
            pages_estimate=info["pages_estimate"],
            generation_time=info["generation_time"],
            features=info["features"],
        ))
    
    return types


@router.get("", response_model=ReportListResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    report_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    List all reports for the current user.
    """
    query = select(Report).where(Report.user_id == current_user.id)
    
    if report_type:
        try:
            rt = ReportType(report_type)
            query = query.where(Report.report_type == rt)
        except ValueError:
            pass
    
    if status:
        try:
            rs = ReportStatus(status)
            query = query.where(Report.status == rs)
        except ValueError:
            pass
    
    # Count
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Paginate
    query = query.order_by(Report.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    reports = result.scalars().all()
    
    return ReportListResponse(
        reports=[
            ReportResponse(
                id=r.id,
                report_type=r.report_type.value,
                status=r.status.value,
                created_at=r.created_at,
                completed_at=r.completed_at,
                expires_at=r.expires_at,
                file_size=r.file_size,
                download_url=f"/api/v1/reports/{r.id}/download" if r.status == ReportStatus.COMPLETED else None,
                config=r.config,
            )
            for r in reports
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ReportResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_report(
    request: ReportCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Request a new report generation.
    
    You can either:
    1. Provide a saved profile_id
    2. Provide birth_details directly
    
    For compatibility reports, also provide partner details.
    """
    # Validate report type
    if request.report_type not in REPORT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid report type. Must be one of: {list(REPORT_TYPES.keys())}"
        )
    
    report_info = REPORT_TYPES[request.report_type]
    
    # Check premium access
    is_premium = current_user.subscription_tier.value != "free"
    if report_info["premium_only"] and not is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This report type requires a premium subscription"
        )
    
    # Validate birth data source
    if not request.profile_id and not request.birth_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either profile_id or birth_details must be provided"
        )
    
    # If using profile, verify it exists
    if request.profile_id:
        result = await db.execute(
            select(BirthProfile).where(
                BirthProfile.id == request.profile_id,
                BirthProfile.user_id == current_user.id
            )
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
    
    # For compatibility reports, validate partner data
    if request.report_type == "compatibility":
        if not request.partner_profile_id and not request.partner_birth_details:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Partner details required for compatibility report"
            )
    
    # Check daily report limit
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    count_result = await db.execute(
        select(func.count()).where(
            Report.user_id == current_user.id,
            Report.created_at >= today_start
        )
    )
    today_count = count_result.scalar()
    
    daily_limit = 10 if is_premium else 3
    if today_count >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily report limit reached ({daily_limit}). Try again tomorrow."
        )
    
    # Build config
    config = {
        "profile_id": str(request.profile_id) if request.profile_id else None,
        "birth_details": request.birth_details.model_dump() if request.birth_details else None,
        "partner_profile_id": str(request.partner_profile_id) if request.partner_profile_id else None,
        "partner_birth_details": request.partner_birth_details.model_dump() if request.partner_birth_details else None,
        "include_remedies": request.include_remedies,
        "include_gemstones": request.include_gemstones,
        "include_mantras": request.include_mantras,
        "language": request.language,
    }
    
    # Create report record
    report = Report(
        user_id=current_user.id,
        report_type=ReportType(request.report_type),
        status=ReportStatus.PENDING,
        config=config,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    
    db.add(report)
    await db.commit()
    await db.refresh(report)
    
    # Queue background generation
    background_tasks.add_task(generate_report_pdf, report.id, request.report_type, config)
    
    return ReportResponse(
        id=report.id,
        report_type=report.report_type.value,
        status=report.status.value,
        created_at=report.created_at,
        completed_at=report.completed_at,
        expires_at=report.expires_at,
        file_size=report.file_size,
        download_url=None,
        config=report.config,
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: UUID = Path(..., description="Report ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Get report status and details.
    """
    report = await get_report_or_404(report_id, current_user.id, db)
    
    return ReportResponse(
        id=report.id,
        report_type=report.report_type.value,
        status=report.status.value,
        created_at=report.created_at,
        completed_at=report.completed_at,
        expires_at=report.expires_at,
        file_size=report.file_size,
        download_url=f"/api/v1/reports/{report.id}/download" if report.status == ReportStatus.COMPLETED else None,
        config=report.config,
    )


@router.get("/{report_id}/download")
async def download_report(
    report_id: UUID = Path(..., description="Report ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Download the generated PDF report.
    """
    report = await get_report_or_404(report_id, current_user.id, db)
    
    if report.status != ReportStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Report is not ready. Current status: {report.status.value}"
        )
    
    if report.expires_at and report.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Report has expired. Please generate a new one."
        )
    
    if not report.file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file not found"
        )
    
    # In production, this would stream from cloud storage
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=f"jyotish-{report.report_type.value}-{report.id}.pdf"
    )


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: UUID = Path(..., description="Report ID"),
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a report.
    """
    report = await get_report_or_404(report_id, current_user.id, db)
    
    # Would also delete the PDF file from storage
    
    await db.delete(report)
    await db.commit()
    
    return None


@router.post("/{report_id}/regenerate", response_model=ReportResponse)
async def regenerate_report(
    report_id: UUID = Path(..., description="Report ID"),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user_from_db),
    db: AsyncSession = Depends(get_db),
):
    """
    Regenerate a report with the same configuration.
    """
    original = await get_report_or_404(report_id, current_user.id, db)
    
    # Create new report with same config
    report = Report(
        user_id=current_user.id,
        report_type=original.report_type,
        status=ReportStatus.PENDING,
        config=original.config,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    
    db.add(report)
    await db.commit()
    await db.refresh(report)
    
    # Queue background generation
    if background_tasks:
        background_tasks.add_task(
            generate_report_pdf, 
            report.id, 
            report.report_type.value, 
            report.config
        )
    
    return ReportResponse(
        id=report.id,
        report_type=report.report_type.value,
        status=report.status.value,
        created_at=report.created_at,
        completed_at=report.completed_at,
        expires_at=report.expires_at,
        file_size=report.file_size,
        download_url=None,
        config=report.config,
    )


# Webhook for Celery task completion (internal use)
@router.post("/webhook/completed/{report_id}", include_in_schema=False)
async def report_completed_webhook(
    report_id: UUID,
    file_path: str,
    file_size: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Internal webhook called when report generation completes.
    """
    result = await db.execute(
        select(Report).where(Report.id == report_id)
    )
    report = result.scalar_one_or_none()
    
    if report:
        report.status = ReportStatus.COMPLETED
        report.file_path = file_path
        report.file_size = file_size
        report.completed_at = datetime.now(timezone.utc)
        await db.commit()
    
    return {"status": "ok"}


@router.post("/webhook/failed/{report_id}", include_in_schema=False)
async def report_failed_webhook(
    report_id: UUID,
    error_message: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Internal webhook called when report generation fails.
    """
    result = await db.execute(
        select(Report).where(Report.id == report_id)
    )
    report = result.scalar_one_or_none()
    
    if report:
        report.status = ReportStatus.FAILED
        report.error_message = error_message
        await db.commit()
    
    return {"status": "ok"}
