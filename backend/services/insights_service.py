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
    if _is_behavioral(domain, weakest_q) and avg_score <= 6:
        return "Rewrite your weakest answer using STAR: Situation → Task → Action → Result (1–2 lines each)."
    if avg_score <= 4:
        return "Answer more directly first, then add 1 concrete example and result."
    if avg_score <= 6:
        return "Add one example + outcome to your weaker answers, and keep a clear structure."
    return "Keep your structure; tighten wording and add a stronger closing takeaway."


def _communication_analysis(
    avg_len: float,
    avg_sim: float,
    avg_score: float,
    avg_wpm: float = 0.0,
    avg_comm_score: float = 0.0,
    total_fillers: int = 0,
    total_pauses: int = 0,
) -> str:
    tips = []

    if avg_len < 80:
        tips.append("Your answers are a bit short — add one example and the result.")
    elif avg_len > 700:
        tips.append("Your answers are long — keep 2–4 key points and one example.")

    if avg_sim < 0.25:
        tips.append("You sometimes drift from the question — answer the core first.")
    elif avg_sim < 0.45:
        tips.append("You’re close — lead with the main point, then support it.")

    if avg_wpm > 0:
        if avg_wpm < 90:
            tips.append("Your speaking pace is slow — speak a little faster to sound more confident.")
        elif avg_wpm > 170:
            tips.append("Your speaking pace is fast — slow down slightly for better clarity.")

    if total_fillers >= 4:
        tips.append("Reduce filler words like 'um', 'uh', and 'like'.")

    if total_pauses >= 5:
        tips.append("There are several pauses — try smoother sentence flow and better preparation.")

    if avg_comm_score > 0 and avg_comm_score >= 8:
        tips.append("Your communication delivery is strong.")

    if not tips:
        if avg_score >= 7:
            return "Clear and structured. Keep it concise and keep using examples."
        return "Decent clarity. Add one more specific example to make answers stronger."

    return " ".join(tips[:3])


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

    best = max(answers, key=lambda a: ((a.score or 0), float(a.similarity or 0.0)))
    weakest = min(answers, key=lambda a: ((a.score or 0), float(a.similarity or 0.0)))

    if best.id == weakest.id:
        sorted_ans = sorted(answers, key=lambda a: ((a.score or 0), float(a.similarity or 0.0)))
        weakest = sorted_ans[0]
        if weakest.id == best.id and len(sorted_ans) > 1:
            weakest = sorted_ans[1]

    return best, weakest


def build_insights(session_id: str, db: Session, user_id: int) -> Dict[str, Any]:
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
            "communication_metrics": {
                "avg_words_per_minute": 0.0,
                "avg_communication_score": 0.0,
                "total_filler_count": 0,
                "total_pause_count": 0,
            },
        }

    scores = [int(a.score or 0) for a in answers]
    sims = [_clamp01(float(a.similarity or 0.0)) for a in answers]
    lengths = [len((a.answer_text or "").strip()) for a in answers]

    avg_score = _safe_div(sum(scores), len(scores))
    avg_sim = _safe_div(sum(sims), len(sims))
    avg_len = _safe_div(sum(lengths), len(lengths))

    wpms = [float(a.words_per_minute or 0.0) for a in answers if a.words_per_minute is not None]
    comm_scores = [float(a.communication_score or 0.0) for a in answers if a.communication_score is not None]
    filler_counts = [int(a.filler_count or 0) for a in answers]
    pause_counts = [int(a.pause_count or 0) for a in answers]

    avg_wpm = _safe_div(sum(wpms), len(wpms)) if wpms else 0.0
    avg_comm_score = _safe_div(sum(comm_scores), len(comm_scores)) if comm_scores else 0.0
    total_fillers = sum(filler_counts)
    total_pauses = sum(pause_counts)

    overall = _tone_from_score(avg_score)

    best, weakest = _pick_best_and_weakest(answers)

    weakest_q = (weakest.question_text if weakest else "") or ""
    next_step = _next_step(interview.domain or "hr", weakest_q, avg_score)

    comm = _communication_analysis(
        avg_len,
        avg_sim,
        avg_score,
        avg_wpm=avg_wpm,
        avg_comm_score=avg_comm_score,
        total_fillers=total_fillers,
        total_pauses=total_pauses,
    )
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
        "communication_metrics": {
            "avg_words_per_minute": avg_wpm,
            "avg_communication_score": avg_comm_score,
            "total_filler_count": total_fillers,
            "total_pause_count": total_pauses,
        },
    }


