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

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-white/60 text-sm">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {sub ? <p className="text-white/50 text-xs mt-1">{sub}</p> : null}
    </div>
  );
}

export default function Insights() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const sessionId = sp.get("session_id") || "";

  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [devMode, setDevMode] = useState(false);

  const isOverall = !sessionId || !!data?.overall;

  const overallTone = useMemo(() => {
    const v = (data?.overall_performance || "").toLowerCase();
    if (v.includes("excellent") || v.includes("good")) return "good";
    if (v.includes("needs")) return "bad";
    return "neutral";
  }, [data]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");

      try {
        const url = sessionId
          ? `/insights/${encodeURIComponent(sessionId)}`
          : "/insights";

        const res = await api.get(url);
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
            <h1 className="text-3xl font-semibold">
              {isOverall ? "Overall Insights" : "Insights"}
            </h1>
            <p className="mt-2 text-white/70">
              {isOverall ? (
                <>User-level performance across all interview sessions</>
              ) : (
                <>
                  Session:{" "}
                  <span className="text-white/90">{sessionId || "—"}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => nav(-1)}
              className="border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition"
            >
              Back
            </button>

            <Link
              to={
                sessionId
                  ? `/analytics?session_id=${encodeURIComponent(sessionId)}`
                  : "/analytics"
              }
              className="bg-white text-black px-4 py-2 rounded-xl font-medium hover:scale-[1.02] transition"
            >
              Analytics
            </Link>
          </div>
        </div>

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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Overall</h2>
                  <Badge tone={overallTone}>
                    {data.overall_performance || "Overview"}
                  </Badge>
                </div>

                {!isOverall ? (
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
                ) : (
                  <div className="flex items-center gap-3 text-sm text-white/70 flex-wrap">
                    <span>
                      Sessions:{" "}
                      <span className="text-white/90">
                        {data.total_sessions ?? 0}
                      </span>
                    </span>
                    <span className="text-white/30">•</span>
                    <span>
                      Completed:{" "}
                      <span className="text-white/90">
                        {data.completed_sessions ?? 0}
                      </span>
                    </span>
                    <span className="text-white/30">•</span>
                    <span>
                      Best Domain:{" "}
                      <span className="text-white/90">
                        {data.best_domain || "—"}
                      </span>
                    </span>
                    <span className="text-white/30">•</span>
                    <span>
                      Weakest Domain:{" "}
                      <span className="text-white/90">
                        {data.weakest_domain || "—"}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatCard
                  label={isOverall ? "Average Answer Score" : "Average Score"}
                  value={`${Number(
                    isOverall
                      ? data.average_answer_score ?? 0
                      : data.average_score ?? 0
                  ).toFixed(2)} / 10`}
                />
                <StatCard
                  label="Average Similarity"
                  value={Number(data.average_similarity ?? 0).toFixed(2)}
                />

                {isOverall ? (
                  <div className="sm:col-span-2">
                    <StatCard
                      label="Average Total Score Per Session"
                      value={Number(data.average_total_score ?? 0).toFixed(2)}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Communication Metrics</h2>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  label="Avg Words / Min"
                  value={Number(
                    data.communication_metrics?.avg_words_per_minute ?? 0
                  ).toFixed(2)}
                  sub="Speaking pace"
                />
                <StatCard
                  label="Avg Comm Score"
                  value={`${Number(
                    data.communication_metrics?.avg_communication_score ?? 0
                  ).toFixed(2)} / 10`}
                  sub="Delivery quality"
                />
                <StatCard
                  label="Total Fillers"
                  value={data.communication_metrics?.total_filler_count ?? 0}
                  sub="um, uh, like..."
                />
                <StatCard
                  label="Total Pauses"
                  value={data.communication_metrics?.total_pause_count ?? 0}
                  sub="Estimated pauses"
                />
              </div>
            </div>

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
                    (STAR = Situation → Task → Action → Result)
                  </p>
                </div>
              </div>
            </div>

            {isOverall ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Domain Distribution</h2>
                {data.domains && Object.keys(data.domains).length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(data.domains).map(([domain, count]) => (
                      <div
                        key={domain}
                        className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-between"
                      >
                        <span className="uppercase tracking-wide text-white/90">
                          {domain}
                        </span>
                        <Badge>{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-white/70">No domain data available.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Best Answer</h2>
                    <Badge tone="good">
                      Score: {data.best_answer?.score ?? 0}
                    </Badge>
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
            )}

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