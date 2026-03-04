import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-white/60 text-sm">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {sub ? <p className="text-white/50 text-xs mt-1">{sub}</p> : null}
    </div>
  );
}

function Bar({ label, value, max = 10 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-white/70 text-sm">{label}</p>
        <p className="text-white/80 text-sm">{value}</p>
      </div>
      <div className="mt-3 h-3 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-white/70" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-white/40 text-xs mt-2">0 → {max}</p>
    </div>
  );
}

function MiniBars({ title, rows }) {
  // rows: [{label, value, max}]
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {rows.map((r) => {
          const pct =
            r.max > 0 ? Math.max(0, Math.min(100, (r.value / r.max) * 100)) : 0;
          return (
            <div
              key={r.label}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">{r.label}</span>
                <span className="text-white/60">{r.value}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-white/70" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ✅ NEW: Per-question chart */
function ScoreProgress({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
        No per-question data yet.
      </div>
    );
  }

  // normalize fields (your backend returns: q_no, score, similarity, answer_len)
  const rows = data
    .map((x) => ({
      qNo: x.q_no ?? (x.q_index ?? 0) + 1,
      score: Number(x.score ?? 0),
      similarity: Number(x.similarity ?? 0),
      len: Number(x.answer_len ?? 0),
    }))
    .sort((a, b) => a.qNo - b.qNo);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Score Progress</h2>
        <p className="text-white/50 text-sm">Per question (0–10)</p>
      </div>

      <div className="mt-4 grid gap-3">
        {rows.map((r) => {
          const pct = Math.max(0, Math.min(100, (r.score / 10) * 100));
          return (
            <div key={r.qNo} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-white/80">Q{r.qNo}</span>
                <div className="flex items-center gap-3 text-white/60">
                  <span>Score: <span className="text-white/85">{r.score}</span></span>
                  <span>Sim: <span className="text-white/85">{r.similarity.toFixed(2)}</span></span>
                  <span>Len: <span className="text-white/85">{r.len}</span></span>
                </div>
              </div>

              <div className="mt-3 h-3 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-white/70 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Analytics() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const sessionId = sp.get("session_id") || "";

  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setMsg("Missing session_id. Go from Dashboard → Analytics.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setMsg("");
      try {
        const res = await api.get(`/analytics/${encodeURIComponent(sessionId)}`);
        setData(res.data);
      } catch (e) {
        setMsg(e?.response?.data?.detail || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const topFeedback = useMemo(() => {
    const map = data?.feedback_summary || {};
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [data]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="mt-2 text-white/70">
              Session: <span className="text-white/90">{sessionId || "—"}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => nav(-1)}
              className="border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition"
            >
              Back
            </button>

            {sessionId ? (
              <Link
                to={`/insights?session_id=${encodeURIComponent(sessionId)}`}
                className="bg-white text-black px-4 py-2 rounded-xl font-medium hover:scale-[1.02] transition"
              >
                Insights
              </Link>
            ) : null}

            <button
              onClick={() => setShowRaw((v) => !v)}
              className="border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition"
            >
              {showRaw ? "Hide JSON" : "Show JSON"}
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Loading analytics...
          </div>
        ) : !data ? null : (
          <div className="mt-6 grid gap-4">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Progress"
                value={`${data.progress?.answered ?? 0} / ${data.progress?.total_questions ?? 0}`}
                sub={data.progress?.finished ? "Finished" : "In progress"}
              />
              <StatCard label="Total Score" value={data.scores?.total_score ?? 0} sub="Sum of scores" />
              <StatCard
                label="Average Score"
                value={`${Number(data.scores?.average_score ?? 0).toFixed(2)} / 10`}
                sub="Across total questions"
              />
              <StatCard
                label="Avg Similarity"
                value={Number(data.similarity?.avg_similarity ?? 0).toFixed(2)}
                sub={`Min ${Number(data.similarity?.min_similarity ?? 0).toFixed(2)} • Max ${Number(
                  data.similarity?.max_similarity ?? 0
                ).toFixed(2)}`}
              />
            </div>

            {/* ✅ NEW: Per-question chart */}
            <ScoreProgress data={data.score_per_question || []} />

            {/* Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Bar label="Average Score" value={Number(data.scores?.average_score ?? 0)} max={10} />
              <Bar label="Average Similarity" value={Number(data.similarity?.avg_similarity ?? 0)} max={1} />
            </div>

            {/* Length + Similarity spread */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MiniBars
                title="Answer Length (chars)"
                rows={[
                  {
                    label: "Average",
                    value: Math.round(Number(data.answer_length?.avg_chars ?? 0)),
                    max: Math.max(200, Number(data.answer_length?.max_chars ?? 0) || 200),
                  },
                  {
                    label: "Min",
                    value: Number(data.answer_length?.min_chars ?? 0),
                    max: Math.max(200, Number(data.answer_length?.max_chars ?? 0) || 200),
                  },
                  {
                    label: "Max",
                    value: Number(data.answer_length?.max_chars ?? 0),
                    max: Math.max(200, Number(data.answer_length?.max_chars ?? 0) || 200),
                  },
                ]}
              />

              <MiniBars
                title="Similarity Spread"
                rows={[
                  { label: "Min", value: Number(data.similarity?.min_similarity ?? 0), max: 1 },
                  { label: "Avg", value: Number(data.similarity?.avg_similarity ?? 0), max: 1 },
                  { label: "Max", value: Number(data.similarity?.max_similarity ?? 0), max: 1 },
                ]}
              />
            </div>

            {/* Best/Worst */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Best Answer</h2>
                <p className="mt-2 text-white/70 text-sm">
                  Q{(data.best_answer?.question_index ?? 0) + 1}:{" "}
                  <span className="text-white/90">{data.best_answer?.question || "—"}</span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-white/60 text-sm">Score</p>
                    <p className="text-xl font-semibold mt-1">{data.best_answer?.score ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-white/60 text-sm">Similarity</p>
                    <p className="text-xl font-semibold mt-1">
                      {Number(data.best_answer?.similarity ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/80 whitespace-pre-wrap">{data.best_answer?.feedback || "—"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Weakest Answer</h2>
                <p className="mt-2 text-white/70 text-sm">
                  Q{(data.worst_answer?.question_index ?? 0) + 1}:{" "}
                  <span className="text-white/90">{data.worst_answer?.question || "—"}</span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-white/60 text-sm">Score</p>
                    <p className="text-xl font-semibold mt-1">{data.worst_answer?.score ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-white/60 text-sm">Similarity</p>
                    <p className="text-xl font-semibold mt-1">
                      {Number(data.worst_answer?.similarity ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-white/80 whitespace-pre-wrap">{data.worst_answer?.feedback || "—"}</p>
                </div>
              </div>
            </div>

            {/* Feedback summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Feedback Summary</h2>
              <p className="text-white/60 text-sm mt-1">Most repeated feedback messages</p>

              <div className="mt-4 grid gap-3">
                {topFeedback.length === 0 ? (
                  <p className="text-white/60">No feedback yet.</p>
                ) : (
                  topFeedback.map(([text, count]) => (
                    <div
                      key={text}
                      className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-start justify-between gap-4"
                    >
                      <p className="text-white/80 whitespace-pre-wrap">
                        {text === "NO_FEEDBACK" ? "No feedback stored." : text}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full border border-white/15 bg-white/10 text-white/80">
                        {count}×
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Raw JSON toggle */}
            {showRaw ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Raw JSON</h2>
                <pre className="mt-4 text-xs bg-black/40 p-4 rounded-xl overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  );
}