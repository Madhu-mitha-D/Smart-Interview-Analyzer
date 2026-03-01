from sqlalchemy import Column, Integer, String, Boolean
from backend.database.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)

    domain = Column(String, nullable=False, default="hr")
    difficulty = Column(String, nullable=False, default="easy")

    current_question = Column(Integer, default=0)
    total_question = Column(Integer, default=0)

    total_score = Column(Integer, default=0)
    verdict = Column(String, nullable=True)

    is_completed = Column(Boolean, default=False)