def build_overall_insights(db: Session, user_id: int) -> Dict[str, Any]:
    interviews: List[Interview] = db.execute(
        select(Interview)
        .where(Interview.user_id == user_id)
        .order_by(Interview.id.desc())
    ).scalars().all()

    total_sessions = len(interviews)
    completed_sessions = sum(1 for i in interviews if i.is_completed)

    if total_sessions == 0:
        return {
            "overall": True,
            "total_sessions": 0,
            "completed_sessions": 0,
            "incomplete_sessions": 0,
            "average_total_score": 0.0,
            "average_answer_score": 0.0,
            "average_similarity": 0.0,
            "best_domain": None,
            "weakest_domain": None,
            "overall_performance": "Not started",
            "communication_analysis": "Take an interview to unlock overall insights.",
            "consistency_analysis": "No interview history yet.",
            "domains": {},
            "next_step_suggestion": "Complete at least one interview to see overall insights.",
            "communication_metrics": {
                "avg_words_per_minute": 0.0,
                "avg_communication_score": 0.0,
                "total_filler_count": 0,
                "total_pause_count": 0,
            },
        }

    interview_ids = [i.id for i in interviews]

    answers: List[Answer] = []
    if interview_ids:
        answers = db.execute(
            select(Answer)
            .where(Answer.interview_id.in_(interview_ids))
            .order_by(Answer.interview_id, Answer.question_index)
        ).scalars().all()

    domain_stats: Dict[str, Dict[str, float]] = {}
    total_score_sum = 0
    for i in interviews:
        total_score_sum += i.total_score or 0
        if i.domain not in domain_stats:
            domain_stats[i.domain] = {"count": 0, "score_sum": 0.0}
        domain_stats[i.domain]["count"] += 1
        domain_stats[i.domain]["score_sum"] += float(i.total_score or 0)

    best_domain = None
    weakest_domain = None
    if domain_stats:
        domain_avg = {
            d: _safe_div(v["score_sum"], v["count"])
            for d, v in domain_stats.items()
        }
        best_domain = max(domain_avg, key=domain_avg.get)
        weakest_domain = min(domain_avg, key=domain_avg.get)

    if not answers:
        avg_total_score = _safe_div(total_score_sum, total_sessions)
        return {
            "overall": True,
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "incomplete_sessions": total_sessions - completed_sessions,
            "average_total_score": avg_total_score,
            "average_answer_score": 0.0,
            "average_similarity": 0.0,
            "best_domain": best_domain,
            "weakest_domain": weakest_domain,
            "overall_performance": _tone_from_score(avg_total_score),
            "communication_analysis": "Interview records exist, but no answer-level data is available yet.",
            "consistency_analysis": "Not enough answer data yet.",
            "domains": {k: int(v["count"]) for k, v in domain_stats.items()},
            "next_step_suggestion": "Complete more interviews to strengthen your overall profile.",
            "communication_metrics": {
                "avg_words_per_minute": 0.0,
                "avg_communication_score": 0.0,
                "total_filler_count": 0,
                "total_pause_count": 0,
            },
        }

    scores = [int(a.score or 0) for a in answers]
    sims = [_clamp01(float(a.similarity or 0.0)) for a in answers]
    lengths = [len((a.answer_text or "").strip()) for a in answers]

    avg_total_score = _safe_div(total_score_sum, total_sessions)
    avg_answer_score = _safe_div(sum(scores), len(scores))
    avg_similarity = _safe_div(sum(sims), len(sims))
    avg_len = _safe_div(sum(lengths), len(lengths))

    wpms = [float(a.words_per_minute or 0.0) for a in answers if a.words_per_minute is not None]
    comm_scores = [float(a.communication_score or 0.0) for a in answers if a.communication_score is not None]
    filler_counts = [int(a.filler_count or 0) for a in answers]
    pause_counts = [int(a.pause_count or 0) for a in answers]

    avg_wpm = _safe_div(sum(wpms), len(wpms)) if wpms else 0.0
    avg_comm_score = _safe_div(sum(comm_scores), len(comm_scores)) if comm_scores else 0.0
    total_fillers = sum(filler_counts)
    total_pauses = sum(pause_counts)

    overall_performance = _tone_from_score(avg_answer_score)
    communication_analysis = _communication_analysis(
        avg_len,
        avg_similarity,
        avg_answer_score,
        avg_wpm=avg_wpm,
        avg_comm_score=avg_comm_score,
        total_fillers=total_fillers,
        total_pauses=total_pauses,
    )
    consistency_analysis = _consistency_analysis(scores)

    if avg_answer_score <= 4:
        next_step = "Focus on one domain first, answer more directly, and always add one clear example."
    elif avg_answer_score <= 6:
        next_step = "Strengthen weaker answers with better structure and one measurable outcome."
    else:
        next_step = "Maintain your structure and now work on polishing depth, clarity, and confidence."

    return {
        "overall": True,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "incomplete_sessions": total_sessions - completed_sessions,
        "average_total_score": avg_total_score,
        "average_answer_score": avg_answer_score,
        "average_similarity": avg_similarity,
        "best_domain": best_domain,
        "weakest_domain": weakest_domain,
        "overall_performance": overall_performance,
        "communication_analysis": communication_analysis,
        "consistency_analysis": consistency_analysis,
        "domains": {k: int(v["count"]) for k, v in domain_stats.items()},
        "next_step_suggestion": next_step,
        "communication_metrics": {
            "avg_words_per_minute": avg_wpm,
            "avg_communication_score": avg_comm_score,
            "total_filler_count": total_fillers,
            "total_pause_count": total_pauses,
        },
    }