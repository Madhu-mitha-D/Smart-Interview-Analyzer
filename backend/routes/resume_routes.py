from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.routes.auth_routes import get_current_user
from backend.models.user_model import User
from backend.database.deps import get_db

from backend.services.resume_service import save_resume_file, extract_resume_text
from backend.services.skill_extractor_service import extract_skills, extract_project_lines
from backend.services.resume_question_service import generate_resume_questions
from backend.services.interview_service import create_resume_interview

router = APIRouter(prefix="/resume", tags=["Resume Interview"])


@router.post("/analyze")
def analyze_resume(
    resume: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    try:
        file_path, original_name = save_resume_file(resume)
        resume_text = extract_resume_text(file_path)

        if not resume_text.strip():
            raise ValueError("Could not extract any text from the uploaded resume.")

        skills = extract_skills(resume_text)
        project_lines = extract_project_lines(resume_text)
        questions = generate_resume_questions(skills, project_lines)

        return {
            "message": "Resume analyzed successfully",
            "filename": original_name,
            "skills": skills,
            "project_lines": project_lines,
            "questions": questions,
            "question_count": len(questions),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")


@router.post("/start-interview")
def start_resume_interview(
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        file_path, original_name = save_resume_file(resume)
        resume_text = extract_resume_text(file_path)

        if not resume_text.strip():
            raise ValueError("Could not extract any text from the uploaded resume.")

        skills = extract_skills(resume_text)
        project_lines = extract_project_lines(resume_text)
        questions = generate_resume_questions(skills, project_lines)

        interview, first_question = create_resume_interview(
            db=db,
            user_id=user.id,
            questions=questions,
        )

        return {
            "message": "Resume interview started successfully",
            "filename": original_name,
            "skills": skills,
            "session_id": interview.session_id,
            "domain": interview.domain,
            "difficulty": interview.difficulty,
            "question_index": 0,
            "question": first_question,
            "finished": False,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume interview start failed: {str(e)}")