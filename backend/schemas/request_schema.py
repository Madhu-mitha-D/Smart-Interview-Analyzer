from pydantic import BaseModel

class StartInterviewRequest(BaseModel):
    domain: str = "hr"
    difficulty: str = "easy"

class AnswerRequest(BaseModel):
    session_id: str
    answer: str