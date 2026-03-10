import re

def count_fillers(text: str) -> int:
    text = (text or "").lower()
    count = 0

    words = re.findall(r"\b[a-z']+\b", text)
    for w in words:
        if w in {"um", "uh", "like", "actually", "basically", "so"}:
            count += 1

    count += text.count("you know")
    return count


def estimate_pause_count(duration_sec: float, word_count: int) -> int:
    if duration_sec <= 0:
        return 0

    expected_words = duration_sec / 2.5
    gap_factor = max(0, expected_words - word_count)
    return int(gap_factor // 8)


def pace_label(words_per_minute: float) -> str:
    if words_per_minute < 90:
        return "Slow"
    if words_per_minute <= 160:
        return "Good"
    return "Fast"


def communication_score(words_per_minute: float, filler_count: int, pause_count: int) -> float:
    score = 10.0

    if words_per_minute < 90:
        score -= 2
    elif words_per_minute > 160:
        score -= 1.5

    score -= min(2.5, filler_count * 0.25)
    score -= min(2.0, pause_count * 0.3)

    return round(max(0.0, score), 2)


def analyze_communication(transcript: str, duration_sec: float) -> dict:
    transcript = (transcript or "").strip()
    words = re.findall(r"\b[a-zA-Z']+\b", transcript)
    word_count = len(words)

    minutes = duration_sec / 60 if duration_sec > 0 else 0
    wpm = round(word_count / minutes, 2) if minutes > 0 else 0.0

    filler_count = count_fillers(transcript)
    pause_count = estimate_pause_count(duration_sec, word_count)

    return {
        "word_count": word_count,
        "duration_sec": round(duration_sec, 2),
        "words_per_minute": wpm,
        "pace_label": pace_label(wpm),
        "filler_count": filler_count,
        "pause_count": pause_count,
        "communication_score": communication_score(wpm, filler_count, pause_count),
    }