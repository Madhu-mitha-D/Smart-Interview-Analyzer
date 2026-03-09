from typing import Optional

FOLLOWUP_TEMPLATES = {
    "resume": [
        "Can you explain your answer with a practical example from your project work?",
        "What was your exact contribution in that part?",
        "What challenge did you face there, and how did you solve it?",
    ],
    "java": [
        "Can you explain that with a small Java example?",
        "What is one common mistake developers make in this area?",
        "How would you apply this concept in a real backend project?",
    ],
    "python": [
        "Can you explain that with a small Python example?",
        "How have you used this in a real project or task?",
        "What is one common mistake developers make here?",
    ],
    "dbms": [
        "Can you explain that with a practical database example?",
        "Where would this matter in a real application?",
        "What issue can happen if this is not handled properly?",
    ],
    "web": [
        "How would you apply that in a real web application?",
        "Can you give an example from a frontend or backend project?",
        "What is one common issue developers face in this area?",
    ],
    "ai": [
        "Can you give a practical example of that in an AI or ML project?",
        "Why is this important in real-world model performance?",
        "What problem can occur if this is not handled correctly?",
    ],
}


def should_generate_followup(
    domain: str,
    question_text: str,
    answer: str,
    score_0_to_10: int,
    similarity_0_to_1: float,
    quality: dict,
) -> bool:
    answer = (answer or "").strip()
    word_count = len(answer.split())
    filler_count = int((quality or {}).get("filler_count") or 0)

    # keep follow-ups useful, not annoying
    if word_count < 12:
        return False

    # if answer is decent and has enough substance, ask deeper
    if score_0_to_10 >= 5 and similarity_0_to_1 >= 0.30:
        return True

    # sometimes for resume answers with enough content, still ask deeper
    if domain == "resume" and word_count >= 20 and filler_count < 8:
        return True

    return False


def generate_followup_question(
    domain: str,
    question_text: str,
    answer: str,
) -> Optional[str]:
    domain = (domain or "").lower().strip()
    question_text = (question_text or "").strip()
    answer = (answer or "").strip()

    if not answer:
        return None

    if "project" in question_text.lower():
        return "What challenge did you personally face in that project, and how did you solve it?"

    if "why" in question_text.lower():
        return "Can you justify that choice with a practical reason or example?"

    if "difference" in question_text.lower():
        return "Which of the two would you choose in a real project, and why?"

    templates = FOLLOWUP_TEMPLATES.get(domain) or FOLLOWUP_TEMPLATES["resume"]

    # deterministic pick
    idx = (len(answer) + len(question_text)) % len(templates)
    return templates[idx]