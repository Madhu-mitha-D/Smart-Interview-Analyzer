 # backend/services/adaptive_service.py
from typing import Literal

Difficulty = Literal["easy", "medium", "hard"]

_ORDER = ["easy", "medium", "hard"]

def _clamp_idx(i: int) -> int:
    return max(0, min(i, len(_ORDER) - 1))

def adjust_difficulty(current: Difficulty, latest_score: int, avg_score_so_far: float) -> Difficulty:
    """
    Adaptive rules (per answer):
    - if latest_score >= 8 OR avg >= 7 -> step up
    - if latest_score <= 3 OR avg <= 4 -> step down
    - else keep
    """
    cur_i = _ORDER.index(current)

    if latest_score >= 8 or avg_score_so_far >= 7:
        return _ORDER[_clamp_idx(cur_i + 1)]
    if latest_score <= 3 or avg_score_so_far <= 4:
        return _ORDER[_clamp_idx(cur_i - 1)]
    return current