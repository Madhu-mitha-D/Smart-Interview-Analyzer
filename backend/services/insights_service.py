from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.models.interview_model import Interview
from backend.models.answer_model import Answer


def _safe_div(a: float, b: float) -> float:
    return round(a / b, 2) if b else 0.0


def _clamp01(x: float) -> float:
    try:
        return max(0.0, min(1.0, float(x)))
    except Exception:
        return 0.0


def _tone_from_score(avg_score: float) -> str:
    if avg_score >= 8:
        return "Excellent"
    if avg_score >= 5:
        return "Good"
    return "Needs Improvement"


def _is_behavioral(domain: str, question: str) -> bool:
    d = (domain or "").lower().strip()
    q = (question or "").lower().strip()
    if d in {"hr", "behavioral"}:
        return True
    # If question sounds behavioral, treat it as behavioral
    keys = [
        "tell me about yourself",
        "time you",
        "challenge",
        "conflict",
        "failure",
        "weakness",
        "strength",
        "pressure",
        "led",
        "handle",
        "why should we hire",
    ]
    return any(k in q for k in keys)


def _next_step(domain: str, weakest_q: str, avg_score: float) -> str:
    # STAR only when it makes sense (behavioral)
    if _is_behavioral(domain, weakest_q) and avg_score <= 6:
        return "Rewrite your weakest answer using STAR: Situation → Task → Action → Result (1–2 lines each)."
    if avg_score <= 4:
        return "Answer more directly first, then add 1 concrete example and result."
    if avg_score <= 6:
        return "Add one example + outcome to your weaker answers, and keep a clear structure."
    return "Keep your structure; tighten wording and add a stronger closing takeaway."


def _communication_analysis(avg_len: float, avg_sim: float, avg_score: float) -> str:
    tips = []

    # length hints
    if avg_len < 80:
        tips.append("Your answers are a bit short — add one example and the result.")
    elif avg_len > 700:
        tips.append("Your answers are long — keep 2–4 key points and one example.")

    # relevance/fit hint (phrase it humanly)
    if avg_sim < 0.25:
        tips.append("You sometimes drift from the question — answer the core first.")
    elif avg_sim < 0.45:
        tips.append("You’re close — lead with the main point, then support it.")

    # tone based on score
    if not tips:
        if avg_score >= 7:
            return "Clear and structured. Keep it concise and keep using examples."
        return "Decent clarity. Add one more specific example to make answers stronger."

    # keep it short + human
    return " ".join(tips[:2])


def _consistency_analysis(scores: List[int]) -> str:
    if not scores:
        return "No answers yet."
    if len(scores) == 1:
        return "Only one answer so far — consistency will improve after more questions."

    mean = sum(scores) / len(scores)
    var = sum((s - mean) ** 2 for s in scores) / (len(scores) - 1)
    std = math.sqrt(var)

    if std <= 1.0:
        return "Very consistent performance across questions."
    if std <= 2.0:
        return "Mostly consistent — a couple answers were weaker/stronger than others."
    return "Inconsistent — focus on keeping the same structure and depth every time."


def _pick_best_and_weakest(answers: List[Answer]) -> Tuple[Optional[Answer], Optional[Answer]]:
    if not answers:
        return None, None
    if len(answers) == 1:
        return answers[0], answers[0]

    # Best: prioritize score, then similarity
    best = max(answers, key=lambda a: ((a.score or 0), float(a.similarity or 0.0)))

    # Weakest: prioritize score, then similarity
    weakest = min(answers, key=lambda a: ((a.score or 0), float(a.similarity or 0.0)))

    # If they end up the same due to identical values, try a different weakest:
    if best.id == weakest.id:
        # choose the "next weakest" by sorting
        sorted_ans = sorted(answers, key=lambda a: ((a.score or 0), float(a.similarity or 0.0)))
        weakest = sorted_ans[0]
        if weakest.id == best.id and len(sorted_ans) > 1:
            weakest = sorted_ans[1]

    return best, weakest


def build_insights(session_id: str, db: Session, user_id: int) -> Dict[str, Any]:
    # Ownership-safe interview lookup
    interview = db.execute(
        select(Interview).where(
            Interview.session_id == session_id,
            Interview.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not interview:
        raise ValueError("Session not found")

    answers: List[Answer] = db.execute(
        select(Answer)
        .where(Answer.interview_id == interview.id)
        .order_by(Answer.question_index)
    ).scalars().all()

    # If no answers yet
    if not answers:
        return {
            "session_id": session_id,
            "domain": interview.domain,
            "difficulty": interview.difficulty,
            "overall_performance": "Not started",
            "average_score": 0.0,
            "average_similarity": 0.0,
            "communication_analysis": "Start answering a few questions to see insights.",
            "consistency_analysis": "No answers yet.",
            "best_answer": None,
            "weakest_answer": None,
            "next_step_suggestion": "Answer at least 2 questions to unlock insights.",
        }

    scores = [int(a.score or 0) for a in answers]
    sims = [_clamp01(float(a.similarity or 0.0)) for a in answers]
    lengths = [len((a.answer_text or "").strip()) for a in answers]

    avg_score = _safe_div(sum(scores), len(scores))
    avg_sim = _safe_div(sum(sims), len(sims))
    avg_len = _safe_div(sum(lengths), len(lengths))

    overall = _tone_from_score(avg_score)

    best, weakest = _pick_best_and_weakest(answers)

    weakest_q = (weakest.question_text if weakest else "") or ""
    next_step = _next_step(interview.domain or "hr", weakest_q, avg_score)

    comm = _communication_analysis(avg_len, avg_sim, avg_score)
    cons = _consistency_analysis(scores)

    def pack(a: Optional[Answer]) -> Optional[Dict[str, Any]]:
        if not a:
            return None
        return {
            "question": a.question_text,
            "score": int(a.score or 0),
            "feedback": (a.feedback or "").strip() or "No feedback stored.",
        }

    return {
        "session_id": session_id,
        "domain": interview.domain,
        "difficulty": interview.difficulty,
        "overall_performance": overall,
        "average_score": float(avg_score),
        "average_similarity": float(avg_sim),
        "communication_analysis": comm,
        "consistency_analysis": cons,
        "best_answer": pack(best),
        "weakest_answer": pack(weakest),
        "next_step_suggestion": next_step,
    }