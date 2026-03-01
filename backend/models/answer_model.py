from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy import Float
from backend.database.database import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), index=True)

    question_index = Column(Integer, nullable=False)
    question_text = Column(String, nullable=False)

    similarity = Column(Float, default=0.0)
    answer_text = Column(Text, nullable=False)
    score = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)