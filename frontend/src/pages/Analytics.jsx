import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Footer from "../components/Footer";

function GlassCard({ children, className = "", accent }) {
  const [g, setG] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
      className={["group relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-gradient-to-b from-white/[0.055] to-white/[0.018] backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.28)]", className].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      {accent && <div className="absolute -top-12 right-4 h-28 w-28 rounded-full blur-3xl opacity-60" style={{ background: `radial-gradient(circle, ${accent}55, transparent)` }} />}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(380px circle at ${g.x}% ${g.y}%, rgba(109,95,255,0.09), transparent 40%)` }} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const styles = {
    good: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    bad: "bg-red-500/15 border-red-500/30 text-red-300",
    info: "bg-sky-500/15 border-sky-500/30 text-sky-300",
    neutral: "bg-white/10 border-white/15 text-white/75",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold font-mono ${styles[tone] || styles.neutral}`}>{children}</span>;
}

function StatCard({ label, value, sub, accent = "#6d5fff" }) {
  return (
    <GlassCard className="p-5" accent={accent}>
      <p className="text-[10px] uppercase tracking-widest text-white/38 font-mono mb-4">{label}</p>
      <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      {sub && <p className="mt-2 text-[12px] text-white/38">{sub}</p>}
    </GlassCard>
  );
}

function MetricBar({ label, value, max = 10, suffix = "" }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm text-white/70">{label}</p>
        <p className="text-sm font-bold text-white">{typeof value === "number" ? value.toFixed(2) : value}{suffix}</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#6d5fff,#00e5cc)" }}
        />
      </div>
      <p className="mt-2 text-[10px] font-mono text-white/30">0 → {max}</p>
    </div>
  );
}

