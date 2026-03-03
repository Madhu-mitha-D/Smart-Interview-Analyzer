from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from backend.database.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ must exist

    domain = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    current_question = Column(Integer, default=0)
    total_question = Column(Integer, default=0)

    total_score = Column(Integer, default=0)
    verdict = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)