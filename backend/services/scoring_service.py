# backend/services/scoring_service.py
from __future__ import annotations

import random
import re
from typing import Dict, Tuple

from sentence_transformers import SentenceTransformer, util
from backend.services.quality_service import analyze_answer_quality

# Load once (cached after first download)
_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

DOMAIN_ANCHORS = {
    "hr": [
        "Answer clearly, be specific, and support with a real example and result.",
        "Use STAR for behavioural questions: Situation, Task, Action, Result.",
        "Show motivation and fit: skills + proof + why company/role.",
    ],
    "java": [
        "Give definition, then a simple example, then key differences/edge cases.",
        "Mention time/space complexity if relevant.",
        "Use correct terminology, keep it structured.",
    ],
    "dbms": [
        "Give definition, then an example, then why it matters in practice.",
        "Mention ACID/isolation/indexing tradeoffs when relevant.",
        "Keep it concise and correct.",
    ],
    "ai": [
        "Define the term, give intuition, then an example/use case.",
        "Mention evaluation metrics and tradeoffs when relevant.",
        "Keep high-level unless asked for equations.",
    ],
}

PHRASES = {
    "strong": [
        "Strong and relevant.",
        "Nice — this matches the question well.",
        "Good alignment with what was asked.",
    ],
    "mid": [
        "Decent start, but add one concrete example.",
        "Partly relevant — add proof and tighten structure.",
        "Good direction; add a clearer point and example.",
    ],
    "weak": [
        "Low relevance — key point is missing.",
        "This doesn’t answer the core yet.",
        "Off-target — refocus on the question.",
    ],
    "close": [
        "Start with the direct answer in the first sentence.",
        "Lead with the main point, then support it.",
        "Answer the core first, then add an example.",
    ],
}


def _pick(options, seed_text: str) -> str:
    seed = sum(ord(c) for c in (seed_text or "")) % 10_000
    rnd = random.Random(seed)
    return rnd.choice(options) if options else ""


def _clip(s: str) -> str:
    s = (s or "").strip()
    return re.sub(r"\s+", " ", s)


def _anchor_for(domain: str, question_text: str, question_index: int) -> str:
    domain = (domain or "").lower().strip()
    q = (question_text or "").lower()

    anchors = DOMAIN_ANCHORS.get(domain) or ["Answer clearly and support with an example."]

    if domain == "hr":
        if any(x in q for x in ["time you", "handled", "conflict", "failure", "learned", "pressure", "led", "ambiguity", "unclear"]):
            return "Use STAR: Situation, Task, Action, Result. Include what you did and the outcome."
        if "tell me about yourself" in q:
            return "Structure: who you are now, key skills, 1 project proof, what role you want."
        if "why do you want" in q:
            return "Answer: role fit + 1 proof + why company/product + how you'll contribute."

    if domain in {"java", "dbms", "ai"}:
        if any(x in q for x in ["difference", "vs", "compare"]):
            return "Give definitions for both, then 3 clear differences, then a short example."
        if any(x in q for x in ["explain", "what is"]):
            return "Give definition, intuition, then a simple example. Mention 1 key point/edge case."

    return anchors[0]


def semantic_score(
    answer: str,
    question_index: int,
    question_text: str = "",
    domain: str = "",
) -> Tuple[int, str, float]:
    answer = _clip(answer)
    if not answer:
        return 0, "No answer detected.", 0.0

    ideal = _anchor_for(domain, question_text, question_index)

    emb_user = _model.encode(answer, convert_to_tensor=True, normalize_embeddings=True)
    emb_ideal = _model.encode(ideal, convert_to_tensor=True, normalize_embeddings=True)

    sim = float(util.cos_sim(emb_user, emb_ideal).item())
    score = int(round(sim * 10))

    if score >= 8:
        fb = _pick(PHRASES["strong"], answer)
    elif score >= 5:
        fb = _pick(PHRASES["mid"], answer)
    else:
        fb = _pick(PHRASES["weak"], answer)

    return score, fb, sim


def _quality_addons(answer: str, quality: Dict) -> list[str]:
    addons = []
    ans = _clip(answer)
    length = int(quality.get("length_chars") or len(ans))
    filler = int(quality.get("filler_count") or 0)
    structure = (quality.get("structure") or "").upper()
    star_flags = quality.get("star_flags") or {}

    if length < 80:
        addons.append("Too short — add 1 example/result (what you did + outcome).")
    elif length > 700:
        addons.append("Too long — keep 2–4 key points + one example.")

    if filler >= 4:
        addons.append("Reduce filler words; pause instead of filling silence.")

    if structure in {"UNSTRUCTURED", "RAMBLING"}:
        addons.append("Use structure: main point → example → takeaway.")

    star_count = sum(1 for v in star_flags.values() if v)
    if star_count == 0 and length >= 80:
        addons.append("Try STAR-lite: Situation → Action → Result (1 line each).")

    return addons


def score_answer(answer: str, question_index: int, question_text: str = "", domain: str = ""):
    sem_score, sem_fb, sim = semantic_score(answer, question_index, question_text, domain)
    quality = analyze_answer_quality(answer)

    parts = [sem_fb]
    if sem_score <= 3:
        parts.append(_pick(PHRASES["close"], answer))

    addons = _quality_addons(answer, quality)
    if addons:
        parts.append("Tips: " + " | ".join(addons[:2]))

    if domain:
        parts.append(f"Focus: {_anchor_for(domain, question_text, question_index)}")

    feedback = " ".join(p for p in parts if p)

    # Optional LLM upgrade (only when weak to reduce robotic repetition)
    if sim < 0.35:
        try:
            from backend.services.llm_feedback_service import generate_llm_feedback

            llm_fb = generate_llm_feedback(
                question=question_text or "Interview question",
                answer=answer,
                domain=domain or "hr",
                score_0_to_10=sem_score,
                similarity_0_to_1=sim,
            )
            if llm_fb:
                feedback = llm_fb
        except Exception:
            pass

    return sem_score, feedback, sim, quality