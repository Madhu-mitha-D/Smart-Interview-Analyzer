import traceback


def run_python_code_submission(code: str, function_name: str, test_cases: list):
    namespace = {}

    try:
        exec(code, namespace)
    except Exception as e:
        return {
            "passed": False,
            "passed_count": 0,
            "total_count": len(test_cases),
            "results": [],
            "error": f"Code execution error: {str(e)}",
            "traceback": traceback.format_exc(),
        }

    if function_name not in namespace:
        return {
            "passed": False,
            "passed_count": 0,
            "total_count": len(test_cases),
            "results": [],
            "error": f"Function '{function_name}' not found in submitted code.",
        }

    fn = namespace[function_name]
    results = []
    passed_count = 0

    for i, case in enumerate(test_cases):
        try:
            actual = fn(*case["input"])
            expected = case["expected"]
            ok = actual == expected
            if ok:
                passed_count += 1

            results.append({
                "case_no": i + 1,
                "input": case["input"],
                "expected": expected,
                "actual": actual,
                "passed": ok,
            })
        except Exception as e:
            results.append({
                "case_no": i + 1,
                "input": case["input"],
                "expected": case["expected"],
                "actual": None,
                "passed": False,
                "error": str(e),
            })

    total_count = len(test_cases)
    all_passed = passed_count == total_count

    return {
        "passed": all_passed,
        "passed_count": passed_count,
        "total_count": total_count,
        "results": results,
    }