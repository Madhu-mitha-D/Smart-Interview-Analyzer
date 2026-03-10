from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.deps import get_db
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.services.insights_service import build_insights, build_overall_insights

router = APIRouter(tags=["Insights"])


@router.get("/insights")
def overall_insights(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return build_overall_insights(db, user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights/{session_id}")
def insights(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return build_insights(session_id, db, user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))