from backend.data.coding_questions import CODING_QUESTIONS


def _serialize_question_for_client(question: dict, language: str = "python") -> dict:
    language = (language or "python").lower().strip()

    starter_code = question.get("starter_code", {})
    function_name = question.get("function_name", {})

    if language not in starter_code:
        language = "python"

    return {
        "id": question["id"],
        "title": question["title"],
        "difficulty": question["difficulty"],
        "language": language,
        "tags": question.get("tags", []),
        "statement": question["statement"],
        "constraints": question.get("constraints", []),
        "examples": question.get("examples", []),
        "starter_code": starter_code.get(language, ""),
        "function_name": function_name.get(language, ""),
        "sample_test_cases": question.get("sample_test_cases", []),
    }


def get_coding_question(difficulty: str = "easy", language: str = "python"):
    difficulty = (difficulty or "easy").lower().strip()

    questions = [
        q for q in CODING_QUESTIONS
        if q.get("difficulty", "").lower() == difficulty
    ]

    if not questions:
        raise ValueError("No coding questions found for this difficulty")

    question = questions[0]
    return _serialize_question_for_client(question, language)


def get_coding_question_by_id(question_id: str):
    for question in CODING_QUESTIONS:
        if question["id"] == question_id:
            return question

    raise ValueError("Coding question not found")


def get_coding_question_by_id_and_language(question_id: str, language: str = "python"):
    question = get_coding_question_by_id(question_id)
    return _serialize_question_for_client(question, language)