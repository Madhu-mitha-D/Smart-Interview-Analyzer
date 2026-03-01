from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database.deps import get_db
from backend.models.interview_model import Interview

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("")
def analytics(db: Session = Depends(get_db)):
    total = db.query(func.count(Interview.id)).scalar() or 0
    completed = db.query(func.count(Interview.id)).filter(Interview.is_completed == True).scalar() or 0

    avg_score = db.query(func.avg(Interview.total_score)).filter(Interview.is_completed == True).scalar()
    avg_score = float(avg_score) if avg_score is not None else 0.0

    # Domain-wise average score (only completed)
    domain_rows = (
        db.query(Interview.domain, func.avg(Interview.total_score))
        .filter(Interview.is_completed == True)
        .group_by(Interview.domain)
        .all()
    )

    domain_breakdown = {d: float(a) for d, a in domain_rows}

    completion_rate = (completed / total * 100) if total > 0 else 0.0

    return {
        "total_interviews": total,
        "completed_interviews": completed,
        "completion_rate_percent": round(completion_rate, 2),
        "average_total_score": round(avg_score, 2),
        "domain_breakdown_avg_score": domain_breakdown
    }