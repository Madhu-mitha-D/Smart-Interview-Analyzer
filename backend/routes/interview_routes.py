# backend/routes/interview_routes.py

from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.database.deps import get_db
from backend.routes.auth_routes import get_current_user
from backend.models.user_model import User
from backend.models.interview_model import Interview

from backend.services.interview_service import (
    create_interview,
    submit_interview_answer,
    get_interview_state,
    delete_interview_session,
)

router = APIRouter(tags=["Interview"])


@router.post("/start-interview")
def start_interview(
    domain: str = Body(default="hr"),
    difficulty: str = Body(default="easy"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        interview, first_q = create_interview(db, user.id, domain, difficulty)
        return {
            "session_id": interview.session_id,
            "domain": interview.domain,
            "difficulty": interview.difficulty,
            "question_index": 0,
            "question": first_q,
            "finished": False,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/submit-answer")
def submit_answer(
    session_id: str = Body(...),
    answer: str = Body(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return submit_interview_answer(db, user.id, session_id, answer)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=msg)
        raise HTTPException(status_code=400, detail=msg)


@router.get("/interviews/my")
def my_interviews(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = db.execute(
        select(Interview)
        .where(Interview.user_id == user.id)
        .order_by(Interview.id.desc())
    ).scalars().all()

    return [
        {
            "session_id": r.session_id,
            "domain": r.domain,
            "difficulty": r.difficulty,
            "total_score": r.total_score,
            "verdict": r.verdict,
            "is_completed": r.is_completed,
            "current_question": r.current_question,
            "total_question": r.total_question,
        }
        for r in rows
    ]


# ✅ RESUME STATE (GET) — avoids collision with DELETE
@router.get("/interviews/{session_id}/state")
def resume_interview(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return get_interview_state(db, user.id, session_id)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=msg)
        raise HTTPException(status_code=400, detail=msg)


# ✅ DELETE SESSION
@router.delete("/interviews/{session_id}")
def delete_interview(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return delete_interview_session(db, user.id, session_id)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=msg)
        raise HTTPException(status_code=400, detail=msg)