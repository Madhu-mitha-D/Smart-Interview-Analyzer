# backend/routes/interview_routes.py
from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session

from backend.database.deps import get_db
from backend.services.interview_service import create_interview, submit_interview_answer

router = APIRouter(tags=["Interview"])

@router.post("/start-interview")
def start_interview(
    domain: str = Body(default="hr"),
    difficulty: str = Body(default="easy"),
    db: Session = Depends(get_db)
):
    try:
        interview, first_q = create_interview(db, domain, difficulty)
        return {
            "session_id": interview.session_id,
            "domain": interview.domain,
            "difficulty": interview.difficulty,
            "question_index": 0,
            "question": first_q,
            "finished": False
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/submit-answer")
def submit_answer(
    session_id: str = Body(...),
    answer: str = Body(...),
    db: Session = Depends(get_db)
):
    try:
        return submit_interview_answer(db, session_id, answer)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=msg)
        raise HTTPException(status_code=400, detail=msg)