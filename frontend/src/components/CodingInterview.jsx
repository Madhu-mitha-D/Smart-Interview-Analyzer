import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { startCodingInterview, submitCode } from "../api/codingApi";
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

function DifficultyBadge({ level }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium capitalize text-white/75">
      {level}
    </span>
  );
}

function PanelTab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatPill({ label, value, warn = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${
          warn ? "text-white" : "text-white/80"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function buildCodeFeedback({ code, result, problem }) {
  const feedback = [];
  if (!result) return feedback;

  if (result.passed) {
    feedback.push("Good job — all hidden test cases passed.");
  } else {
    feedback.push(
      "Some hidden test cases failed. Re-check edge cases and logic."
    );
  }

  const lines = (code || "").split("\n").length;
  if (lines <= 4) {
    feedback.push(
      "Your solution is very short. Make sure it handles all valid inputs."
    );
  } else if (lines > 35) {
    feedback.push("Try simplifying the code for better readability.");
  }

  const lowerCode = (code || "").toLowerCase();

  if (lowerCode.includes("print(") || lowerCode.includes("cout")) {
    feedback.push("Remove extra debug output before final submission.");
  }

  if ((lowerCode.match(/\bfor\b/g) || []).length >= 2) {
    feedback.push(
      "This may involve nested iteration. Consider whether time complexity can be improved."
    );
  }

  if (problem?.id === "two_sum") {
    feedback.push(
      "For Two Sum, a hashmap-based approach is usually the cleanest efficient solution."
    );
  }

  return feedback.slice(0, 4);
}

function Surface({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-[24px] border border-white/10 bg-[#141416]/55 backdrop-blur-xl",
        "shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function CodingInterview() {
  const [difficulty, setDifficulty] = useState("easy");
  const [language, setLanguage] = useState("python");

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(DIFFICULTY_TIME.easy);
  const [isPaused, setIsPaused] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState("output");

  const autoSubmittedRef = useRef(false);
  const workspaceRef = useRef(null);
  const resultSectionRef = useRef(null);
  const editorRef = useRef(null);

  const timeLabel = useMemo(() => formatTime(secondsLeft), [secondsLeft]);
  const feedback = buildCodeFeedback({ code, result, problem });

  useEffect(() => {
    if (!problem || result || isPaused) return;

    if (secondsLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        handleSubmitCode(true);
      }
      return;
    }

    const t = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [problem, result, isPaused, secondsLeft]);

  useEffect(() => {
    if (!problem || !workspaceRef.current) return;

    const top =
      workspaceRef.current.getBoundingClientRect().top + window.scrollY - 28;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }, [problem]);

  useEffect(() => {
    if (!result || !resultSectionRef.current) return;

    setActiveBottomTab("results");

    setTimeout(() => {
      resultSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 160);
  }, [result]);

  const loadProblem = async () => {
    setResult(null);
    setLoading(true);
    autoSubmittedRef.current = false;
    setActiveBottomTab("output");

    try {
      const res = await startCodingInterview(difficulty, language);
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

  const handleLanguageChange = async (nextLanguage) => {
    setLanguage(nextLanguage);

    if (!problem) return;

    setLoading(true);
    setResult(null);
    setActiveBottomTab("output");

    try {
      const res = await startCodingInterview(difficulty, nextLanguage);
      const q = res.data.question;
      setProblem(q);
      setCode(q.starter_code || "");
      setSecondsLeft(DIFFICULTY_TIME[difficulty] || DIFFICULTY_TIME.easy);
      setIsPaused(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to switch language");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (auto = false) => {
    if (!problem) return;

    setLoading(true);
    setActiveBottomTab("results");

    try {
      const res = await submitCode(problem.id, code, language);
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
    setActiveBottomTab("output");
    autoSubmittedRef.current = false;
    editorRef.current?.focus?.();
  };

  const changeProblem = () => {
    setProblem(null);
    setCode("");
    setResult(null);
    setIsPaused(false);
    setSecondsLeft(DIFFICULTY_TIME.easy);
    setActiveBottomTab("output");
    autoSubmittedRef.current = false;
  };

  const currentLanguage = problem?.language || language;

  return (
    <div ref={workspaceRef} className="space-y-5">
      {!problem ? (
        <Surface className="p-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              Coding workspace
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Start your coding round
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
              Pick a difficulty and language, then begin solving a timed coding
              question in an interview-style editor.
            </p>
          </div>

          <div className="mt-8 grid max-w-2xl gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"
              >
                <option value="easy">Easy — 15 min</option>
                <option value="medium">Medium — 25 min</option>
                <option value="hard">Hard — 40 min</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <PrimaryButton
              onClick={loadProblem}
              disabled={loading}
              className="px-6 py-3"
            >
              {loading ? "Loading..." : "Start Coding Question"}
            </PrimaryButton>
          </div>
        </Surface>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[460px_minmax(0,1fr)]">
          <Surface className="overflow-hidden">
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold text-white">
                      {problem.title}
                    </h3>
                    <DifficultyBadge level={problem.difficulty || difficulty} />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/50">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {currentLanguage.toUpperCase()}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Timed Interview
                    </span>
                    {(problem.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-[720px] overflow-y-auto px-4 py-4 sm:px-5">
              <div className="space-y-6">
                <section>
                  <h4 className="text-lg font-semibold text-white">
                    Problem Description
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-white/78">
                    {problem.statement || "No problem statement available."}
                  </p>
                </section>

                <section>
                  <h4 className="text-lg font-semibold text-white">Examples</h4>
                  <div className="mt-3 space-y-4">
                    {(problem.examples || []).length > 0 ? (
                      problem.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-white/10 bg-black/25 p-4"
                        >
                          <p className="text-sm font-medium text-white">
                            Example {idx + 1}
                          </p>

                          <div className="mt-3 space-y-2 text-sm text-white/75">
                            <div>
                              <span className="font-medium text-white">
                                Input:
                              </span>{" "}
                              {ex.input}
                            </div>
                            <div>
                              <span className="font-medium text-white">
                                Output:
                              </span>{" "}
                              {ex.output}
                            </div>
                            {ex.explanation ? (
                              <div>
                                <span className="font-medium text-white">
                                  Explanation:
                                </span>{" "}
                                {ex.explanation}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/60">
                        No examples available.
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-semibold text-white">
                    Constraints
                  </h4>
                  <div className="mt-3 space-y-3">
                    {(problem.constraints || []).length > 0 ? (
                      problem.constraints.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/75"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/60">
                        Constraints are not available for this problem yet.
                      </div>
                    )}
                  </div>
                </section>

                {(problem.sample_test_cases || []).length > 0 ? (
                  <section>
                    <h4 className="text-lg font-semibold text-white">
                      Sample Test Cases
                    </h4>
                    <div className="mt-3 space-y-3">
                      {problem.sample_test_cases.map((tc, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-white/10 bg-black/25 p-4"
                        >
                          <p className="text-sm font-medium text-white">
                            Sample Case {idx + 1}
                          </p>
                          <div className="mt-3 space-y-2 text-sm text-white/75">
                            <div>
                              <span className="font-medium text-white">
                                Input:
                              </span>{" "}
                              {JSON.stringify(tc.input)}
                            </div>
                            <div>
                              <span className="font-medium text-white">
                                Expected:
                              </span>{" "}
                              {JSON.stringify(tc.expected)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </Surface>

          <Surface className="overflow-hidden">
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <StatPill
                    label="Time Remaining"
                    value={timeLabel}
                    warn={secondsLeft <= 60 && !isPaused}
                  />
                  <StatPill
                    label="Status"
                    value={result ? "Submitted" : isPaused ? "Paused" : "Active"}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={currentLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                    disabled={loading}
                  >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>

                  {!result ? (
                    <button
                      type="button"
                      onClick={() => setIsPaused((prev) => !prev)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm transition hover:bg-white/10"
                      title={isPaused ? "Resume timer" : "Pause timer"}
                    >
                      {isPaused ? "▶" : "⏸"}
                    </button>
                  ) : null}

                  <GhostButton
                    type="button"
                    onClick={resetCode}
                    className="px-4 py-2"
                  >
                    Reset
                  </GhostButton>

                  <GhostButton
                    type="button"
                    onClick={changeProblem}
                    className="px-4 py-2"
                  >
                    Change Problem
                  </GhostButton>

                  <PrimaryButton
                    onClick={() => handleSubmitCode(false)}
                    disabled={loading || !!result}
                    className="px-6 py-2.5"
                  >
                    {loading ? "Submitting..." : "Submit Solution"}
                  </PrimaryButton>
                </div>
              </div>
            </div>

            <div className="h-[430px] border-b border-white/10">
              <Editor
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                height="100%"
                language={currentLanguage === "cpp" ? "cpp" : currentLanguage}
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

            <div className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap gap-2">
                <PanelTab
                  active={activeBottomTab === "output"}
                  onClick={() => setActiveBottomTab("output")}
                >
                  Output
                </PanelTab>
                <PanelTab
                  active={activeBottomTab === "results"}
                  onClick={() => setActiveBottomTab("results")}
                >
                  Results
                </PanelTab>
                <PanelTab
                  active={activeBottomTab === "feedback"}
                  onClick={() => setActiveBottomTab("feedback")}
                >
                  Feedback
                </PanelTab>
              </div>

              <div
                ref={resultSectionRef}
                className="mt-4 min-h-[180px] rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                {activeBottomTab === "output" && (
                  <div className="text-sm text-white/65">
                    {!result ? (
                      <>
                        Submit your solution to evaluate it against hidden test
                        cases.
                      </>
                    ) : result.error ? (
                      <div className="text-white/75">{result.error}</div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-white/80">
                          Score:{" "}
                          <span className="font-semibold">
                            {result.score} / 10
                          </span>
                        </p>
                        <p>
                          Passed {result.passed_count} / {result.total_count} hidden
                          test cases.
                        </p>
                        {result.autoSubmitted ? (
                          <p className="text-white/60">
                            Auto-submitted because the timer finished.
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}

                {activeBottomTab === "results" && (
                  <div className="space-y-3">
                    {result?.results?.length ? (
                      result.results.map((r) => (
                        <div
                          key={r.case_no}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="font-medium text-white">
                            Case {r.case_no} — {r.passed ? "Passed" : "Failed"}
                          </div>

                          <div className="mt-2 space-y-1 text-sm text-white/70">
                            <div>Input: {JSON.stringify(r.input)}</div>
                            <div>Expected: {JSON.stringify(r.expected)}</div>
                            <div>Actual: {JSON.stringify(r.actual)}</div>
                            {r.error ? <div>Error: {r.error}</div> : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">
                        No submission results yet.
                      </p>
                    )}
                  </div>
                )}

                {activeBottomTab === "feedback" && (
                  <div className="space-y-3">
                    {feedback.length > 0 ? (
                      feedback.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75"
                        >
                          • {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">
                        Feedback will appear after submission.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Surface>
        </div>
      )}
    </div>
  );
}