import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function Interview() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const resumeSessionId = sp.get("session_id") || "";

  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);

  const [finalReport, setFinalReport] = useState(null);

  // Choose domain/difficulty
  const [domain, setDomain] = useState("hr");
  const [difficulty, setDifficulty] = useState("easy");

  const forceLogout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  // ✅ Resume if session_id present
  useEffect(() => {
    if (!resumeSessionId) return;

    (async () => {
      setLoadingResume(true);
      setMsg("");
      setFinalReport(null);

      try {
        const res = await api.get(`/interviews/${encodeURIComponent(resumeSessionId)}`);
        const data = res.data;

        if (data.finished) {
          // This is "resume state" finished (no detailed report)
          setFinalReport({
            finished: true,
            message: "Interview already completed",
            total_score: data.total_score,
            verdict: data.verdict,
            // average_score may not exist in resume response
            average_score: null,
          });
          setSession({
            session_id: data.session_id,
            domain: data.domain,
            difficulty: data.difficulty,
            question_index: data.current_question ?? data.current_question_index ?? 0,
            question: "",
          });
        } else {
          setSession({
            session_id: data.session_id,
            domain: data.domain,
            difficulty: data.difficulty,
            question_index: data.question_index,
            question: data.question,
          });
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) return forceLogout();
        setMsg(err?.response?.data?.detail || "Failed to resume interview");
        // If resume fails, remove query so user can start fresh
        setSp({});
      } finally {
        setLoadingResume(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeSessionId]);

  const start = async () => {
    setMsg("");
    setFinalReport(null);
    setSession(null);
    setLoadingStart(true);

    try {
      const res = await api.post("/start-interview", { domain, difficulty });
      setSession(res.data);
      // ✅ clear any old resume query
      setSp({});
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Failed to start interview");
    } finally {
      setLoadingStart(false);
    }
  };

  const submit = async () => {
    if (!session) return;

    const trimmed = (answer || "").trim();
    if (!trimmed) {
      setMsg("⚠️ Type an answer before submitting.");
      return;
    }

    setMsg("");
    setLoadingSubmit(true);

    try {
      const res = await api.post("/submit-answer", {
        session_id: session.session_id,
        answer: trimmed,
      });

      setAnswer("");

      if (res.data.finished) {
        setFinalReport(res.data);
        setMsg("🎉 Interview Finished!");
      } else {
        setSession((prev) => ({
          ...prev,
          question_index: res.data.next_question_index,
          question: res.data.next_question,
        }));

        setMsg(
          `Score: ${res.data.score} | Similarity: ${Number(res.data.similarity).toFixed(2)}`
        );
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Submit failed");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const sid = session?.session_id || resumeSessionId;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-2xl w-full"
      >
        {loadingResume ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Resuming interview...
          </div>
        ) : !session ? (
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Start Interview</h2>

            <div className="grid gap-3">
              <label className="text-sm text-white/70">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl p-3"
              >
                <option value="hr">HR</option>
                <option value="java">Java</option>
                <option value="dbms">DBMS</option>
                <option value="ai">AI</option>
              </select>

              <label className="text-sm text-white/70 mt-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl p-3"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <button
                onClick={start}
                disabled={loadingStart}
                className="mt-4 bg-white text-black px-6 py-3 rounded-xl hover:scale-[1.02] transition disabled:opacity-60 disabled:hover:scale-100"
              >
                {loadingStart ? "Starting..." : "Start"}
              </button>
            </div>

            {msg && <p className="text-red-400 font-medium">{msg}</p>}
          </div>
        ) : finalReport ? (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">✅ Completed</h2>

            <p className="text-white/70">
              Total Score:{" "}
              <span className="text-white font-semibold">{finalReport.total_score ?? "—"}</span>
              {finalReport.average_score !== null && finalReport.average_score !== undefined ? (
                <>
                  {" "}
                  | Avg:{" "}
                  <span className="text-white font-semibold">{finalReport.average_score}</span>
                </>
              ) : null}
            </p>

            <p className="text-white/70">
              Verdict:{" "}
              <span className="text-white font-semibold">{finalReport.verdict ?? "—"}</span>
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {sid ? (
                <>
                  <Link
                    to={`/insights?session_id=${encodeURIComponent(sid)}`}
                    className="bg-white text-black px-5 py-2 rounded-lg hover:scale-105 transition"
                  >
                    View Insights
                  </Link>

                  <Link
                    to={`/analytics?session_id=${encodeURIComponent(sid)}`}
                    className="border border-white/20 px-5 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    View Analytics
                  </Link>
                </>
              ) : null}

              <button
                onClick={start}
                className="border border-white/20 px-5 py-2 rounded-lg hover:bg-white/10 transition"
              >
                Start New Interview
              </button>
            </div>

            {/* Keep raw report only for debugging */}
            {finalReport?.detailed_report ? (
              <details className="pt-2">
                <summary className="cursor-pointer text-white/80">See raw report</summary>
                <pre className="mt-2 text-xs bg-black/40 p-3 rounded-xl overflow-auto">
                  {JSON.stringify(finalReport, null, 2)}
                </pre>
              </details>
            ) : null}

            {msg && <p className="text-green-400 font-medium">{msg}</p>}
          </div>
        ) : (
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-white/70 text-sm">
              Session: <span className="text-white">{session.session_id}</span>
            </div>

            <h2 className="text-2xl font-semibold">Q{(session.question_index ?? 0) + 1}</h2>
            <p className="text-white/70">{session.question}</p>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Type your answer here..."
            />

            <div className="flex gap-3">
              <button
                onClick={submit}
                disabled={loadingSubmit}
                className="bg-white text-black px-6 py-2 rounded-lg hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
              >
                {loadingSubmit ? "Submitting..." : "Submit"}
              </button>

              <button
                onClick={() => nav("/")}
                className="border border-white/20 px-6 py-2 rounded-lg hover:bg-white/10 transition"
              >
                Back
              </button>
            </div>

            {msg && <p className="text-green-400 font-medium">{msg}</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
}