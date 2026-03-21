import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/68 backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
      {children}
    </div>
  );
}

function PremiumSurface({ children, className = "" }) {
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGlow({ x, y, active: true });
      }}
      onMouseLeave={() => setGlow((g) => ({ ...g, active: false }))}
      className={[
        "group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101013]/72 shadow-[0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: glow.active
            ? `radial-gradient(480px circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.08), transparent 38%)`
            : "none",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const cls =
    tone === "good"
      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
      : tone === "bad"
      ? "bg-red-500/15 border-red-500/30 text-red-300"
      : tone === "info"
      ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
      : "bg-white/10 border-white/15 text-white/80";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, accent = "violet" }) {
  const accentGlow =
    accent === "violet"
      ? "from-violet-400/25"
      : accent === "blue"
      ? "from-sky-400/25"
      : accent === "emerald"
      ? "from-emerald-400/25"
      : "from-white/18";

  return (
    <PremiumSurface className="p-5">
      <div
        className={`absolute -top-12 right-0 h-28 w-28 rounded-full bg-gradient-to-b ${accentGlow} to-transparent blur-3xl`}
      />
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs text-white/40">{sub}</p> : null}
    </PremiumSurface>
  );
}

function MetricBar({ label, value, max = 10, suffix = "" }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/72">{label}</p>
        <p className="text-sm font-medium text-white">
          {typeof value === "number" ? value.toFixed(2) : value}
          {suffix}
        </p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-300/80 via-fuchsia-300/80 to-sky-300/80"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-white/38">0 → {max}</p>
    </div>
  );
}

