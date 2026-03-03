# backend/models/interview_model.py
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)

    # ✅ ADD THIS
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    domain = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    current_question = Column(Integer, default=0)
    total_question = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    verdict = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)

    # optional relationship (not required, but good)
    user = relationship("User", backref="interviews")