from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session
import tempfile, os

import whisper

from backend.database.deps import get_db
from backend.routes.auth_routes import get_current_user
from backend.models.user_model import User
from backend.services.interview_service import submit_interview_answer

router = APIRouter(prefix="/audio", tags=["Audio"])

MODEL_NAME = "base"
_model = None  # lazy load


def get_whisper_model():
    global _model
    if _model is None:
        _model = whisper.load_model(MODEL_NAME)
    return _model


@router.post("/submit-answer")
async def audio_submit_answer(
    session_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    suffix = os.path.splitext(file.filename)[1] or ".webm"
    tmp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            tmp.write(await file.read())

        model = get_whisper_model()
        result = model.transcribe(tmp_path)
        text = (result.get("text") or "").strip()

        if not text:
            raise HTTPException(status_code=400, detail="No speech detected")

        resp = submit_interview_answer(db, user.id, session_id, text)

        # extra info (frontend can ignore safely)
        resp["transcript"] = text
        resp["stt_model"] = MODEL_NAME
        resp["audio_filename"] = file.filename
        return resp

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio submit failed: {e}")
    finally:
        if tmp_path:
            try:
                os.remove(tmp_path)
            except Exception:
                pass