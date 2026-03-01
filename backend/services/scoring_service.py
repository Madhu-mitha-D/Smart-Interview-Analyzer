from sentence_transformers import SentenceTransformer, util

# Load once (VERY IMPORTANT)
# This will download model on first run and cache it.
_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Ideal answers per question index (you can expand later)
IDEAL_ANSWERS = {
    0: "I am a motivated student with strong interest in software development. I enjoy building projects, learning new technologies, and working in teams.",
    1: "I want this job because it matches my skills and interests, and I can learn and contribute. I am excited about the role and the company’s goals.",
    2: "My strengths are problem-solving and consistency. My weakness is overthinking sometimes, but I manage it by planning and getting feedback."
}

def semantic_score(answer: str, question_index: int):
    answer = (answer or "").strip()
    if not answer:
        return 0, "No answer detected."

    ideal = IDEAL_ANSWERS.get(question_index)
    if not ideal:
        # fallback if no ideal answer exists for that question
        ideal = "A good answer should be clear, relevant, and supported by an example."

    # Embeddings
    emb_user = _model.encode(answer, convert_to_tensor=True, normalize_embeddings=True)
    emb_ideal = _model.encode(ideal, convert_to_tensor=True, normalize_embeddings=True)

    # cosine similarity (0..1)
    sim = util.cos_sim(emb_user, emb_ideal).item()

    # convert similarity -> score (0..10)
    # You can tune these thresholds later
    score = round(sim * 10)

    if score >= 8:
        feedback = "Excellent and relevant answer. Good clarity."
    elif score >= 5:
        feedback = "Good answer, but add more detail or a real example."
    elif score >= 3:
        feedback = "Somewhat relevant, but it needs better structure and clarity."
    else:
        feedback = "Weak relevance. Try to answer directly and add a clear point."

    return score, feedback, sim