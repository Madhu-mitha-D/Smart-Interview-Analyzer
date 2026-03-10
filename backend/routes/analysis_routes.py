from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.database.deps import get_db
from backend.models.interview_model import Interview
from backend.models.answer_model import Answer
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.services.question_service import get_questions

router = APIRouter(tags=["Analytics"])


def _safe_div(a: float, b: float) -> float:
    return round(a / b, 2) if b else 0.0


@router.get("/analytics")
def overall_analytics(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    interviews = db.execute(
        select(Interview)
        .where(Interview.user_id == user.id)
        .order_by(Interview.id.desc())
    ).scalars().all()

    total_sessions = len(interviews)
    completed_sessions = sum(1 for i in interviews if i.is_completed)
    incomplete_sessions = total_sessions - completed_sessions

    if total_sessions == 0:
        return {
            "overall": True,
            "total_sessions": 0,
            "completed_sessions": 0,
            "incomplete_sessions": 0,
            "average_total_score": 0.0,
            "domains": {},
            "difficulty_distribution": {},
        }

    total_scores = [i.total_score or 0 for i in interviews]
    average_total_score = round(sum(total_scores) / total_sessions, 2)

    domains = {}
    difficulty_distribution = {}

    for i in interviews:
        domains[i.domain] = domains.get(i.domain, 0) + 1
        difficulty_distribution[i.difficulty] = difficulty_distribution.get(i.difficulty, 0) + 1

    return {
        "overall": True,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "incomplete_sessions": incomplete_sessions,
        "average_total_score": average_total_score,
        "domains": domains,
        "difficulty_distribution": difficulty_distribution,
    }


@router.get("/analytics/{session_id}")
def analytics(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    interview = db.execute(
        select(Interview).where(
            Interview.session_id == session_id,
            Interview.user_id == user.id,
        )
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
            "communication": {
                "avg_words_per_minute": 0.0,
                "avg_communication_score": 0.0,
                "total_filler_count": 0,
                "total_pause_count": 0
            },
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

    # =========================
    # NEW: COMMUNICATION METRICS
    # =========================
    wpms = [float(a.words_per_minute or 0) for a in answers if a.words_per_minute]
    comm_scores = [float(a.communication_score or 0) for a in answers if a.communication_score]

    filler_counts = [int(a.filler_count or 0) for a in answers]
    pause_counts = [int(a.pause_count or 0) for a in answers]

    avg_wpm = _safe_div(sum(wpms), len(wpms)) if wpms else 0.0
    avg_comm_score = _safe_div(sum(comm_scores), len(comm_scores)) if comm_scores else 0.0
    total_fillers = sum(filler_counts)
    total_pauses = sum(pause_counts)

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

        # NEW COMMUNICATION SECTION
        "communication": {
            "avg_words_per_minute": avg_wpm,
            "avg_communication_score": avg_comm_score,
            "total_filler_count": total_fillers,
            "total_pause_count": total_pauses
        },

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