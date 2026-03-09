from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from backend.database.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    domain = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    current_question = Column(Integer, default=0)
    total_question = Column(Integer, default=0)

    total_score = Column(Integer, default=0)
    verdict = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)

    generated_questions = Column(Text, nullable=True)

    # NEW: follow-up support
    awaiting_follow_up = Column(Boolean, default=False)
    follow_up_question = Column(Text, nullable=True)
    follow_up_for_index = Column(Integer, nullable=True)