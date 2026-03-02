# backend/services/scoring_service.py
from sentence_transformers import SentenceTransformer, util
from backend.services.quality_service import analyze_answer_quality

# Load model once (cached after first download)
_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

IDEAL_ANSWERS = {
    0: "I am a motivated student with strong interest in software development. I enjoy building projects, learning new technologies, and working in teams.",
    1: "I want this job because it matches my skills and interests, and I can learn and contribute. I am excited about the role and the company’s goals.",
    2: "My strengths are problem-solving and consistency. My weakness is overthinking sometimes, but I manage it by planning and feedback."
}

def semantic_score(answer: str, question_index: int):
    """
    Returns: score (0..10), feedback (str), similarity (0..1)
    """
    answer = (answer or "").strip()
    if not answer:
        return 0, "No answer detected.", 0.0

    ideal = IDEAL_ANSWERS.get(question_index) or \
            "A good answer should be clear, relevant, and supported with an example."

    emb_user = _model.encode(answer, convert_to_tensor=True, normalize_embeddings=True)
    emb_ideal = _model.encode(ideal, convert_to_tensor=True, normalize_embeddings=True)

    sim = float(util.cos_sim(emb_user, emb_ideal).item())  # 0..1
    score = int(round(sim * 10))  # 0..10

    if score >= 8:
        feedback = "Excellent and relevant answer. Good clarity."
    elif score >= 5:
        feedback = "Good answer, but add more detail or a real example."
    elif score >= 3:
        feedback = "Somewhat relevant, but it needs better structure and clarity."
    else:
        feedback = "Weak relevance. Try to answer directly and add a clear point."

    return score, feedback, sim

def score_answer(answer: str, question_index: int):
    """
    Returns 4 values (IMPORTANT):
      score (0..10), feedback (str), similarity (0..1), quality (dict)
    """
    sem_score, sem_feedback, sim = semantic_score(answer, question_index)
    quality = analyze_answer_quality(answer)

    tips = quality.get("tips", [])
    if tips:
        sem_feedback = sem_feedback + " Tips: " + " | ".join(tips[:2])

    return sem_score, sem_feedback, sim, quality