# backend/services/question_service.py

QUESTION_BANK = {
    "hr": {
        "easy": [
            "Tell me about yourself.",
            "Why do you want this job?",
            "What are your strengths and weaknesses?"
        ],
        "medium": [
            "Describe a time you handled a conflict in a team.",
            "Tell me about a failure and what you learned.",
            "How do you prioritize tasks under pressure?"
        ],
        "hard": [
            "Tell me about a time you led a project end-to-end.",
            "How do you handle ambiguity when requirements are unclear?",
            "What would you do in your first 30 days in this role?"
        ]
    },
    "java": {
        "easy": [
            "What is OOP? Explain with an example.",
            "Difference between JDK, JRE, JVM?",
            "What is method overloading?"
        ],
        "medium": [
            "Explain Collections vs Streams.",
            "Checked vs unchecked exceptions?",
            "How does HashMap work (high level)?"
        ],
        "hard": [
            "Explain JVM memory areas and GC basics.",
            "How would you design a scalable REST API in Spring Boot?",
            "Explain concurrency issues and how to avoid them."
        ]
    },
    "dbms": {
        "easy": [
            "What is a primary key?",
            "What is normalization?",
            "Difference between DELETE and TRUNCATE?"
        ],
        "medium": [
            "Explain indexing and why it helps.",
            "Explain ACID properties.",
            "Types of JOINs?"
        ],
        "hard": [
            "Explain isolation levels and anomalies.",
            "How to optimize a slow SQL query?",
            "Explain partitioning and use cases."
        ]
    },
    "ai": {
        "easy": [
            "What is supervised learning?",
            "What is overfitting?",
            "Precision vs recall?"
        ],
        "medium": [
            "Explain bias-variance tradeoff.",
            "What is a confusion matrix?",
            "What is TF-IDF (high level)?"
        ],
        "hard": [
            "Explain embeddings and why they matter.",
            "Explain attention mechanism (high level).",
            "How would you evaluate an NLP model beyond accuracy?"
        ]
    }
}


def get_questions(domain: str, difficulty: str):
    domain = (domain or "hr").lower().strip()
    difficulty = (difficulty or "easy").lower().strip()

    if domain not in QUESTION_BANK:
        raise ValueError("Invalid domain")

    if difficulty not in QUESTION_BANK[domain]:
        raise ValueError("Invalid difficulty")

    return QUESTION_BANK[domain][difficulty]