function MiniBars({ title, subtitle, rows }) {
  const maxVal = Math.max(...rows.map(r => r.max), 1);
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono">{subtitle}</p>
          <h3 className="text-lg font-bold text-white mt-1" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map(({ label, value, max }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-white/65">{label}</p>
              <p className="text-sm font-bold text-white font-mono">{typeof value === "number" ? value.toLocaleString() : value}</p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#6d5fff,#00e5cc)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ScoreProgress({ data }) {
  if (!data.length) return null;
  return (
    <GlassCard className="p-6">
      <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-2">Per-Question Breakdown</p>
      <h3 className="text-xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>Score Per Question</h3>
      <div className="space-y-3">
        {data.map((r, i) => {
          const pct = Math.max(0, Math.min(100, (r.score / 10) * 100));
          return (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-sm font-bold text-white">Q{r.qNo || i + 1}</span>
                <div className="flex flex-wrap items-center gap-3 text-white/50 text-xs font-mono">
                  <span>Score: <span className="text-white/80 font-bold">{r.score}</span></span>
                  <span>Sim: <span className="text-white/80">{Number(r.similarity || 0).toFixed(2)}</span></span>
                  {r.wpm && <span>WPM: <span className="text-white/80">{Number(r.wpm).toFixed(0)}</span></span>}
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 70 ? "linear-gradient(90deg,#6d5fff,#00e5cc)" : pct > 40 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#ef4444,#f97316)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function AnswerPanel({ title, tone, answer }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
        <Badge tone={tone}>Score: {answer?.score ?? 0}</Badge>
      </div>
      <p className="text-sm leading-7 text-white/55 mb-4">
        Q{(answer?.question_index ?? 0) + 1}: <span className="text-white/80">{answer?.question || "—"}</span>
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[{ l: "Score", v: answer?.score ?? 0 }, { l: "Similarity", v: Number(answer?.similarity ?? 0).toFixed(2) }].map(({ l, v }) => (
          <div key={l} className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
            <p className="text-[11px] text-white/40 font-mono">{l}</p>
            <p className="mt-1 text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-black/15 p-4">
        <p className="text-sm leading-7 text-white/70 whitespace-pre-wrap">{answer?.feedback || "—"}</p>
      </div>
    </GlassCard>
  );
}

function FeedbackSummary({ items }) {
  return (
    <GlassCard className="p-6">
      <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-2">Summary</p>
      <h3 className="text-xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>Feedback Summary</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-white/40">No feedback yet.</p>
        ) : items.map(([text, count]) => (
          <div key={text} className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.08] bg-black/15 p-4">
            <p className="text-sm leading-6 text-white/72 whitespace-pre-wrap flex-1">{text === "NO_FEEDBACK" ? "No feedback stored." : text}</p>
            <Badge>{count}×</Badge>
          </div>
        ))}
      </div>
    </GlassCard>
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
      setLoading(true); setMsg("");
      try {
        const url = sessionId ? `/analytics/${encodeURIComponent(sessionId)}` : "/analytics";
        const res = await api.get(url);
        setData(res.data);
      } catch (e) { setMsg(e?.response?.data?.detail || "Failed to load analytics"); }
      finally { setLoading(false); }
    })();
  }, [sessionId]);

  const topFeedback = useMemo(() => {
    const map = data?.feedback_summary || {};
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [data]);

  const scoreData = useMemo(() => {
    return (data?.score_per_question || []).map((q, i) => ({
      qNo: q.question_index != null ? q.question_index + 1 : i + 1,
      score: Number(q.score || 0),
      similarity: Number(q.similarity || 0),
      len: q.answer_length || 0,
      wpm: Number(q.wpm || 0),
      pace: q.pace || "—",
      commScore: Number(q.communication_score || 0),
      fillers: q.filler_count || 0,
      pauses: q.pause_count || 0,
    }));
  }, [data]);

  return (
    <div className="space-y-6 py-2">
      {/* ── Header ────────────────────────────────── */}
      <GlassCard className="overflow-hidden p-7 sm:p-9">
        <div className="absolute -right-12 top-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(109,95,255,0.18),transparent)", filter: "blur(40px)" }} />
        <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,229,204,0.12),transparent)", filter: "blur(40px)" }} />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="section-eyebrow mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6d5fff]" />
              {isOverall ? "Overall Analytics" : "Session Analytics"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[0.94] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              {isOverall ? "Overall Analytics" : "Interview Analytics"}
            </h1>
            <p className="text-sm sm:text-base leading-7 text-white/50 max-w-xl">
              {isOverall
                ? "A user-level analytics view across all completed and incomplete sessions."
                : `Session breakdown for ${sessionId ? sessionId.slice(0, 24) + "…" : "this interview"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.button onClick={() => nav(-1)} whileHover={{ scale: 1.02 }}
              className="px-5 py-2.5 rounded-full border border-white/[0.09] bg-white/[0.04] text-sm font-semibold text-white/75 hover:bg-white/[0.08] transition-all">
              ← Back
            </motion.button>
            <Link to={sessionId ? `/insights?session_id=${encodeURIComponent(sessionId)}` : "/insights"}
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white btn-shimmer"
              style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }}>
              View Insights
            </Link>
            <motion.button onClick={() => setShowRaw(!showRaw)} whileHover={{ scale: 1.02 }}
              className="px-5 py-2.5 rounded-full border border-white/[0.09] bg-white/[0.04] text-sm font-semibold text-white/55 hover:text-white transition-all">
              {showRaw ? "Hide" : "Raw"} JSON
            </motion.button>
          </div>
        </div>
      </GlassCard>

      {/* ── Loading / Error ──────────────────────── */}
      {loading && (
        <GlassCard className="p-10 text-center">
          <div className="flex items-center justify-center gap-3 text-white/40 text-sm">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            Loading analytics…
          </div>
        </GlassCard>
      )}
      {msg && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{msg}</div>
      )}

      {/* ── Data ────────────────────────────────── */}
      {!loading && data && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Sessions" value={data.overall?.total_sessions ?? data.total_sessions ?? "—"} accent="#6d5fff" />
            <StatCard label="Avg Score" value={`${Number(data.scores?.average_score ?? data.overall?.avg_score ?? 0).toFixed(1)}/10`} sub="All answers" accent="#00e5cc" />
            <StatCard label="Avg Comm Score" value={`${Number(data.communication?.avg_communication_score ?? 0).toFixed(1)}/10`} sub="Voice quality" accent="#a78bfa" />
            <StatCard label="Total Fillers" value={data.communication?.total_filler_count ?? "—"} sub="um, uh, like…" accent="#ff4d88" />
          </div>

          {/* Score progress */}
          <ScoreProgress data={scoreData} />

          {/* Metrics */}
          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard className="p-6">
              <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-2">Main Metrics</p>
              <h3 className="text-xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>Session summaries</h3>
              <div className="space-y-4">
                <MetricBar label="Average Score" value={Number(data.scores?.average_score ?? 0)} max={10} />
                <MetricBar label="Average Similarity" value={Number(data.similarity?.avg_similarity ?? 0)} max={1} />
              </div>
            </GlassCard>

            <MiniBars
              title="Answer Length"
              subtitle="Character counts per answer"
              rows={[
                { label: "Average", value: Math.round(Number(data.answer_length?.avg_chars ?? 0)), max: Math.max(200, Number(data.answer_length?.max_chars ?? 0) || 200) },
                { label: "Min", value: Number(data.answer_length?.min_chars ?? 0), max: Math.max(200, Number(data.answer_length?.max_chars ?? 0) || 200) },
                { label: "Max", value: Number(data.answer_length?.max_chars ?? 0), max: Math.max(200, Number(data.answer_length?.max_chars ?? 0) || 200) },
              ]}
            />
          </div>

          <MiniBars
            title="Similarity Spread"
            subtitle="Range of answer similarity values"
            rows={[
              { label: "Min", value: Number(data.similarity?.min_similarity ?? 0), max: 1 },
              { label: "Average", value: Number(data.similarity?.avg_similarity ?? 0), max: 1 },
              { label: "Max", value: Number(data.similarity?.max_similarity ?? 0), max: 1 },
            ]}
          />

          {/* Best / worst answers */}
          <div className="grid gap-4 lg:grid-cols-2">
            <AnswerPanel title="Best Answer" tone="good" answer={data.best_answer} />
            <AnswerPanel title="Weakest Answer" tone="bad" answer={data.worst_answer} />
          </div>

          <FeedbackSummary items={topFeedback} />

          {showRaw && (
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Raw JSON</h3>
              <pre className="overflow-auto rounded-xl border border-white/[0.08] bg-black/30 p-4 text-[11px] text-white/65 font-mono max-h-[500px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </GlassCard>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
