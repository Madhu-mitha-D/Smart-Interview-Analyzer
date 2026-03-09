import { useState } from "react";
import Editor from "@monaco-editor/react";
import api from "../api/axios";
import { PrimaryButton, GhostButton } from "./Buttons";

export default function CodingInterview() {
  const [difficulty, setDifficulty] = useState("easy");
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProblem = async () => {
    setResult(null);
    setLoading(true);

    try {
      const res = await api.post("/start-coding-interview", { difficulty });
      const q = res.data.question;

      setProblem(q);
      setCode(q.starter_code || "");
    } catch (err) {
      console.error(err);
      alert("Failed to load coding question");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    if (!problem) return;

    setLoading(true);

    try {
      const res = await api.post("/submit-code", {
        code,
        function_name: problem.function_name,
        test_cases: problem.test_cases,
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Code submission failed");
    } finally {
      setLoading(false);
    }
  };

  const resetCode = () => {
    if (!problem) return;
    setCode(problem.starter_code || "");
    setResult(null);
  };

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
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
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
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold">{problem.title}</h3>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
                {problem.difficulty}
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
                {problem.language}
              </span>
            </div>

            <p className="text-white/75">{problem.statement}</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <Editor
              height="420px"
              language="python"
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
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton
              onClick={submitCode}
              disabled={loading}
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
              }}
              className="px-6 py-3"
            >
              Change Problem
            </GhostButton>
          </div>
        </>
      )}

      {result && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <h4 className="text-lg font-semibold">
              Score: {result.score} / 10
            </h4>
            <p className="text-white/70">
              Passed {result.passed_count} / {result.total_count} test cases
            </p>
          </div>

          {result.error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {result.error}
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