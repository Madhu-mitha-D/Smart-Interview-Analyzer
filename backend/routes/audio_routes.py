from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session
import tempfile
import os
import whisper
import librosa

from backend.database.deps import get_db
from backend.routes.auth_routes import get_current_user
from backend.models.user_model import User
from backend.services.interview_service import submit_interview_answer
from backend.services.communication_service import analyze_communication

router = APIRouter(prefix="/audio", tags=["Audio"])

MODEL_NAME = "base"
_whisper_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model(MODEL_NAME)
    return _whisper_model


@router.post("/submit-answer")
async def audio_submit_answer(
    session_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    suffix = os.path.splitext(file.filename)[1] or ".wav"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        tmp.write(await file.read())

    try:
        model = get_whisper_model()
        result = model.transcribe(tmp_path)
        text = (result.get("text") or "").strip()

        if not text:
            raise HTTPException(status_code=400, detail="No speech detected")

        duration_sec = 0.0
        try:
            y, sr = librosa.load(tmp_path, sr=None)
            duration_sec = librosa.get_duration(y=y, sr=sr)
        except Exception:
            duration_sec = 0.0

        communication = analyze_communication(text, duration_sec)

        resp = submit_interview_answer(db, user.id, session_id, text, communication=communication)
        resp["transcript"] = text
        resp["stt_model"] = MODEL_NAME
        resp["audio_filename"] = file.filename
        resp["communication"] = communication
        return resp

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio submit failed: {e}")
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass