# backend/routes/interview_routes.py

from fastapi import APIRouter, HTTPException, Depends, Body
router = APIRouter(tags=["Interview"])
from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid

from backend.database.deps import get_db
from backend.models.interview_model import Interview
from backend.models.answer_model import Answer
from backend.services.question_service import get_questions
from backend.services.scoring_service import semantic_score


@router.post("/start-interview")
def start_interview(
    domain: str = Body(default="hr"),
    difficulty: str = Body(default="easy"),
    db: Session = Depends(get_db)
):
    try:
        questions = get_questions(domain, difficulty)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    session_id = str(uuid.uuid4())

    interview = Interview(
        session_id=session_id,
        domain=domain,
        difficulty=difficulty,
        current_question=0,
        total_questions=len(questions),
        total_score=0,
        verdict=None,
        is_completed=False
    )
    db.add(interview)
    db.commit()

    return {
        "session_id": session_id,
        "domain": domain,
        "difficulty": difficulty,
        "question_index": 0,
        "question": questions[0],
        "finished": False
    }


@router.post("/submit-answer")
def submit_answer(
    session_id: str = Body(...),
    answer: str = Body(...),
    db: Session = Depends(get_db)
):
    interview = db.execute(
        select(Interview).where(Interview.session_id == session_id)
    ).scalar_one_or_none()

    if not interview:
        raise HTTPException(status_code=404, detail="Session not found")

    # ✅ get questions using DB-stored domain/difficulty
    try:
        questions = get_questions(interview.domain, interview.difficulty)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if interview.current_question >= len(questions):
        raise HTTPException(status_code=400, detail="Interview already completed")

    current_index = interview.current_question
    question_text = questions[current_index]

    # score
    score, feedback, similarity = semantic_score(answer, current_index)
    # save answer row
    ans = Answer(
        interview_id=interview.id,
        question_index=current_index,
        question_text=question_text,
        answer_text=answer,
        score=score,
        feedback=feedback,
        similarity=similarity
    )
    db.add(ans)

    # advance
    interview.current_question += 1
    db.commit()

    # finished? build report
    if interview.current_question >= len(questions):
        all_answers = db.execute(
            select(Answer)
            .where(Answer.interview_id == interview.id)
            .order_by(Answer.question_index)
        ).scalars().all()

        total_score = sum(a.score for a in all_answers)
        average_score = round(total_score / len(questions), 2)

        if average_score >= 8:
            verdict = "Excellent performance"
        elif average_score >= 5:
            verdict = "Good performance"
        else:
            verdict = "Needs improvement"

        interview.total_score = total_score
        interview.verdict = verdict
        interview.is_completed = True
        db.commit()

        return {
            "message": "Interview completed",
            "finished": True,
            "total_score": total_score,
            "average_score": average_score,
            "verdict": verdict,
            "detailed_report": [
                {
                    "question_index": a.question_index,
                    "question": a.question_text,
                    "answer": a.answer_text,
                    "score": a.score,
                    "feedback": a.feedback
                }
                for a in all_answers
            ]
        }

    # not finished -> next question
    return {
        "message": "Answer recorded",
        "finished": False,
        "score": score,
        "feedback": feedback,
        "next_question_index": interview.current_question,
        "next_question": questions[interview.current_question]
    }


@router.get("/question/{session_id}")
def get_question(session_id: str, db: Session = Depends(get_db)):
    interview = db.execute(
        select(Interview).where(Interview.session_id == session_id)
    ).scalar_one_or_none()

    if not interview:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        questions = get_questions(interview.domain, interview.difficulty)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if interview.current_question >= len(questions):
        return {"finished": True, "message": "Interview completed"}

    return {
        "finished": False,
        "question_index": interview.current_question,
        "question": questions[interview.current_question],
        "domain": interview.domain,
        "difficulty": interview.difficulty
    }


@router.get("/report/{session_id}")
def get_report(session_id: str, db: Session = Depends(get_db)):
    interview = db.execute(
        select(Interview).where(Interview.session_id == session_id)
    ).scalar_one_or_none()

    if not interview:
        raise HTTPException(status_code=404, detail="Session not found")

    answers = db.execute(
        select(Answer)
        .where(Answer.interview_id == interview.id)
        .order_by(Answer.question_index)
    ).scalars().all()

    return {
        "session_id": session_id,
        "domain": interview.domain,
        "difficulty": interview.difficulty,
        "total_score": interview.total_score,
        "verdict": interview.verdict,
        "answers": [
            {
                "question_index": a.question_index,
                "question": a.question_text,
                "answer": a.answer_text,
                "score": a.score,
                "feedback": a.feedback,
            }
            for a in answers
        ],
    }