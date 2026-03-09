from typing import List

CONCEPT_QUESTIONS = {
    "java": [
        "You mentioned Java in your resume. What are the main features of Java?",
        "What is the difference between abstraction and encapsulation in Java?",
        "What is inheritance in Java and why is it useful?",
    ],
    "python": [
        "You mentioned Python in your resume. Why is Python widely used?",
        "What is the difference between a list and a tuple in Python?",
        "What are some common libraries you have used in Python?",
    ],
    "dbms": [
        "You mentioned DBMS in your resume. What is normalization?",
        "What is the difference between primary key and foreign key?",
        "What is the difference between SQL and NoSQL databases?",
    ],
    "web": [
        "You mentioned web development in your resume. What is the difference between frontend and backend?",
        "What is React and why is it useful?",
        "What is the role of an API in web development?",
    ],
    "dsa": [
        "You mentioned problem solving or DSA. What is the difference between array and linked list?",
        "What is the time complexity of binary search?",
        "What is a stack and where is it used?",
    ],
    "aiml": [
        "You mentioned AI/ML in your resume. What is the difference between AI, ML, and deep learning?",
        "What is overfitting in machine learning?",
        "What is NLP and where is it used?",
    ],
    "cloud": [
        "You mentioned cloud or DevOps tools in your resume. What is Docker used for?",
        "What is the difference between deployment and hosting?",
        "Why is cloud computing useful in modern applications?",
    ],
}

SCENARIO_QUESTIONS = {
    "java": [
        "If your Java application throws frequent NullPointerExceptions in production, how would you debug it?",
        "If your Spring Boot API becomes slow under heavy traffic, what would you check first?",
    ],
    "python": [
        "If your Python script becomes very slow on large data, how would you optimize it?",
        "If your Flask app crashes in production, how would you investigate the issue?",
    ],
    "dbms": [
        "If a SQL query becomes very slow, how would you optimize it?",
        "If duplicate records appear in a database table, how would you troubleshoot it?",
    ],
    "web": [
        "If your React frontend loads slowly, how would you improve performance?",
        "If your API integration fails in production, how would you debug it?",
    ],
    "dsa": [
        "If your solution passes small inputs but times out on large ones, what would you improve?",
        "How would you decide between a stack, queue, and hashmap for a new problem?",
    ],
    "aiml": [
        "If your ML model performs well in training but poorly in production, how would you debug it?",
        "If your NLP model has low accuracy on real-world data, what would you improve first?",
    ],
    "cloud": [
        "If your deployed application goes down suddenly, what steps would you take first?",
        "If Docker works locally but fails in deployment, how would you investigate?",
    ],
}


def generate_project_questions(project_lines: List[str]) -> List[str]:
    questions = []

    if project_lines:
        first_line = project_lines[0]
        questions.append(
            f"You mentioned this in your resume: '{first_line}'. Can you explain this project in detail?"
        )
        questions.append("What was your exact role and contribution in this project?")
        questions.append("What challenges did you face while working on this project?")
    else:
        questions.append("Tell me about one important project you have worked on.")
        questions.append("What was your exact contribution in that project?")
        questions.append("What challenges did you face while building it?")

    return questions


def generate_resume_questions(skills: List[str], project_lines: List[str]) -> List[str]:
    questions = []

    # 1. concept questions from first two detected skills
    for skill in skills[:2]:
        skill_questions = CONCEPT_QUESTIONS.get(skill, [])
        if skill_questions:
            questions.append(skill_questions[0])

    # 2. practical / project questions
    project_questions = generate_project_questions(project_lines)
    questions.extend(project_questions[:2])

    # 3. scenario questions from first two detected skills
    for skill in skills[:2]:
        scenario_questions = SCENARIO_QUESTIONS.get(skill, [])
        if scenario_questions:
            questions.append(scenario_questions[0])

    # 4. closing / HR style questions
    questions.append("Why should we hire you for this role?")
    questions.append("What are your strengths and areas for improvement?")

    # remove duplicates while preserving order
    unique_questions = []
    seen = set()

    for q in questions:
        if q not in seen:
            unique_questions.append(q)
            seen.add(q)

    return unique_questions[:7]