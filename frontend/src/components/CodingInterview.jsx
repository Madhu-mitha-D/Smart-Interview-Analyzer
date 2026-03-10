import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import api from "../api/axios";
import { PrimaryButton, GhostButton } from "./Buttons";

const DIFFICULTY_TIME = {
  easy: 15 * 60,
  medium: 25 * 60,
  hard: 40 * 60,
};

function formatTime(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function buildCodeFeedback({ code, result, problem }) {
  const feedback = [];

  if (!result) return feedback;

  if (result.passed) {
    feedback.push("Good job — all hidden test cases passed.");
  } else {
    feedback.push("Your logic is partially correct, but some hidden test cases are failing.");
  }

  const lines = (code || "").split("\n").length;
  if (lines <= 3) {
    feedback.push("Your solution is very short. Double-check edge cases.");
  } else if (lines > 25) {
    feedback.push("Try simplifying the solution to improve readability.");
  }

  const lowerCode = (code || "").toLowerCase();

  if (lowerCode.includes("for") && lowerCode.split("for").length - 1 >= 2) {
    feedback.push("There may be nested iteration here. Think about whether time complexity can be improved.");
  }

  if (lowerCode.includes("dict") || lowerCode.includes("{}")) {
    feedback.push("Nice use of a hash-based structure if it fits the problem.");
  }

  if (lowerCode.includes("print(")) {
    feedback.push("Remove debug print statements before final submission.");
  }

  if (problem?.id === "two_sum") {
    feedback.push("For Two Sum, a hashmap approach is usually more efficient than checking every pair.");
  }

  if (problem?.id === "reverse_string") {
    feedback.push("For reverse string, keep the solution concise and handle empty input safely.");
  }

  if (problem?.id === "palindrome_check") {
    feedback.push("Make sure the palindrome logic works correctly for both odd and even length strings.");
  }

  if (problem?.id === "first_non_repeating") {
    feedback.push("Think about frequency counting first, then scanning once for the answer.");
  }

  return feedback.slice(0, 4);
}

export default function CodingInterview() {
  const [difficulty, setDifficulty] = useState("easy");
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(DIFFICULTY_TIME.easy);
  const [isPaused, setIsPaused] = useState(false);
  const autoSubmittedRef = useRef(false);

  const timeLabel = useMemo(() => formatTime(secondsLeft), [secondsLeft]);

  useEffect(() => {
    if (!problem || result || isPaused) return;

    if (secondsLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submitCode(true);
      }
      return;
    }

    const t = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [problem, result, isPaused, secondsLeft]);

  const loadProblem = async () => {
    setResult(null);
    setLoading(true);
    autoSubmittedRef.current = false;

    try {
      const res = await api.post("/start-coding-interview", { difficulty });
      const q = res.data.question;

      setProblem(q);
      setCode(q.starter_code || "");
      setSecondsLeft(DIFFICULTY_TIME[difficulty] || DIFFICULTY_TIME.easy);
      setIsPaused(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to load coding question");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (auto = false) => {
    if (!problem) return;

    setLoading(true);

    try {
      const res = await api.post("/submit-code", {
        question_id: problem.id,
        code,
      });

      setResult({
        ...res.data,
        autoSubmitted: auto,
      });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Code submission failed");
    } finally {
      setLoading(false);
    }
  };

  const resetCode = () => {
    if (!problem) return;
    setCode(problem.starter_code || "");
    setResult(null);
    setSecondsLeft(DIFFICULTY_TIME[difficulty] || DIFFICULTY_TIME.easy);
    setIsPaused(false);
    autoSubmittedRef.current = false;
  };

  const feedback = buildCodeFeedback({ code, result, problem });

  return (
    <div className="space-y-6">
      {!problem && (
        <>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3"
            >
              <option value="easy">Easy — 15 min</option>
              <option value="medium">Medium — 25 min</option>
              <option value="hard">Hard — 40 min</option>
            </select>
          </div>

          <PrimaryButton
            onClick={loadProblem}
            disabled={loading}
            className="px-6 py-3"
          >
            {loading ? "Loading..." : "Start Coding Question"}
          </PrimaryButton>
        </>
      )}

      {problem && (
        <>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
                  {problem.difficulty}
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
                  {problem.language}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`text-sm ${
                    secondsLeft <= 60 && !isPaused ? "text-red-300" : "text-white/70"
                  }`}
                >
                  Time Remaining: <span className="text-white font-medium">{timeLabel}</span>
                  {isPaused ? <span className="ml-2 text-yellow-300">Paused</span> : null}
                </div>

                {!result ? (
                  <button
                    type="button"
                    onClick={() => setIsPaused((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm transition hover:bg-white/10"
                    title={isPaused ? "Resume timer" : "Pause timer"}
                  >
                    {isPaused ? "▶" : "⏸"}
                  </button>
                ) : null}
              </div>
            </div>

            <p className="text-white/75">{problem.statement}</p>

            {problem.sample_test_cases?.length ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <h5 className="font-medium">Sample Test Cases</h5>
                <div className="mt-3 space-y-2 text-sm text-white/75">
                  {problem.sample_test_cases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div>Input: {JSON.stringify(tc.input)}</div>
                      <div>Expected: {JSON.stringify(tc.expected)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <Editor
              height="420px"
              language={problem?.language || "python"}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 16 },
                readOnly: !!result,
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton
              onClick={() => submitCode(false)}
              disabled={loading || !!result}
              className="px-6 py-3"
            >
              {loading ? "Running..." : "Run Code"}
            </PrimaryButton>

            <GhostButton
              type="button"
              onClick={resetCode}
              className="px-6 py-3"
            >
              Reset Code
            </GhostButton>

            <GhostButton
              type="button"
              onClick={() => {
                setProblem(null);
                setCode("");
                setResult(null);
                setIsPaused(false);
                setSecondsLeft(DIFFICULTY_TIME.easy);
                autoSubmittedRef.current = false;
              }}
              className="px-6 py-3"
            >
              Change Problem
            </GhostButton>
          </div>
        </>
      )}

      {result && (
        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <h4 className="text-lg font-semibold">Score: {result.score} / 10</h4>
            <p className="text-white/70">
              Passed {result.passed_count} / {result.total_count} hidden test cases
            </p>
            {result.autoSubmitted ? (
              <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
                Auto-submitted on timeout
              </span>
            ) : null}
          </div>

          {result.passed ? (
            <p className="text-sm text-green-300">All hidden test cases passed.</p>
          ) : (
            <p className="text-sm text-red-300">Some hidden test cases failed.</p>
          )}

          {result.error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {result.error}
            </div>
          ) : null}

          {feedback.length > 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <h5 className="font-medium">Code Feedback</h5>
              <div className="mt-3 space-y-2 text-sm text-white/75">
                {feedback.map((item, idx) => (
                  <div key={idx}>• {item}</div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {result.results?.map((r) => (
              <div
                key={r.case_no}
                className={`rounded-xl border p-4 ${
                  r.passed
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-red-500/30 bg-red-500/10"
                }`}
              >
                <div className="font-medium">
                  Case {r.case_no} — {r.passed ? "Passed" : "Failed"}
                </div>

                <div className="mt-2 text-sm text-white/70">
                  <div>Input: {JSON.stringify(r.input)}</div>
                  <div>Expected: {JSON.stringify(r.expected)}</div>
                  <div>Actual: {JSON.stringify(r.actual)}</div>
                  {r.error ? <div>Error: {r.error}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}