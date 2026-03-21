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
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_30%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const cls =
    tone === "good"
      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
      : tone === "bad"
      ? "bg-red-500/15 border-red-500/30 text-red-300"
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

function InfoBlock({ label, value, tone = "neutral" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>
      <div className="mt-3">
        <Badge tone={tone}>{value || "—"}</Badge>
      </div>
    </div>
  );
}

function CoachingCard({ title, body, footer }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-white/40">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-white/80">{body || "—"}</p>
      {footer ? <p className="mt-3 text-xs text-white/45">{footer}</p> : null}
    </div>
  );
}

function AnswerPanel({ title, tone, score, question, feedback }) {
  return (
    <PremiumSurface className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <Badge tone={tone}>Score: {score ?? 0}</Badge>
      </div>

      <p className="mt-3 text-sm leading-7 text-white/60">
        Q: <span className="text-white/88">{question || "—"}</span>
      </p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-white/80">
          {feedback || "—"}
        </p>
      </div>
    </PremiumSurface>
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

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <SectionLabel>{isOverall ? "Overall insights" : "Session insights"}</SectionLabel>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {isOverall ? "Overall performance insights" : "Interview session insights"}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                {isOverall
                  ? "A consolidated view of performance across all interview sessions, including answer quality, communication metrics, and domain-level patterns."
                  : "A focused review of this interview session, covering answer performance, communication signals, and coaching guidance."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => nav(-1)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.08]"
                >
                  Back
                </button>

                <Link
                  to={
                    sessionId
                      ? `/analytics?session_id=${encodeURIComponent(sessionId)}`
                      : "/analytics"
                  }
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
                >
                  Open Analytics
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBlock
                label="Performance"
                value={data?.overall_performance || "Overview"}
                tone={overallTone}
              />

              {!isOverall ? (
                <InfoBlock
                  label="Session ID"
                  value={sessionId || "—"}
                />
              ) : (
                <InfoBlock
                  label="Best Domain"
                  value={data?.best_domain || "—"}
                  tone="good"
                />
              )}

              {!isOverall ? (
                <InfoBlock label="Domain" value={data?.domain || "—"} />
              ) : (
                <InfoBlock
                  label="Weakest Domain"
                  value={data?.weakest_domain || "—"}
                  tone="bad"
                />
              )}

              {!isOverall ? (
                <InfoBlock label="Difficulty" value={data?.difficulty || "—"} />
              ) : (
                <InfoBlock
                  label="Completed Sessions"
                  value={String(data?.completed_sessions ?? 0)}
                />
              )}
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
            Loading insights...
          </PremiumSurface>
        ) : !data ? null : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={isOverall ? "Average Answer Score" : "Average Score"}
                value={`${Number(
                  isOverall
                    ? data.average_answer_score ?? 0
                    : data.average_score ?? 0
                ).toFixed(2)} / 10`}
                sub="Primary performance metric"
                accent="violet"
              />

              <StatCard
                label="Average Similarity"
                value={Number(data.average_similarity ?? 0).toFixed(2)}
                sub="Closeness to expected answer"
                accent="blue"
              />

              <StatCard
                label="Avg Words / Min"
                value={Number(
                  data.communication_metrics?.avg_words_per_minute ?? 0
                ).toFixed(2)}
                sub="Speaking pace"
                accent="emerald"
              />

              <StatCard
                label="Avg Comm Score"
                value={`${Number(
                  data.communication_metrics?.avg_communication_score ?? 0
                ).toFixed(2)} / 10`}
                sub="Delivery quality"
                accent="white"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <PremiumSurface className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                      Communication metrics
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      Delivery and speaking signals
                    </h2>
                  </div>

                  <Badge>{isOverall ? "Across sessions" : "This session"}</Badge>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard
                    label="Total Fillers"
                    value={data.communication_metrics?.total_filler_count ?? 0}
                    sub="um, uh, like..."
                    accent="blue"
                  />
                  <StatCard
                    label="Total Pauses"
                    value={data.communication_metrics?.total_pause_count ?? 0}
                    sub="Estimated pauses"
                    accent="violet"
                  />

                  {isOverall ? (
                    <div className="sm:col-span-2">
                      <StatCard
                        label="Average Total Score Per Session"
                        value={Number(data.average_total_score ?? 0).toFixed(2)}
                        sub="Overall session-level score"
                        accent="emerald"
                      />
                    </div>
                  ) : null}
                </div>
              </PremiumSurface>

              <PremiumSurface className="p-6 sm:p-8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                  Coaching
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  What to improve next
                </h2>

                <div className="mt-6 grid gap-3">
                  <CoachingCard
                    title="Communication"
                    body={data.communication_analysis}
                  />

                  <CoachingCard
                    title="Consistency"
                    body={data.consistency_analysis}
                  />

                  <CoachingCard
                    title="Try this next"
                    body={data.next_step_suggestion}
                    footer="STAR = Situation → Task → Action → Result"
                  />
                </div>
              </PremiumSurface>
            </div>

            {isOverall ? (
              <PremiumSurface className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                      Domain distribution
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      Practice spread across domains
                    </h2>
                  </div>

                  <Badge>{data.total_sessions ?? 0} sessions</Badge>
                </div>

                {data.domains && Object.keys(data.domains).length > 0 ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(data.domains).map(([domain, count]) => (
                      <div
                        key={domain}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                          Domain
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold uppercase text-white">
                            {domain}
                          </span>
                          <Badge>{count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-white/60">No domain data available.</p>
                )}
              </PremiumSurface>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <AnswerPanel
                  title="Best Answer"
                  tone="good"
                  score={data.best_answer?.score}
                  question={data.best_answer?.question}
                  feedback={data.best_answer?.feedback}
                />

                <AnswerPanel
                  title="Needs Work"
                  tone="bad"
                  score={data.weakest_answer?.score}
                  question={data.weakest_answer?.question}
                  feedback={data.weakest_answer?.feedback}
                />
              </div>
            )}

            <PremiumSurface className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                    Developer mode
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Raw response preview
                  </h2>
                  <p className="mt-1 text-sm text-white/48">
                    Toggle this to inspect the raw JSON returned by the API.
                  </p>
                </div>

                <button
                  onClick={() => setDevMode((v) => !v)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                    devMode
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {devMode ? "ON" : "OFF"}
                </button>
              </div>

              {devMode ? (
                <pre className="mt-5 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/75">
                  {JSON.stringify(data, null, 2)}
                </pre>
              ) : null}
            </PremiumSurface>
          </>
        )}
      </motion.div>
    </div>
  );
}