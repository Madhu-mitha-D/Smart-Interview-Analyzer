# backend/services/interview_service.py
import uuid
import json
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from backend.models.interview_model import Interview
from backend.models.answer_model import Answer
from backend.services.question_service import get_questions
from backend.services.scoring_service import score_answer
from backend.services.adaptive_service import adjust_difficulty
from backend.services.followup_question_service import (
    should_generate_followup,
    generate_followup_question,
)


# =========================
# CREATE NORMAL INTERVIEW
# =========================
def create_interview(db: Session, user_id: int, domain: str, difficulty: str):
    questions = get_questions(domain, difficulty)
    session_id = str(uuid.uuid4())

    interview = Interview(
        session_id=session_id,
        user_id=user_id,
        domain=domain,
        difficulty=difficulty,
        current_question=0,
        total_question=len(questions),
        total_score=0,
        verdict=None,
        is_completed=False,
        generated_questions=None,
        awaiting_follow_up=False,
        follow_up_question=None,
        follow_up_for_index=None,
    )

    db.add(interview)
    db.commit()
    db.refresh(interview)

    return interview, questions[0]


# =========================
# CREATE RESUME INTERVIEW
# =========================
def create_resume_interview(db: Session, user_id: int, questions: list[str]):
    if not questions:
        raise ValueError("No resume interview questions generated.")

    session_id = str(uuid.uuid4())

    interview = Interview(
        session_id=session_id,
        user_id=user_id,
        domain="resume",
        difficulty="personalized",
        current_question=0,
        total_question=len(questions),
        total_score=0,
        verdict=None,
        is_completed=False,
        generated_questions=json.dumps(questions),
        awaiting_follow_up=False,
        follow_up_question=None,
        follow_up_for_index=None,
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
    answer: str,
    communication: dict | None = None,
):
    interview = db.execute(
        select(Interview).where(
            Interview.session_id == session_id,
            Interview.user_id == user_id
        )
    ).scalar_one_or_none()

    if not interview:
        raise ValueError("Session not found (or not owned by user)")

    questions = get_questions(
        interview.domain,
        interview.difficulty,
        interview.generated_questions
    )

    # determine whether current prompt is a main question or follow-up
    if interview.awaiting_follow_up and interview.follow_up_question:
        q_text = interview.follow_up_question
        idx = (
            interview.follow_up_for_index
            if interview.follow_up_for_index is not None
            else interview.current_question
        )
        is_follow_up = True
    else:
        if interview.current_question >= len(questions):
            raise ValueError("Interview already completed")
        idx = interview.current_question
        q_text = questions[idx]
        is_follow_up = False

    score, feedback, sim, quality = score_answer(
        answer,
        idx,
        question_text=q_text,
        domain=interview.domain
    )

    comm = communication or {}

    ans = Answer(
        interview_id=interview.id,
        question_index=idx,
        question_text=q_text,
        answer_text=answer,
        score=score,
        feedback=feedback,
        similarity=sim,
        words_per_minute=comm.get("words_per_minute"),
        pace_label=comm.get("pace_label"),
        filler_count=comm.get("filler_count"),
        pause_count=comm.get("pause_count"),
        communication_score=comm.get("communication_score"),
        audio_duration_sec=comm.get("duration_sec"),
    )
    db.add(ans)

    if is_follow_up:
        # follow-up answered, clear it and move to next main question
        interview.awaiting_follow_up = False
        interview.follow_up_question = None
        interview.follow_up_for_index = None
        interview.current_question += 1
    else:
        # maybe generate one follow-up question
        should_follow = should_generate_followup(
            domain=interview.domain,
            question_text=q_text,
            answer=answer,
            score_0_to_10=score,
            similarity_0_to_1=sim,
            quality=quality,
        )

        if should_follow:
            follow_q = generate_followup_question(
                domain=interview.domain,
                question_text=q_text,
                answer=answer,
            )

            if follow_q:
                interview.awaiting_follow_up = True
                interview.follow_up_question = follow_q
                interview.follow_up_for_index = idx

                db.commit()

                return {
                    "finished": False,
                    "message": "Answer recorded. Follow-up question generated.",
                    "score": score,
                    "similarity": sim,
                    "feedback": feedback,
                    "quality": quality,
                    "avg_score_so_far": None,
                    "current_difficulty": interview.difficulty,
                    "next_question_index": idx,
                    "next_question": follow_q,
                    "is_follow_up": True,
                }

        interview.current_question += 1

    # recompute average from all stored answers
    all_scores = db.execute(
        select(Answer.score).where(Answer.interview_id == interview.id)
    ).scalars().all()

    all_scores = [s or 0 for s in all_scores]
    avg_so_far = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0

    # adaptive difficulty only for normal non-resume interviews
    if interview.domain != "resume":
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
        average_score = round(total_score / len(all_answers), 2) if all_answers else 0.0

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
                    "feedback": a.feedback,
                    "communication": {
                        "words_per_minute": a.words_per_minute,
                        "pace_label": a.pace_label,
                        "filler_count": a.filler_count,
                        "pause_count": a.pause_count,
                        "communication_score": a.communication_score,
                        "duration_sec": a.audio_duration_sec,
                    },
                }
                for a in all_answers
            ]
        }

    # =========================
    # CONTINUE
    # =========================
    next_questions = get_questions(
        interview.domain,
        interview.difficulty,
        interview.generated_questions
    )
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
        "next_question": next_q,
        "is_follow_up": False,
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
# GET INTERVIEW STATE
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

    questions = get_questions(
        interview.domain,
        interview.difficulty,
        interview.generated_questions
    )

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

    if interview.awaiting_follow_up and interview.follow_up_question:
        q = interview.follow_up_question
        idx = (
            interview.follow_up_for_index
            if interview.follow_up_for_index is not None
            else interview.current_question
        )
        is_follow_up = True
    else:
        idx = interview.current_question
        q = questions[idx]
        is_follow_up = False

    return {
        "finished": False,
        "session_id": interview.session_id,
        "domain": interview.domain,
        "difficulty": interview.difficulty,
        "question_index": idx,
        "question": q,
        "current_question": idx,
        "next_question": q,
        "total_question": interview.total_question,
        "is_follow_up": is_follow_up,
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