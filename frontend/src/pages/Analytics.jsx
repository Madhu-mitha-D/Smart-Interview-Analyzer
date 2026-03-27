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

function StatCard({ label, value, sub }) {
  return (
    <Surface className="p-5">
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-white/50">{sub}</p> : null}
    </Surface>
  );
}

function Bar({ label, value, max = 10 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <Surface className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">{label}</p>
        <p className="text-sm text-white/80">{value}</p>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white/70"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-white/40">0 → {max}</p>
    </Surface>
  );
}

function MiniBars({ title, rows }) {
  return (
    <Surface className="p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>

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

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-white/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}

function ScoreProgress({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Surface className="p-6 text-white/70">No per-question data yet.</Surface>
    );
  }

  const rows = data
    .map((x) => ({
      qNo: x.q_no ?? (x.q_index ?? 0) + 1,
      score: Number(x.score ?? 0),
      similarity: Number(x.similarity ?? 0),
      len: Number(x.answer_len ?? 0),
      wpm: Number(x.words_per_minute ?? 0),
      commScore: Number(x.communication_score ?? 0),
      fillers: Number(x.filler_count ?? 0),
      pauses: Number(x.pause_count ?? 0),
      pace: x.pace_label ?? "—",
    }))
    .sort((a, b) => a.qNo - b.qNo);

  return (
    <Surface className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Score Progress</h2>
        <p className="text-sm text-white/50">Per question (0–10)</p>
      </div>

      <div className="mt-4 grid gap-3">
        {rows.map((r) => {
          const pct = Math.max(0, Math.min(100, (r.score / 10) * 100));

          return (
            <div
              key={r.qNo}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-white/80">Q{r.qNo}</span>
                <div className="flex flex-wrap items-center gap-3 text-white/60">
                  <span>
                    Score: <span className="text-white/85">{r.score}</span>
                  </span>
                  <span>
                    Sim:{" "}
                    <span className="text-white/85">
                      {r.similarity.toFixed(2)}
                    </span>
                  </span>
                  <span>
                    Len: <span className="text-white/85">{r.len}</span>
                  </span>
                  <span>
                    WPM:{" "}
                    <span className="text-white/85">{r.wpm.toFixed(1)}</span>
                  </span>
                  <span>
                    Pace: <span className="text-white/85">{r.pace}</span>
                  </span>
                </div>
              </div>

              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/70"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">
                <span>Comm Score: {r.commScore.toFixed(2)}</span>
                <span>Fillers: {r.fillers}</span>
                <span>Pauses: {r.pauses}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}

export default function Analytics() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const sessionId = sp.get("session_id") || "";

  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const isOverall = !sessionId || !!data?.overall;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");

      try {
        const url = sessionId
          ? `/analytics/${encodeURIComponent(sessionId)}`
          : "/analytics";

        const res = await api.get(url);
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
    <div className="min-h-screen px-6 py-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-6xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {isOverall ? "Overall Analytics" : "Analytics"}
            </h1>
            <p className="mt-2 text-white/70">
              {isOverall ? (
                <>User-level analytics across all sessions</>
              ) : (
                <>
                  Session:{" "}
                  <span className="text-white/90">{sessionId || "—"}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => nav(-1)}
              className="rounded-xl border border-white/20 px-4 py-2 transition hover:bg-white/10"
            >
              Back
            </button>

            <Link
              to={
                sessionId
                  ? `/insights?session_id=${encodeURIComponent(sessionId)}`
                  : "/insights"
              }
              className="rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:scale-[1.02]"
            >
              Insights
            </Link>
          </div>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white/75">
            {msg}
          </div>
        )}

        {loading ? (
          <Surface className="mt-6 p-6 text-white/70">
            Loading analytics...
          </Surface>
        ) : !data ? null : isOverall ? (
          <div className="mt-6 grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Sessions"
                value={data.total_sessions ?? 0}
                sub="All interview sessions"
              />
              <StatCard
                label="Completed"
                value={data.completed_sessions ?? 0}
                sub="Finished sessions"
              />
              <StatCard
                label="Incomplete"
                value={data.incomplete_sessions ?? 0}
                sub="Pending sessions"
              />
              <StatCard
                label="Avg Total Score"
                value={Number(data.average_total_score ?? 0).toFixed(2)}
                sub="Per session"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Bar
                label="Completion Rate"
                value={Number(data.completed_sessions ?? 0)}
                max={Math.max(1, Number(data.total_sessions ?? 0))}
              />
              <Bar
                label="Average Total Score"
                value={Number(data.average_total_score ?? 0)}
                max={30}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <MiniBars
                title="Domain Distribution"
                rows={Object.entries(data.domains || {}).map(([label, value]) => ({
                  label,
                  value: Number(value || 0),
                  max: Math.max(
                    1,
                    ...Object.values(data.domains || {}).map((v) =>
                      Number(v || 0)
                    )
                  ),
                }))}
              />

              <MiniBars
                title="Difficulty Distribution"
                rows={Object.entries(data.difficulty_distribution || {}).map(
                  ([label, value]) => ({
                    label,
                    value: Number(value || 0),
                    max: Math.max(
                      1,
                      ...Object.values(data.difficulty_distribution || {}).map(
                        (v) => Number(v || 0)
                      )
                    ),
                  })
                )}
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Progress"
                value={`${data.progress?.answered ?? 0} / ${
                  data.progress?.total_questions ?? 0
                }`}
                sub={data.progress?.finished ? "Finished" : "In progress"}
              />
              <StatCard
                label="Total Score"
                value={data.scores?.total_score ?? 0}
                sub="Sum of scores"
              />
              <StatCard
                label="Average Score"
                value={`${Number(data.scores?.average_score ?? 0).toFixed(
                  2
                )} / 10`}
                sub="Across total questions"
              />
              <StatCard
                label="Avg Similarity"
                value={Number(data.similarity?.avg_similarity ?? 0).toFixed(2)}
                sub={`Min ${Number(
                  data.similarity?.min_similarity ?? 0
                ).toFixed(2)} • Max ${Number(
                  data.similarity?.max_similarity ?? 0
                ).toFixed(2)}`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Avg Words / Min"
                value={Number(
                  data.communication?.avg_words_per_minute ?? 0
                ).toFixed(2)}
                sub="Speaking speed"
              />
              <StatCard
                label="Avg Comm Score"
                value={`${Number(
                  data.communication?.avg_communication_score ?? 0
                ).toFixed(2)} / 10`}
                sub="Voice communication"
              />
              <StatCard
                label="Total Fillers"
                value={data.communication?.total_filler_count ?? 0}
                sub="um, uh, like..."
              />
              <StatCard
                label="Total Pauses"
                value={data.communication?.total_pause_count ?? 0}
                sub="Estimated pauses"
              />
            </div>

            <ScoreProgress data={data.score_per_question || []} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Bar
                label="Average Score"
                value={Number(data.scores?.average_score ?? 0)}
                max={10}
              />
              <Bar
                label="Average Similarity"
                value={Number(data.similarity?.avg_similarity ?? 0)}
                max={1}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <MiniBars
                title="Answer Length (chars)"
                rows={[
                  {
                    label: "Average",
                    value: Math.round(Number(data.answer_length?.avg_chars ?? 0)),
                    max: Math.max(
                      200,
                      Number(data.answer_length?.max_chars ?? 0) || 200
                    ),
                  },
                  {
                    label: "Min",
                    value: Number(data.answer_length?.min_chars ?? 0),
                    max: Math.max(
                      200,
                      Number(data.answer_length?.max_chars ?? 0) || 200
                    ),
                  },
                  {
                    label: "Max",
                    value: Number(data.answer_length?.max_chars ?? 0),
                    max: Math.max(
                      200,
                      Number(data.answer_length?.max_chars ?? 0) || 200
                    ),
                  },
                ]}
              />

              <MiniBars
                title="Similarity Spread"
                rows={[
                  {
                    label: "Min",
                    value: Number(data.similarity?.min_similarity ?? 0),
                    max: 1,
                  },
                  {
                    label: "Avg",
                    value: Number(data.similarity?.avg_similarity ?? 0),
                    max: 1,
                  },
                  {
                    label: "Max",
                    value: Number(data.similarity?.max_similarity ?? 0),
                    max: 1,
                  },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Surface className="p-6">
                <h2 className="text-xl font-semibold text-white">Best Answer</h2>
                <p className="mt-2 text-sm text-white/70">
                  Q{(data.best_answer?.question_index ?? 0) + 1}:{" "}
                  <span className="text-white/90">
                    {data.best_answer?.question || "—"}
                  </span>
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white/60">Score</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {data.best_answer?.score ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white/60">Similarity</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {Number(data.best_answer?.similarity ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="whitespace-pre-wrap text-white/80">
                    {data.best_answer?.feedback || "—"}
                  </p>
                </div>
              </Surface>

              <Surface className="p-6">
                <h2 className="text-xl font-semibold text-white">
                  Weakest Answer
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Q{(data.worst_answer?.question_index ?? 0) + 1}:{" "}
                  <span className="text-white/90">
                    {data.worst_answer?.question || "—"}
                  </span>
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white/60">Score</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {data.worst_answer?.score ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white/60">Similarity</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {Number(data.worst_answer?.similarity ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="whitespace-pre-wrap text-white/80">
                    {data.worst_answer?.feedback || "—"}
                  </p>
                </div>
              </Surface>
            </div>

            <Surface className="p-6">
              <h2 className="text-xl font-semibold text-white">
                Feedback Summary
              </h2>
              <p className="mt-1 text-sm text-white/60">
                Most repeated feedback messages
              </p>

              <div className="mt-4 grid gap-3">
                {topFeedback.length === 0 ? (
                  <p className="text-white/60">No feedback yet.</p>
                ) : (
                  topFeedback.map(([text, count]) => (
                    <div
                      key={text}
                      className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/30 p-4"
                    >
                      <p className="whitespace-pre-wrap text-white/80">
                        {text === "NO_FEEDBACK"
                          ? "No feedback stored."
                          : text}
                      </p>
                      <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs text-white/80">
                        {count}×
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Surface>
          </div>
        )}
      </motion.div>
    </div>
  );
}