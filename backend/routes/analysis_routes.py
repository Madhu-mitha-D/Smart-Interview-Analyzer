# backend/routes/analysis_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.database.deps import get_db
from backend.models.interview_model import Interview
from backend.models.answer_model import Answer
from backend.services.question_service import get_questions

router = APIRouter(tags=["Analytics"])


def _safe_div(a: float, b: float) -> float:
    return round(a / b, 2) if b else 0.0


@router.get("/analytics/{session_id}")
def analytics(session_id: str, db: Session = Depends(get_db)):
    interview = db.execute(
        select(Interview).where(Interview.session_id == session_id)
    ).scalar_one_or_none()

    if not interview:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        questions = get_questions(interview.domain, interview.difficulty)
    except Exception:
        raise HTTPException(status_code=500, detail="Interview question set invalid")

    total_questions = len(questions)

    answers = db.execute(
        select(Answer)
        .where(Answer.interview_id == interview.id)
        .order_by(Answer.question_index)
    ).scalars().all()

    answered_count = len(answers)
    pending_count = max(total_questions - answered_count, 0)

    if answered_count == 0:
        return {
            "session_id": session_id,
            "domain": interview.domain,
            "difficulty": interview.difficulty,
            "progress": {
                "answered": 0,
                "total_questions": total_questions,
                "pending": total_questions,
                "finished": False
            },
            "scores": {"total_score": 0, "average_score": 0.0},
            "similarity": {"avg_similarity": 0.0, "min_similarity": 0.0, "max_similarity": 0.0},
            "answer_length": {"avg_chars": 0.0, "min_chars": 0, "max_chars": 0},
            "best_answer": None,
            "worst_answer": None,
            "feedback_summary": {}
        }

    scores = [a.score or 0 for a in answers]
    sims = [float(a.similarity or 0.0) for a in answers]
    lengths = [len((a.answer_text or "").strip()) for a in answers]

    total_score = sum(scores)
    avg_score = _safe_div(total_score, total_questions)

    avg_sim = _safe_div(sum(sims), answered_count)
    min_sim = round(min(sims), 4)
    max_sim = round(max(sims), 4)

    avg_len = _safe_div(sum(lengths), answered_count)
    min_len = min(lengths)
    max_len = max(lengths)

    best = max(answers, key=lambda x: ((x.score or 0), float(x.similarity or 0.0)))
    worst = min(answers, key=lambda x: ((x.score or 0), float(x.similarity or 0.0)))

    feedback_counts = {}
    for a in answers:
        fb = (a.feedback or "").strip()
        key = fb if fb else "NO_FEEDBACK"
        feedback_counts[key] = feedback_counts.get(key, 0) + 1

    finished = interview.current_question >= total_questions

    return {
        "session_id": session_id,
        "domain": interview.domain,
        "difficulty": interview.difficulty,
        "progress": {
            "answered": answered_count,
            "total_questions": total_questions,
            "pending": pending_count,
            "finished": finished
        },
        "scores": {"total_score": total_score, "average_score": avg_score},
        "similarity": {"avg_similarity": avg_sim, "min_similarity": min_sim, "max_similarity": max_sim},
        "answer_length": {"avg_chars": avg_len, "min_chars": min_len, "max_chars": max_len},
        "best_answer": {
            "question_index": best.question_index,
            "question": best.question_text,
            "score": best.score,
            "similarity": round(float(best.similarity or 0.0), 4),
            "feedback": best.feedback
        },
        "worst_answer": {
            "question_index": worst.question_index,
            "question": worst.question_text,
            "score": worst.score,
            "similarity": round(float(worst.similarity or 0.0), 4),
            "feedback": worst.feedback
        },
        "feedback_summary": feedback_counts
    }