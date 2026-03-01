from fastapi import FastAPI

from backend.database.database import engine
from backend.models.interview_model import Base
from backend.routes.analysis_routes import router as analytics_router
import backend.routes.interview_routes as interview_module

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(interview_module.router)

app.include_router(analytics_router)