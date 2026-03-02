import re
from typing import Dict, List

FILLERS = [
    "um", "uh", "like", "actually", "basically", "literally", "you know", "so", "well"
]

STAR_HINTS = {
    "s": ["situation", "context", "background"],
    "t": ["task", "goal", "responsibility"],
    "a": ["action", "did", "implemented", "worked", "handled", "built"],
    "r": ["result", "impact", "outcome", "improved", "reduced", "increased"]
}

def _count_fillers(text: str) -> int:
    t = text.lower()
    count = 0
    for f in FILLERS:
        count += len(re.findall(rf"\b{re.escape(f)}\b", t))
    return count

def _star_check(text: str) -> Dict[str, bool]:
    t = text.lower()
    return {
        "S": any(w in t for w in STAR_HINTS["s"]),
        "T": any(w in t for w in STAR_HINTS["t"]),
        "A": any(w in t for w in STAR_HINTS["a"]),
        "R": any(w in t for w in STAR_HINTS["r"]),
    }

def analyze_answer_quality(answer: str) -> Dict:
    answer = (answer or "").strip()
    if not answer:
        return {
            "clarity": 0,
            "structure": "NONE",
            "filler_count": 0,
            "length_chars": 0,
            "star_flags": {"S": False, "T": False, "A": False, "R": False},
            "tips": ["Answer is empty. Try responding with 2–4 clear sentences."],
        }

    length_chars = len(answer)
    filler_count = _count_fillers(answer)
    star = _star_check(answer)
    star_score = sum(1 for v in star.values() if v)

    length_points = min(max(length_chars // 60, 1), 6)  # 1..6
    filler_penalty = min(filler_count, 4)
    clarity = max(min(length_points + (4 - filler_penalty), 10), 1)

    if star_score >= 3:
        structure = "STAR_LIKE"
    elif star_score == 2:
        structure = "PARTIAL_STAR"
    else:
        structure = "UNSTRUCTURED"

    tips: List[str] = []
    if length_chars < 80:
        tips.append("Add 1 real example (what you did + result).")
    if filler_count >= 2:
        tips.append("Reduce filler words (um/like/actually). Pause instead.")
    if star_score < 3:
        tips.append("Use STAR: Situation → Task → Action → Result.")

    if not tips:
        tips.append("Good structure. Add 1 metric/result to make it stronger.")

    return {
        "clarity": int(clarity),
        "structure": structure,
        "filler_count": int(filler_count),
        "length_chars": int(length_chars),
        "star_flags": star,
        "tips": tips,
    }
