# backend/services/interview_service.py
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from backend.models.interview_model import Interview
from backend.models.answer_model import Answer
from backend.services.question_service import get_questions
from backend.services.scoring_service import score_answer
from backend.services.adaptive_service import adjust_difficulty


# =========================
# CREATE INTERVIEW (WITH USER)
# =========================
def create_interview(db: Session, user_id: int, domain: str, difficulty: str):
    questions = get_questions(domain, difficulty)
    session_id = str(uuid.uuid4())

    interview = Interview(
        session_id=session_id,
        user_id=user_id,  # ✅ important
        domain=domain,
        difficulty=difficulty,
        current_question=0,
        total_question=len(questions),
        total_score=0,
        verdict=None,
        is_completed=False
    )

    db.add(interview)
    db.commit()
    db.refresh(interview)

    return interview, questions[0]


# =========================
# SUBMIT ANSWER (OWNER SAFE)
# =========================
def submit_interview_answer(
    db: Session,
    user_id: int,
    session_id: str,
    answer: str
):
    interview = db.execute(
        select(Interview).where(
            Interview.session_id == session_id,
            Interview.user_id == user_id  # ✅ owner check
        )
    ).scalar_one_or_none()

    if not interview:
        raise ValueError("Session not found (or not owned by user)")

    questions = get_questions(interview.domain, interview.difficulty)

    if interview.current_question >= len(questions):
        raise ValueError("Interview already completed")

    idx = interview.current_question
    q_text = questions[idx]

    # ✅ improved scoring call (with context)
    score, feedback, sim, quality = score_answer(
        answer,
        idx,
        question_text=q_text,
        domain=interview.domain
    )

    ans = Answer(
        interview_id=interview.id,
        question_index=idx,
        question_text=q_text,
        answer_text=answer,
        score=score,
        feedback=feedback,
        similarity=sim
    )
    db.add(ans)

    interview.current_question += 1

    # running average
    all_scores = db.execute(
        select(Answer.score).where(Answer.interview_id == interview.id)
    ).scalars().all()

    all_scores = [s or 0 for s in all_scores] + [score]
    avg_so_far = round(sum(all_scores) / len(all_scores), 2)

    # adaptive difficulty
    interview.difficulty = adjust_difficulty(
        interview.difficulty,
        score,
        avg_so_far
    )

    # =========================
    # FINISH
    # =========================
    if interview.current_question >= len(questions):
        all_answers = db.execute(
            select(Answer)
            .where(Answer.interview_id == interview.id)
            .order_by(Answer.question_index)
        ).scalars().all()

        total_score = sum(a.score or 0 for a in all_answers)
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
            "finished": True,
            "message": "Interview completed",
            "total_score": total_score,
            "average_score": average_score,
            "verdict": verdict,
            "detailed_report": [
                {
                    "question_index": a.question_index,
                    "question": a.question_text,
                    "answer": a.answer_text,
                    "score": a.score,
                    "similarity": float(a.similarity or 0.0),
                    "feedback": a.feedback
                }
                for a in all_answers
            ]
        }

    # =========================
    # CONTINUE
    # =========================
    next_questions = get_questions(interview.domain, interview.difficulty)
    next_q = next_questions[interview.current_question]

    db.commit()

    return {
        "finished": False,
        "message": "Answer recorded",
        "score": score,
        "similarity": sim,
        "feedback": feedback,
        "quality": quality,
        "avg_score_so_far": avg_so_far,
        "current_difficulty": interview.difficulty,
        "next_question_index": interview.current_question,
        "next_question": next_q
    }


# =========================
# LIST USER INTERVIEWS
# =========================
def list_user_interviews(db: Session, user_id: int):
    interviews = db.execute(
        select(Interview)
        .where(Interview.user_id == user_id)
        .order_by(Interview.id.desc())
    ).scalars().all()

    return [
        {
            "session_id": i.session_id,
            "domain": i.domain,
            "difficulty": i.difficulty,
            "total_score": i.total_score,
            "verdict": i.verdict,
            "is_completed": i.is_completed,
            "current_question": i.current_question,
            "total_question": i.total_question,
        }
        for i in interviews
    ]


# =========================
# RESUME INTERVIEW
# =========================
def get_interview_state(db: Session, user_id: int, session_id: str):
    interview = db.execute(
        select(Interview).where(
            Interview.session_id == session_id,
            Interview.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not interview:
        raise ValueError("Session not found (or not owned by user)")

    questions = get_questions(interview.domain, interview.difficulty)

    if interview.is_completed or interview.current_question >= len(questions):
        return {
            "finished": True,
            "session_id": interview.session_id,
            "domain": interview.domain,
            "difficulty": interview.difficulty,
            "current_question": interview.current_question,
            "total_question": interview.total_question,
            "total_score": interview.total_score,
            "verdict": interview.verdict,
        }

    idx = interview.current_question
    q = questions[idx]

    # ✅ return BOTH styles (safe for frontend)
    return {
        "finished": False,
        "session_id": interview.session_id,
        "domain": interview.domain,
        "difficulty": interview.difficulty,

        "question_index": idx,     # your old key
        "question": q,             # your old key

        "current_question": idx,   # extra (some UIs prefer this)
        "next_question": q,        # extra (some UIs prefer this)

        "total_question": interview.total_question,
    }

# =========================
# DELETE INTERVIEW
# =========================
def delete_interview_session(db: Session, user_id: int, session_id: str):
    interview = db.execute(
        select(Interview).where(
            Interview.session_id == session_id,
            Interview.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not interview:
        raise ValueError("Session not found (or not owned by user)")

    db.execute(delete(Answer).where(Answer.interview_id == interview.id))
    db.execute(delete(Interview).where(Interview.id == interview.id))

    db.commit()

    return {"deleted": True, "session_id": session_id}