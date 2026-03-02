# backend/models/user_model.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from backend.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Unique login identity
    email = Column(String(255), unique=True, index=True, nullable=False)

    # Store hashed password only (never plain password)
    hashed_password = Column(String(255), nullable=False)

    # Optional display name
    full_name = Column(String(255), nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())