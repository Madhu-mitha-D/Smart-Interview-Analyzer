import os
import re
from typing import Optional

from openai import OpenAI

# Uses env var OPENAI_API_KEY automatically if set.
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _clean_text(s: str) -> str:
    s = (s or "").strip()
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s


def humanize_feedback(
    *,
    domain: str,
    question: str,
    score_0_to_10: int,
    similarity_0_to_1: float,
    raw_feedback: str,
) -> str:
    """
    Post-process feedback to feel more natural + avoid robotic repeats.
    Adds STAR only when it's actually a behavioral-style prompt.
    """
    domain_l = (domain or "").lower().strip()
    q_l = (question or "").lower().strip()
    score = int(score_0_to_10 or 0)
    sim = float(similarity_0_to_1 or 0.0)

    text = _clean_text(raw_feedback)

    # Remove robotic phrases if they appear
    text = re.sub(
        r"(?i)\b(low relevance|high relevance|key point is missing|off-target)\b\s*[-—:]*\s*",
        "",
        text,
    ).strip()

    tips: list[str] = []

    # General coaching based on score
    if score <= 3:
        tips += [
            "Start with a direct 1-line answer first.",
            "Add 1 small example (what you did → result).",
            "Keep it ~20–40 seconds, then stop.",
        ]
    elif score <= 6:
        tips += [
            "Good start — add one concrete example to make it stronger.",
            "Use a simple structure: point → example → takeaway.",
        ]
    else:
        tips += ["Nice — keep the structure, tighten wording a bit."]

    # Similarity hint (only if very low)
    if sim < 0.25:
        tips.append("You drifted a bit — answer the exact question more directly.")

    # STAR only when it makes sense
    behavioral = (domain_l in {"hr", "behavioral"}) or any(
        k in q_l
        for k in [
            "tell me about yourself",
            "challenge",
            "conflict",
            "weakness",
            "strength",
            "why should we hire",
            "time you",
            "handled",
            "failure",
            "pressure",
            "led",
        ]
    )
    if behavioral and score <= 6:
        tips.append("Try STAR: Situation → Task → Action → Result (1–2 lines each).")

    # Deduplicate tips while keeping order
    seen = set()
    tips = [t for t in tips if not (t in seen or seen.add(t))]

    if not text:
        return "• " + "\n• ".join(tips[:3])

    # If model already wrote bullets, just add a small tips section
    has_bullets = ("•" in text) or re.search(r"(?m)^\s*-\s+", text)
    if has_bullets:
        return _clean_text(text) + "\n\nQuick tips:\n• " + "\n• ".join(tips[:3])

    return _clean_text(text) + "\n\nQuick tips:\n• " + "\n• ".join(tips[:3])


def generate_llm_feedback(
    *,
    question: str,
    answer: str,
    domain: str,
    score_0_to_10: int,
    similarity_0_to_1: float,
    model: Optional[str] = None,
) -> str:
    """
    Calls OpenAI Responses API to generate short, human feedback.
    """
    model_name = model or os.getenv("OPENAI_MODEL") or "gpt-5.2-chat-latest"

    # If API key missing, don't crash backend
    if not os.getenv("OPENAI_API_KEY"):
        raw = (
            "• Answer the question directly in the first sentence.\n"
            "• Add one example and the result.\n"
            "• Keep it short and structured."
        )
        return humanize_feedback(
            domain=domain,
            question=question,
            score_0_to_10=score_0_to_10,
            similarity_0_to_1=similarity_0_to_1,
            raw_feedback=raw,
        )

    prompt = f"""
You are an interview coach. Give short, natural feedback.

Domain: {domain}
Question: {question}
Candidate answer: {answer}
Score (0-10): {score_0_to_10}
Similarity (0-1): {similarity_0_to_1}

Write:
- 2 to 4 bullet points (no long paragraphs).
- If score <= 4, add ONE improved sample answer (2-4 lines), labelled "Sample answer:".
- Avoid robotic repeated phrases like "low relevance".
""".strip()

    resp = client.responses.create(
        model=model_name,
        input=prompt,
        reasoning={"effort": "low"},
    )

    # New SDK provides output_text for convenience. :contentReference[oaicite:1]{index=1}
    raw_text = getattr(resp, "output_text", "") or ""

    return humanize_feedback(
        domain=domain,
        question=question,
        score_0_to_10=score_0_to_10,
        similarity_0_to_1=similarity_0_to_1,
        raw_feedback=raw_text,
    )