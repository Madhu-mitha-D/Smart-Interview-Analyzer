# backend/services/analysis_service.py

from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.models.interview_model import Interview
from backend.models.answer_model import Answer
from backend.services.question_service import get_questions


def _safe_div(a: float, b: float) -> float:
    return round(a / b, 2) if b else 0.0


def get_analytics(session_id: str, db: Session, user_id: int) -> dict:
    # 1) interview row (owner safe)
    interview = db.execute(
        select(Interview).where(
            Interview.session_id == session_id,
            Interview.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not interview:
        return {"_error": ("Session not found", 404)}

    # 2) load question set from stored domain/difficulty
    try:
        questions = get_questions(interview.domain, interview.difficulty)
    except Exception:
        return {"_error": ("Interview question set invalid", 500)}

    total_questions = len(questions)

    # 3) all answers for this interview
    answers = db.execute(
        select(Answer)
        .where(Answer.interview_id == interview.id)
        .order_by(Answer.question_index)
    ).scalars().all()

    answered_count = len(answers)
    pending_count = max(total_questions - answered_count, 0)

    finished = bool(interview.is_completed) or (interview.current_question >= total_questions)

    # ✅ NEW: score progress (for charts)
    score_per_question = [
        {
            "q_index": a.question_index,          # 0-based
            "q_no": (a.question_index or 0) + 1,  # 1-based for UI
            "score": int(a.score or 0),
            "similarity": round(float(a.similarity or 0.0), 4),
            "answer_len": len((a.answer_text or "").strip()),
            # optional: show if transcript came from audio
            "has_transcript": bool((getattr(a, "answer_text", "") or "").strip()),
        }
        for a in answers
    ]

    # No answers yet -> minimal response (still include score_per_question for UI)
    if answered_count == 0:
        return {
            "session_id": session_id,
            "domain": interview.domain,
            "difficulty": interview.difficulty,
            "progress": {
                "answered": 0,
                "total_questions": total_questions,
                "pending": total_questions,
                "finished": finished,
            },
            "score_per_question": [],
        }

    scores = [int(a.score or 0) for a in answers]
    sims = [float(a.similarity or 0.0) for a in answers]
    lengths = [len((a.answer_text or "").strip()) for a in answers]

    total_score = sum(scores)

    # avg score across total questions (so unfinished interviews show lower avg)
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

    return {
        "session_id": session_id,
        "domain": interview.domain,
        "difficulty": interview.difficulty,

        "progress": {
            "answered": answered_count,
            "total_questions": total_questions,
            "pending": pending_count,
            "finished": finished,
        },

        "scores": {
            "total_score": total_score,
            "average_score": avg_score,
        },

        "similarity": {
            "avg_similarity": avg_sim,
            "min_similarity": min_sim,
            "max_similarity": max_sim,
        },

        "answer_length": {
            "avg_chars": avg_len,
            "min_chars": min_len,
            "max_chars": max_len,
        },

        # ✅ NEW: for Analytics graph
        "score_per_question": score_per_question,

        "best_answer": {
            "question_index": best.question_index,
            "question": best.question_text,
            "score": int(best.score or 0),
            "similarity": round(float(best.similarity or 0.0), 4),
            "feedback": best.feedback,
        },

        "worst_answer": {
            "question_index": worst.question_index,
            "question": worst.question_text,
            "score": int(worst.score or 0),
            "similarity": round(float(worst.similarity or 0.0), 4),
            "feedback": worst.feedback,
        },

        "feedback_summary": feedback_counts,
    }