# backend/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import JWTError, jwt
from passlib.context import CryptContext

# ✅ Use pbkdf2_sha256 (stable on Windows, no bcrypt backend issues)
_pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

SECRET_KEY = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    password = (password or "").strip()
    if not password:
        raise ValueError("Password cannot be empty")
    return _pwd.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return _pwd.verify(plain_password or "", hashed_password or "")
    except Exception:
        return False


def create_access_token(payload: Dict[str, Any], expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = dict(payload)
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise ValueError("Invalid token") from e