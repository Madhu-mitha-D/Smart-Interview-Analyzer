import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

function Badge({ children, tone = "neutral" }) {
  const cls =
    tone === "good"
      ? "bg-green-500/15 border-green-500/30 text-green-300"
      : tone === "bad"
      ? "bg-red-500/15 border-red-500/30 text-red-300"
      : "bg-white/10 border-white/15 text-white/80";

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

export default function Insights() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const sessionId = sp.get("session_id") || "";

  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Raw JSON only when you toggle dev mode
  const [devMode, setDevMode] = useState(false);

  const overallTone = useMemo(() => {
    const v = (data?.overall_performance || "").toLowerCase();
    if (v.includes("excellent") || v.includes("good")) return "good";
    if (v.includes("needs")) return "bad";
    return "neutral";
  }, [data]);

  useEffect(() => {
    if (!sessionId) {
      setMsg("Missing session_id. Go from Dashboard → View Insights.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setMsg("");
      try {
        const res = await api.get(`/insights/${encodeURIComponent(sessionId)}`);
        setData(res.data);
      } catch (e) {
        setMsg(e?.response?.data?.detail || "Failed to load insights");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Insights</h1>
            <p className="mt-2 text-white/70">
              Session: <span className="text-white/90">{sessionId || "—"}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => nav(-1)}
              className="border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition"
            >
              Back
            </button>

            {sessionId ? (
              <Link
                to={`/analytics?session_id=${encodeURIComponent(sessionId)}`}
                className="bg-white text-black px-4 py-2 rounded-xl font-medium hover:scale-[1.02] transition"
              >
                Analytics
              </Link>
            ) : null}
          </div>
        </div>

        {/* Dev mode toggle */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-xs text-white/60">Developer mode</span>
          <button
            onClick={() => setDevMode((v) => !v)}
            className={`text-xs px-3 py-1 rounded-full border transition ${
              devMode
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white border-white/15 hover:bg-white/10"
            }`}
          >
            {devMode ? "ON" : "OFF"}
          </button>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Loading insights...
          </div>
        ) : !data ? null : (
          <div className="mt-6 grid gap-4">
            {/* Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Overall</h2>
                  <Badge tone={overallTone}>{data.overall_performance}</Badge>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span>
                    Domain: <span className="text-white/90">{data.domain}</span>
                  </span>
                  <span className="text-white/30">•</span>
                  <span>
                    Difficulty:{" "}
                    <span className="text-white/90">{data.difficulty}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/60 text-sm">Average Score</p>
                  <p className="text-2xl font-semibold mt-1">
                    {Number(data.average_score).toFixed(2)} / 10
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/60 text-sm">Average Similarity</p>
                  <p className="text-2xl font-semibold mt-1">
                    {Number(data.average_similarity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Coaching */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Coaching</h2>
              <div className="mt-3 grid gap-3">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/70 text-sm">Communication</p>
                  <p className="mt-1 text-white/90">
                    {data.communication_analysis || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/70 text-sm">Consistency</p>
                  <p className="mt-1 text-white/90">
                    {data.consistency_analysis || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/70 text-sm">Try this next</p>
                  <p className="mt-1 text-white/90">
                    {data.next_step_suggestion || "—"}
                  </p>
                  <p className="mt-2 text-xs text-white/55">
                    (STAR is just a simple way to answer: Situation → Task → Action → Result)
                  </p>
                </div>
              </div>
            </div>

            {/* Best + Weakest */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Best Answer</h2>
                  <Badge tone="good">Score: {data.best_answer?.score ?? 0}</Badge>
                </div>
                <p className="mt-2 text-white/70">
                  Q: {data.best_answer?.question || "—"}
                </p>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/90 whitespace-pre-wrap">
                    {data.best_answer?.feedback || "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Needs Work</h2>
                  <Badge tone="bad">
                    Score: {data.weakest_answer?.score ?? 0}
                  </Badge>
                </div>
                <p className="mt-2 text-white/70">
                  Q: {data.weakest_answer?.question || "—"}
                </p>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/90 whitespace-pre-wrap">
                    {data.weakest_answer?.feedback || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Raw JSON only in Dev mode */}
            {devMode ? (
              <details className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <summary className="cursor-pointer text-white/80">
                  Developer: raw JSON
                </summary>
                <pre className="mt-3 text-xs bg-black/40 p-4 rounded-xl overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  );
}