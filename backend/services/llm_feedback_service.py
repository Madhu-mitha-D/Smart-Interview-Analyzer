# backend/services/llm_feedback_service.py
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_llm_feedback(*, question: str, answer: str, domain: str, score_0_to_10: int, similarity_0_to_1: float) -> str:
    prompt = f"""
You are an interview coach. Give short, human-sounding feedback.
Domain: {domain}
Question: {question}
Candidate answer: {answer}
Current score (0-10): {score_0_to_10}
Similarity (0-1): {similarity_0_to_1}

Rules:
- Be encouraging but honest.
- 2-4 bullet points max.
- Give 1 improved sample answer (2-4 lines) ONLY if score <= 4.
- Avoid robotic repeated lines.
"""

    resp = client.responses.create(
        model="gpt-5",
        input=prompt,
        reasoning={"effort": "low"},
    )

    # responses API returns structured output; simplest extraction:
    text = ""
    for item in resp.output:
        if item.type == "message":
            for c in item.content:
                if c.type == "output_text":
                    text += c.text
    return text.strip()