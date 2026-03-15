from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from backend.database.database import engine, Base

# IMPORTANT: import models so Base knows them before create_all
from backend.models.user_model import User  # noqa: F401
from backend.models.interview_model import Interview  # noqa: F401
from backend.models.answer_model import Answer  # noqa: F401

from backend.routes.auth_routes import router as auth_router
from backend.routes.analysis_routes import router as analytics_router
from backend.routes.insights_routes import router as insights_router
from backend.routes.audio_routes import router as audio_router
from backend.routes.interview_routes import router as interview_router
from backend.routes.coding_routes import router as coding_router
from backend.routes.video_routes import router as video_router
from backend.routes.resume_routes import router as resume_router

app = FastAPI(title="Smart Interview Analyzer API")

Base.metadata.create_all(bind=engine)

UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.include_router(auth_router)
app.include_router(interview_router)
app.include_router(coding_router)
app.include_router(analytics_router)
app.include_router(insights_router)
app.include_router(audio_router)
app.include_router(video_router)
app.include_router(resume_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)