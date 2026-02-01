"""
Jyotish Platform - Security Utilities
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from cryptography.fernet import Fernet
import secrets
import base64

from src.core.config import get_settings

settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer scheme
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[dict]:
    """Get current user if authenticated, None otherwise."""
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            return None
        return payload
    except HTTPException:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
):
    """
    Get current user, raise 401 if not authenticated.
    Returns the user payload from the JWT token.
    
    Note: To get the full User model, use get_current_user_from_db instead.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    return payload


# For routes that need the full User model
# This will be used as: Depends(get_current_user_from_db)
# Import this in routers that need the actual User model


class EnvelopeEncryption:
    """
    Envelope encryption for sensitive birth data.
    Uses Fernet symmetric encryption with per-record keys.
    """
    
    def __init__(self):
        # Master key from settings (should be rotated periodically)
        self._master_key = base64.urlsafe_b64encode(
            settings.secret_key[:32].encode().ljust(32, b'\0')
        )
        self._fernet = Fernet(self._master_key)
    
    def generate_data_key(self) -> tuple[bytes, bytes]:
        """Generate a new data encryption key."""
        dek = Fernet.generate_key()
        encrypted_dek = self._fernet.encrypt(dek)
        return dek, encrypted_dek
    
    def decrypt_data_key(self, encrypted_dek: bytes) -> bytes:
        """Decrypt a data encryption key using master key."""
        return self._fernet.decrypt(encrypted_dek)
    
    def encrypt_birth_data(self, data: dict) -> tuple[bytes, bytes]:
        """
        Encrypt birth data with a new data key.
        Returns: (encrypted_data, encrypted_dek)
        """
        import json
        dek, encrypted_dek = self.generate_data_key()
        fernet = Fernet(dek)
        encrypted_data = fernet.encrypt(json.dumps(data).encode())
        return encrypted_data, encrypted_dek
    
    def decrypt_birth_data(self, encrypted_data: bytes, encrypted_dek: bytes) -> dict:
        """Decrypt birth data using encrypted data key."""
        import json
        dek = self.decrypt_data_key(encrypted_dek)
        fernet = Fernet(dek)
        return json.loads(fernet.decrypt(encrypted_data))


def generate_api_key() -> str:
    """Generate a secure API key for developer access."""
    return f"jyotish_{secrets.token_urlsafe(32)}"


def hash_api_key(api_key: str) -> str:
    """Hash an API key for storage."""
    import hashlib
    return hashlib.sha256(api_key.encode()).hexdigest()


# Singleton encryption instance
_encryption = None

def get_encryption() -> EnvelopeEncryption:
    """Get envelope encryption instance."""
    global _encryption
    if _encryption is None:
        _encryption = EnvelopeEncryption()
    return _encryption


def encrypt_birth_data(data: dict) -> tuple[bytes, bytes]:
    """Helper to encrypt birth data."""
    return get_encryption().encrypt_birth_data(data)


def decrypt_birth_data(encrypted_data: bytes, encrypted_dek: bytes) -> dict:
    """Helper to decrypt birth data."""
    return get_encryption().decrypt_birth_data(encrypted_data, encrypted_dek)
