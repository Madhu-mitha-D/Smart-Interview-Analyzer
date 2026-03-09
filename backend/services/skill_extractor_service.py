import re
from typing import List, Dict

SKILL_MAP: Dict[str, List[str]] = {
    "java": ["java", "spring", "spring boot", "hibernate", "jdbc", "jsp", "servlet"],
    "python": ["python", "flask", "django", "pandas", "numpy", "matplotlib"],
    "dbms": ["sql", "mysql", "postgresql", "postgres", "database", "dbms", "mongodb"],
    "web": ["html", "css", "javascript", "react", "node", "express", "frontend", "backend"],
    "dsa": ["data structures", "algorithms", "dsa", "leetcode", "problem solving"],
    "aiml": ["machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "scikit-learn", "ai", "ml"],
    "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "devops"],
}


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_skills(resume_text: str) -> List[str]:
    normalized = normalize_text(resume_text)
    detected = []

    for skill, keywords in SKILL_MAP.items():
        for keyword in keywords:
            if keyword in normalized:
                detected.append(skill)
                break

    # preserve order and uniqueness
    unique_detected = []
    for skill in detected:
        if skill not in unique_detected:
            unique_detected.append(skill)

    return unique_detected


def extract_project_lines(resume_text: str) -> List[str]:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]
    project_lines = []

    for line in lines:
        lower_line = line.lower()
        if any(word in lower_line for word in ["project", "developed", "built", "created", "internship"]):
            project_lines.append(line)

    return project_lines[:5]