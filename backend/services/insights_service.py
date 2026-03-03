# backend/services/insights_service.py

from sqlalchemy.orm import Session
from sqlalchemy import select
import math

from backend.models.interview_model import Interview
from backend.models.answer_model import Answer
from backend.services.question_service import get_questions


def _safe_div(a: float, b: float) -> float:
    return round(a / b, 2) if b else 0.0


def _std(values):
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return round(math.sqrt(variance), 2)


def build_insights(session_id: str, db: Session, user_id: int):
    interview = db.execute(
        select(Interview).where(Interview.session_id == session_id, Interview.user_id == user_id)
    ).scalar_one_or_none()

    if not interview:
        return {"_error": ("Session not found", 404)}

    questions = get_questions(interview.domain, interview.difficulty)
    total_questions = len(questions)

    answers = db.execute(
        select(Answer)
        .where(Answer.interview_id == interview.id)
        .order_by(Answer.question_index)
    ).scalars().all()

    if not answers:
        return {
            "session_id": session_id,
            "message": "Answer at least one question to unlock insights."
        }

    scores = [a.score or 0 for a in answers]
    similarities = [float(a.similarity or 0.0) for a in answers]
    lengths = [len((a.answer_text or "").strip()) for a in answers]

    avg_score = _safe_div(sum(scores), total_questions)
    avg_similarity = _safe_div(sum(similarities), len(similarities))
    avg_length = _safe_div(sum(lengths), len(lengths))
    consistency = _std(scores)

    best = max(answers, key=lambda x: (x.score or 0))
    worst = min(answers, key=lambda x: (x.score or 0))

    # Friendly interpretation
    if avg_score >= 8:
        performance = "Excellent"
    elif avg_score >= 5:
        performance = "Good"
    else:
        performance = "Needs Improvement"

    if avg_length < 80:
        communication_tip = "Try adding more examples and details."
    elif avg_length < 150:
        communication_tip = "Good length. Add one concrete example to improve."
    else:
        communication_tip = "Well-detailed responses."

    if consistency <= 1.5:
        consistency_text = "Very consistent performance."
    elif consistency <= 2.5:
        consistency_text = "Moderately consistent."
    else:
        consistency_text = "Performance varies across questions."

    return {
        "session_id": session_id,
        "domain": interview.domain,
        "difficulty": interview.difficulty,
        "overall_performance": performance,
        "average_score": avg_score,
        "average_similarity": round(avg_similarity, 4),
        "communication_analysis": communication_tip,
        "consistency_analysis": consistency_text,
        "best_answer": {
            "question": best.question_text,
            "score": best.score,
            "feedback": best.feedback
        },
        "weakest_answer": {
            "question": worst.question_text,
            "score": worst.score,
            "feedback": worst.feedback
        },
        "next_step_suggestion": "Improve weakest answer using STAR method (Situation, Task, Action, Result)."
    }