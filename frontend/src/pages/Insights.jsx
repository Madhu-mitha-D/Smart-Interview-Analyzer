import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

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

function Badge({ children, tone = "neutral" }) {
  const cls =
    tone === "good"
      ? "bg-white/[0.12] border-white/[0.18] text-white"
      : tone === "bad"
      ? "bg-white/[0.06] border-white/[0.14] text-white/75"
      : "bg-white/10 border-white/15 text-white/80";

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-white/60 text-sm">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-white/50">{sub}</p> : null}
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
    <div className="min-h-screen px-6 py-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-5xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isOverall ? "Overall Insights" : "Insights"}
            </h1>
            <p className="mt-2 text-white/70">
              {isOverall ? (
                <>User-level performance across all interview sessions</>
              ) : (
                <>
                  Session: <span className="text-white/90">{sessionId || "—"}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => nav(-1)}
              className="rounded-xl border border-white/20 px-4 py-2 transition hover:bg-white/10"
            >
              Back
            </button>

            <Link
              to={
                sessionId
                  ? `/analytics?session_id=${encodeURIComponent(sessionId)}`
                  : "/analytics"
              }
              className="rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:scale-[1.02]"
            >
              Analytics
            </Link>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-xs text-white/60">Developer mode</span>
          <button
            onClick={() => setDevMode((v) => !v)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              devMode
                ? "border-white bg-white text-black"
                : "border-white/15 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {devMode ? "ON" : "OFF"}
          </button>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white/75">
            {msg}
          </div>
        )}

        {loading ? (
          <Surface className="mt-6 p-6 text-white/70">
            Loading insights...
          </Surface>
        ) : !data ? null : (
          <div className="mt-6 grid gap-4">
            <Surface className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">Overall</h2>
                  <Badge tone={overallTone}>
                    {data.overall_performance || "Overview"}
                  </Badge>
                </div>

                {!isOverall ? (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
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
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
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

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            </Surface>

            <Surface className="p-6">
              <h2 className="text-xl font-semibold text-white">
                Communication Metrics
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            </Surface>

            <Surface className="p-6">
              <h2 className="text-xl font-semibold text-white">Coaching</h2>

              <div className="mt-3 grid gap-3">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/70">Communication</p>
                  <p className="mt-1 text-white/90">
                    {data.communication_analysis || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/70">Consistency</p>
                  <p className="mt-1 text-white/90">
                    {data.consistency_analysis || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/70">Try this next</p>
                  <p className="mt-1 text-white/90">
                    {data.next_step_suggestion || "—"}
                  </p>
                  <p className="mt-2 text-xs text-white/55">
                    (STAR = Situation → Task → Action → Result)
                  </p>
                </div>
              </div>
            </Surface>

            {isOverall ? (
              <Surface className="p-6">
                <h2 className="text-xl font-semibold text-white">
                  Domain Distribution
                </h2>

                {data.domains && Object.keys(data.domains).length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(data.domains).map(([domain, count]) => (
                      <div
                        key={domain}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4"
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
              </Surface>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Surface className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      Best Answer
                    </h2>
                    <Badge tone="good">
                      Score: {data.best_answer?.score ?? 0}
                    </Badge>
                  </div>
                  <p className="mt-2 text-white/70">
                    Q: {data.best_answer?.question || "—"}
                  </p>
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="whitespace-pre-wrap text-white/90">
                      {data.best_answer?.feedback || "—"}
                    </p>
                  </div>
                </Surface>

                <Surface className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      Needs Work
                    </h2>
                    <Badge tone="bad">
                      Score: {data.weakest_answer?.score ?? 0}
                    </Badge>
                  </div>
                  <p className="mt-2 text-white/70">
                    Q: {data.weakest_answer?.question || "—"}
                  </p>
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="whitespace-pre-wrap text-white/90">
                      {data.weakest_answer?.feedback || "—"}
                    </p>
                  </div>
                </Surface>
              </div>
            )}

            {devMode ? (
              <Surface className="p-6">
                <details>
                  <summary className="cursor-pointer text-white/80">
                    Developer: raw JSON
                  </summary>
                  <pre className="mt-3 overflow-auto rounded-xl bg-black/40 p-4 text-xs">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              </Surface>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  );
}