# backend/routes/insights_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.deps import get_db
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.services.insights_service import build_insights

router = APIRouter(tags=["Insights"])


@router.get("/insights/{session_id}")
def insights(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return build_insights(session_id, db, user.id)