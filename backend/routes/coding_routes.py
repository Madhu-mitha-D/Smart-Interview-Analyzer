from fastapi import APIRouter, HTTPException, Depends, Body

from backend.routes.auth_routes import get_current_user
from backend.models.user_model import User

from backend.services.coding_question_service import (
    get_coding_question,
    get_coding_question_by_id,
)
from backend.services.code_runner_service import run_python_code_submission

router = APIRouter(prefix="/coding", tags=["Coding Interview"])


@router.post("/start")
def start_coding_interview(
    difficulty: str = Body(default="easy", embed=True),
    language: str = Body(default="python", embed=True),
    user: User = Depends(get_current_user),
):
    try:
        question = get_coding_question(difficulty, language)
        return {
            "domain": "coding",
            "difficulty": difficulty,
            "language": question["language"],
            "finished": False,
            "question": question,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/submit")
def submit_code(
    question_id: str = Body(..., embed=True),
    code: str = Body(..., embed=True),
    language: str = Body(default="python", embed=True),
    user: User = Depends(get_current_user),
):
    try:
        question = get_coding_question_by_id(question_id)

        if language != "python":
            return {
                "finished": True,
                "score": 0,
                "passed": False,
                "passed_count": 0,
                "total_count": len(question["hidden_test_cases"]),
                "results": [],
                "error": f"{language.upper()} execution is not enabled yet. Currently only Python execution is supported.",
            }

        function_name_map = question.get("function_name", {})
        function_name = function_name_map.get("python", "")

        result = run_python_code_submission(
            code=code,
            function_name=function_name,
            test_cases=question["hidden_test_cases"],
        )

        score = 0
        if result["total_count"] > 0:
            score = round((result["passed_count"] / result["total_count"]) * 10, 2)

        return {
            "finished": True,
            "score": score,
            "passed": result["passed"],
            "passed_count": result["passed_count"],
            "total_count": result["total_count"],
            "results": result["results"],
            "error": result.get("error"),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Code submission failed: {str(e)}"
        )