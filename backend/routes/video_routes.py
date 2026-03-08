# backend/routes/video_routes.py

from pathlib import Path
import os
import subprocess
import tempfile
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
import whisper

from backend.database.deps import get_db
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.services.interview_service import submit_interview_answer

router = APIRouter(prefix="/video", tags=["Video"])

# Store uploads on backend
BASE_UPLOAD_DIR = Path("uploads")
VIDEO_DIR = BASE_UPLOAD_DIR / "videos"
AUDIO_DIR = BASE_UPLOAD_DIR / "audio"

VIDEO_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

MODEL_NAME = "base"
_whisper_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model(MODEL_NAME)
    return _whisper_model


def extract_audio_from_video(video_path: Path, audio_path: Path):
    """
    Uses FFmpeg to extract mono 16kHz WAV audio from video.
    """
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(video_path),
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        str(audio_path),
    ]

    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False,
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="FFmpeg is not installed or not available in PATH.",
        )

    if result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=f"FFmpeg audio extraction failed: {result.stderr[-400:]}",
        )


@router.post("/submit-answer")
async def video_submit_answer(
    session_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No video file provided")

    ext = os.path.splitext(file.filename)[1].lower() or ".webm"
    unique_id = uuid.uuid4().hex

    video_filename = f"{unique_id}{ext}"
    audio_filename = f"{unique_id}.wav"

    video_path = VIDEO_DIR / video_filename
    audio_path = AUDIO_DIR / audio_filename

    # Save uploaded video
    try:
        with open(video_path, "wb") as f:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {e}")

    try:
        # Extract audio
        extract_audio_from_video(video_path, audio_path)

        # Transcribe extracted audio
        model = get_whisper_model()
        result = model.transcribe(str(audio_path))
        transcript = (result.get("text") or "").strip()

        if not transcript:
            raise HTTPException(status_code=400, detail="No speech detected in video")

        # Reuse your existing answer submission service
        response = submit_interview_answer(db, user.id, session_id, transcript)

        response["transcript"] = transcript
        response["stt_model"] = MODEL_NAME
        response["video_filename"] = video_filename
        response["audio_filename"] = audio_filename
        response["video_path"] = str(video_path)
        response["audio_path"] = str(audio_path)
        response["stored"] = True

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video submit failed: {e}")