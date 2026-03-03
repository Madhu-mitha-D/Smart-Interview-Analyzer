# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import engine, Base

# IMPORTANT: import models so Base knows them before create_all
from backend.models.user_model import User  # noqa: F401
from backend.models.interview_model import Interview  # noqa: F401
from backend.models.answer_model import Answer  # noqa: F401

from backend.routes.auth_routes import router as auth_router
from backend.routes.analysis_routes import router as analytics_router
from backend.routes.insights_routes import router as insights_router
import backend.routes.interview_routes as interview_module

app = FastAPI(title="Smart Interview Analyzer API")

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(interview_module.router)
app.include_router(analytics_router)
app.include_router(insights_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)