# backend/services/interview_service.py
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.models.interview_model import Interview
from backend.models.answer_model import Answer
from backend.services.question_service import get_questions
from backend.services.scoring_service import score_answer
from backend.services.adaptive_service import adjust_difficulty

def create_interview(db: Session, domain: str, difficulty: str):
    questions = get_questions(domain, difficulty)
    session_id = str(uuid.uuid4())

    interview = Interview(
        session_id=session_id,
        domain=domain,
        difficulty=difficulty,          # we will adapt this as current difficulty
        current_question=0,
        total_question=len(questions),
        total_score=0,
        verdict=None,
        is_completed=False
    )
    db.add(interview)
    db.commit()

    return interview, questions[0]

def submit_interview_answer(db: Session, session_id: str, answer: str):
    interview = db.execute(
        select(Interview).where(Interview.session_id == session_id)
    ).scalar_one_or_none()

    if not interview:
        raise ValueError("Session not found")

    questions = get_questions(interview.domain, interview.difficulty)

    if interview.current_question >= len(questions):
        raise ValueError("Interview already completed")

    idx = interview.current_question
    q_text = questions[idx]

    score, feedback, sim, quality = score_answer(answer, idx)

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

    # Advance
    interview.current_question += 1

    # Compute running avg on answered questions
    all_scores = db.execute(
        select(Answer.score).where(Answer.interview_id == interview.id)
    ).scalars().all()
    all_scores = [s or 0 for s in all_scores] + [score]  # include this one
    avg_so_far = round(sum(all_scores) / len(all_scores), 2)

    # ✅ Adaptive difficulty per answer
    interview.difficulty = adjust_difficulty(interview.difficulty, score, avg_so_far)

    # If finished -> finalize
    if interview.current_question >= len(questions):
        # reload all answers ordered
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

    # Not finished -> get next question (for updated difficulty we fetch again)
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