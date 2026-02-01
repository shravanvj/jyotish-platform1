"""
Jyotish Platform - Authentication Router
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database import get_db
from src.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from src.core.config import get_settings
from src.models import User
from src.schemas import (
    UserCreate,
    UserLogin,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest,
    ErrorResponse,
)

router = APIRouter()
settings = get_settings()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse}},
)
async def register(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user account.
    
    Returns access and refresh tokens on successful registration.
    """
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == data.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Create user
    user = User(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        name=data.name,
    )
    db.add(user)
    await db.flush()
    
    # Generate tokens
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    responses={401: {"model": ErrorResponse}},
)
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user and return tokens.
    """
    # Find user
    result = await db.execute(
        select(User).where(User.email == data.email.lower())
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled",
        )
    
    # Generate tokens
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    responses={401: {"model": ErrorResponse}},
)
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Refresh access token using refresh token.
    """
    payload = decode_token(data.refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    
    # Verify user still exists and is active
    result = await db.execute(
        select(User).where(User.id == payload["sub"])
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or disabled",
        )
    
    # Generate new access token
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=data.refresh_token,  # Reuse refresh token
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    responses={401: {"model": ErrorResponse}},
)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current authenticated user's profile.
    """
    result = await db.execute(
        select(User).where(User.id == current_user["sub"])
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user),
):
    """
    Logout user (client should discard tokens).
    
    Note: In a production system, you might want to maintain a 
    token blacklist in Redis for invalidated tokens.
    """
    return {"message": "Successfully logged out"}