function MiniBars({ title, subtitle, rows }) {
  return (
    <PremiumSurface className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
            Breakdown
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/45">{subtitle}</p> : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {rows.map((r) => {
          const pct =
            r.max > 0 ? Math.max(0, Math.min(100, (r.value / r.max) * 100)) : 0;

          return (
            <div
              key={r.label}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">{r.label}</span>
                <span className="text-white/60">{r.value}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-300/80 to-sky-300/80"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PremiumSurface>
  );
}

function ScoreProgress({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <PremiumSurface className="p-6 text-white/70">
        No per-question data yet.
      </PremiumSurface>
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
    <PremiumSurface className="p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
            Question flow
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Score Progress</h2>
        </div>
        <Badge tone="info">Per question (0–10)</Badge>
      </div>

      <div className="mt-5 grid gap-3">
        {rows.map((r) => {
          const pct = Math.max(0, Math.min(100, (r.score / 10) * 100));

          return (
            <div
              key={r.qNo}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-white">Q{r.qNo}</span>
                <div className="flex flex-wrap items-center gap-3 text-white/58">
                  <span>
                    Score: <span className="text-white/90">{r.score}</span>
                  </span>
                  <span>
                    Sim: <span className="text-white/90">{r.similarity.toFixed(2)}</span>
                  </span>
                  <span>
                    Len: <span className="text-white/90">{r.len}</span>
                  </span>
                  <span>
                    WPM: <span className="text-white/90">{r.wpm.toFixed(1)}</span>
                  </span>
                  <span>
                    Pace: <span className="text-white/90">{r.pace}</span>
                  </span>
                </div>
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-300/80 via-fuchsia-300/80 to-sky-300/80"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/50">
                <span>Comm Score: {r.commScore.toFixed(2)}</span>
                <span>Fillers: {r.fillers}</span>
                <span>Pauses: {r.pauses}</span>
              </div>
            </div>
          );
        })}
      </div>
    </PremiumSurface>
  );
}

function AnswerPanel({ title, tone, answer }) {
  return (
    <PremiumSurface className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <Badge tone={tone}>Score: {answer?.score ?? 0}</Badge>
      </div>

      <p className="mt-3 text-sm leading-7 text-white/60">
        Q{(answer?.question_index ?? 0) + 1}:{" "}
        <span className="text-white/88">{answer?.question || "—"}</span>
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-white/45 text-sm">Score</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {answer?.score ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-white/45 text-sm">Similarity</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {Number(answer?.similarity ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-white/80">
          {answer?.feedback || "—"}
        </p>
      </div>
    </PremiumSurface>
  );
}

function FeedbackSummary({ items }) {
  return (
    <PremiumSurface className="p-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
          Summary
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Feedback Summary
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Most repeated feedback messages
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {items.length === 0 ? (
          <p className="text-white/60">No feedback yet.</p>
        ) : (
          items.map(([text, count]) => (
            <div
              key={text}
              className="rounded-xl border border-white/10 bg-black/20 p-4 flex items-start justify-between gap-4"
            >
              <p className="whitespace-pre-wrap text-white/80">
                {text === "NO_FEEDBACK" ? "No feedback stored." : text}
              </p>
              <Badge>{count}×</Badge>
            </div>
          ))
        )}
      </div>
    </PremiumSurface>
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
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-7xl space-y-6"
      >
        <PremiumSurface className="overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <SectionLabel>{isOverall ? "Overall analytics" : "Session analytics"}</SectionLabel>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {isOverall ? "Overall Analytics" : "Interview Analytics"}
              </h1>

              <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                {isOverall
                  ? "A user-level analytics view across all completed and incomplete sessions."
                  : `A session-level breakdown for ${sessionId || "this interview"}, covering scores, similarity, communication, and detailed answer performance.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => nav(-1)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.08]"
              >
                Back
              </button>

              <Link
                to={
                  sessionId
                    ? `/insights?session_id=${encodeURIComponent(sessionId)}`
                    : "/insights"
                }
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
              >
                Insights
              </Link>

              <button
                onClick={() => setShowRaw((v) => !v)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.08]"
              >
                {showRaw ? "Hide JSON" : "Show JSON"}
              </button>
            </div>
          </div>
        </PremiumSurface>

        {msg ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {msg}
          </div>
        ) : null}

        {loading ? (
          <PremiumSurface className="p-6 text-white/70">
            Loading analytics...
          </PremiumSurface>
        ) : !data ? null : isOverall ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Sessions"
                value={data.total_sessions ?? 0}
                sub="All interview sessions"
                accent="violet"
              />
              <StatCard
                label="Completed"
                value={data.completed_sessions ?? 0}
                sub="Finished sessions"
                accent="emerald"
              />
              <StatCard
                label="Incomplete"
                value={data.incomplete_sessions ?? 0}
                sub="Pending sessions"
                accent="blue"
              />
              <StatCard
                label="Avg Total Score"
                value={Number(data.average_total_score ?? 0).toFixed(2)}
                sub="Per session"
                accent="white"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <PremiumSurface className="p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
                    Performance
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Session-level overview
                  </h2>
                </div>

                <div className="mt-5 grid gap-4">
                  <MetricBar
                    label="Completion Rate"
                    value={Number(data.completed_sessions ?? 0)}
                    max={Math.max(1, Number(data.total_sessions ?? 0))}
                  />
                  <MetricBar
                    label="Average Total Score"
                    value={Number(data.average_total_score ?? 0)}
                    max={30}
                  />
                </div>
              </PremiumSurface>

              <MiniBars
                title="Domain Distribution"
                subtitle="How sessions are spread across interview domains"
                rows={Object.entries(data.domains || {}).map(([label, value]) => ({
                  label,
                  value: Number(value || 0),
                  max: Math.max(
                    1,
                    ...Object.values(data.domains || {}).map((v) => Number(v || 0))
                  ),
                }))}
              />
            </div>

            <MiniBars
              title="Difficulty Distribution"
              subtitle="Sessions grouped by selected difficulty"
              rows={Object.entries(data.difficulty_distribution || {}).map(
                ([label, value]) => ({
                  label,
                  value: Number(value || 0),
                  max: Math.max(
                    1,
                    ...Object.values(data.difficulty_distribution || {}).map((v) =>
                      Number(v || 0)
                    )
                  ),
                })
              )}
            />

            {showRaw ? (
              <PremiumSurface className="p-6">
                <h2 className="text-xl font-semibold text-white">Raw JSON</h2>
                <pre className="mt-4 overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-white/75">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </PremiumSurface>
            ) : null}
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Progress"
                value={`${data.progress?.answered ?? 0} / ${data.progress?.total_questions ?? 0}`}
                sub={data.progress?.finished ? "Finished" : "In progress"}
                accent="violet"
              />
              <StatCard
                label="Total Score"
                value={data.scores?.total_score ?? 0}
                sub="Sum of question scores"
                accent="emerald"
              />
              <StatCard
                label="Average Score"
                value={`${Number(data.scores?.average_score ?? 0).toFixed(2)} / 10`}
                sub="Across total questions"
                accent="blue"
              />
              <StatCard
                label="Avg Similarity"
                value={Number(data.similarity?.avg_similarity ?? 0).toFixed(2)}
                sub={`Min ${Number(data.similarity?.min_similarity ?? 0).toFixed(2)} • Max ${Number(
                  data.similarity?.max_similarity ?? 0
                ).toFixed(2)}`}
                accent="white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Avg Words / Min"
                value={Number(data.communication?.avg_words_per_minute ?? 0).toFixed(2)}
                sub="Speaking speed"
                accent="blue"
              />
              <StatCard
                label="Avg Comm Score"
                value={`${Number(data.communication?.avg_communication_score ?? 0).toFixed(2)} / 10`}
                sub="Voice communication"
                accent="violet"
              />
              <StatCard
                label="Total Fillers"
                value={data.communication?.total_filler_count ?? 0}
                sub="um, uh, like..."
                accent="white"
              />
              <StatCard
                label="Total Pauses"
                value={data.communication?.total_pause_count ?? 0}
                sub="Estimated pauses"
                accent="emerald"
              />
            </div>

            <ScoreProgress data={data.score_per_question || []} />

            <div className="grid gap-4 lg:grid-cols-2">
              <PremiumSurface className="p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
                    Main metrics
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Session summaries
                  </h2>
                </div>

                <div className="mt-5 grid gap-4">
                  <MetricBar
                    label="Average Score"
                    value={Number(data.scores?.average_score ?? 0)}
                    max={10}
                  />
                  <MetricBar
                    label="Average Similarity"
                    value={Number(data.similarity?.avg_similarity ?? 0)}
                    max={1}
                  />
                </div>
              </PremiumSurface>

              <MiniBars
                title="Answer Length"
                subtitle="Average, min, and max answer character counts"
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
            </div>

            <MiniBars
              title="Similarity Spread"
              subtitle="Range of answer similarity values"
              rows={[
                {
                  label: "Min",
                  value: Number(data.similarity?.min_similarity ?? 0),
                  max: 1,
                },
                {
                  label: "Average",
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

            <div className="grid gap-4 lg:grid-cols-2">
              <AnswerPanel
                title="Best Answer"
                tone="good"
                answer={data.best_answer}
              />
              <AnswerPanel
                title="Weakest Answer"
                tone="bad"
                answer={data.worst_answer}
              />
            </div>

            <FeedbackSummary items={topFeedback} />

            {showRaw ? (
              <PremiumSurface className="p-6">
                <h2 className="text-xl font-semibold text-white">Raw JSON</h2>
                <pre className="mt-4 overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-white/75">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </PremiumSurface>
            ) : null}
          </>
        )}
      </motion.div>
    </div>
  );
}