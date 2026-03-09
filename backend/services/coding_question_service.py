CODING_QUESTION_BANK = {
    "easy": [
        {
            "id": "reverse_string",
            "title": "Reverse String",
            "difficulty": "easy",
            "language": "python",
            "statement": "Write a function reverse_string(s) that returns the reversed version of the input string.",
            "starter_code": "def reverse_string(s):\n    # write your code here\n    pass",
            "function_name": "reverse_string",
            "test_cases": [
                {"input": ["hello"], "expected": "olleh"},
                {"input": ["madam"], "expected": "madam"},
                {"input": [""], "expected": ""},
            ],
        },
        {
            "id": "palindrome_check",
            "title": "Palindrome Check",
            "difficulty": "easy",
            "language": "python",
            "statement": "Write a function is_palindrome(s) that returns True if the string is a palindrome, otherwise False.",
            "starter_code": "def is_palindrome(s):\n    # write your code here\n    pass",
            "function_name": "is_palindrome",
            "test_cases": [
                {"input": ["madam"], "expected": True},
                {"input": ["python"], "expected": False},
                {"input": ["racecar"], "expected": True},
            ],
        },
    ],
    "medium": [
        {
            "id": "two_sum",
            "title": "Two Sum",
            "difficulty": "medium",
            "language": "python",
            "statement": "Write a function two_sum(nums, target) that returns the indices of the two numbers such that they add up to target.",
            "starter_code": "def two_sum(nums, target):\n    # write your code here\n    pass",
            "function_name": "two_sum",
            "test_cases": [
                {"input": [[2, 7, 11, 15], 9], "expected": [0, 1]},
                {"input": [[3, 2, 4], 6], "expected": [1, 2]},
            ],
        }
    ],
    "hard": [
        {
            "id": "first_non_repeating",
            "title": "First Non-Repeating Character",
            "difficulty": "hard",
            "language": "python",
            "statement": "Write a function first_non_repeating(s) that returns the first non-repeating character in a string, or None if there is no such character.",
            "starter_code": "def first_non_repeating(s):\n    # write your code here\n    pass",
            "function_name": "first_non_repeating",
            "test_cases": [
                {"input": ["aabbcddee"], "expected": "c"},
                {"input": ["aabbcc"], "expected": None},
            ],
        }
    ],
}


def get_coding_question(difficulty: str = "easy"):
    difficulty = (difficulty or "easy").lower().strip()

    if difficulty not in CODING_QUESTION_BANK:
        raise ValueError("Invalid coding difficulty")

    questions = CODING_QUESTION_BANK[difficulty]
    if not questions:
        raise ValueError("No coding questions found")

    return questions[0]