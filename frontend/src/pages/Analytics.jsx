import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import Footer from "../components/Footer";
import {
  BarChart3, TrendingUp, MessageCircle, Target,
  ThumbsUp, ThumbsDown, AlertCircle, Activity,
} from "lucide-react";

/* ── GlassCard ───────────────────────────────────────────────── */
function GlassCard({ children, className = "", accent }) {
  const [g, setG] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className={`group relative overflow-hidden rounded-[24px] border border-white/[0.09] transition-all duration-300 hover:border-white/[0.15] ${className}`}
      style={{
        background: "linear-gradient(180deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.018) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      {accent && (
        <div
          className="absolute -top-12 -right-8 w-32 h-32 rounded-full opacity-35 pointer-events-none"
          style={{ background: `radial-gradient(circle,${accent}55,transparent)`, filter: "blur(28px)" }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(350px circle at ${g.x}% ${g.y}%, rgba(109,95,255,0.07), transparent 50%)` }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ── Stat card ───────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, accent = "#6d5fff", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="p-5" accent={accent}>
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
          >
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
        </div>
        <p
          className="text-2xl font-extrabold text-white mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </p>
        <p className="text-[11px] font-mono text-white/35 uppercase tracking-widest">{label}</p>
        {sub && <p className="text-[11px] text-white/28 mt-0.5">{sub}</p>}
      </GlassCard>
    </motion.div>
  );
}

/* ── Metric bar ──────────────────────────────────────────────── */
function MetricBar({ label, value, max = 10, suffix = "" }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <p className="text-[12.5px] text-white/65">{label}</p>
        <p className="text-[12.5px] font-bold text-white font-mono">
          {typeof value === "number" ? value.toFixed(2) : value}{suffix}
        </p>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#6d5fff,#00e5cc)" }}
        />
      </div>
      <p className="mt-1.5 text-[9px] font-mono text-white/20">0 → {max}</p>
    </div>
  );
}

/* ── Mini bar chart row ──────────────────────────────────────── */
function BarRows({ rows }) {
  const maxVal = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-3">
      {rows.map(({ label, value }) => {
        const pct = (value / maxVal) * 100;
        return (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] text-white/55">{label}</p>
              <p className="text-[12px] font-bold text-white font-mono">{typeof value === "number" ? value.toFixed(2) : value}</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#6d5fff,#00e5cc)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Answer panel ────────────────────────────────────────────── */
function AnswerPanel({ title, tone, answer }) {
  if (!answer) return null;
  const colors = { good: { border: "rgba(0,229,204,0.3)", bg: "rgba(0,229,204,0.06)", text: "#00e5cc" },
                   bad:  { border: "rgba(255,77,136,0.3)", bg: "rgba(255,77,136,0.06)", text: "#ff4d88" } };
  const c = colors[tone] || colors.good;
  const Icon = tone === "good" ? ThumbsUp : ThumbsDown;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: `${c.text}18`, border: `1px solid ${c.border}` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: c.text }} />
        </div>
        <h3 className="text-[14px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      </div>
      {answer.question && (
        <p className="text-[12px] text-white/40 mb-3 font-mono leading-relaxed">
          Q: <span className="text-white/60">{answer.question}</span>
        </p>
      )}
      <div
        className="rounded-xl border p-4 mb-3"
        style={{ borderColor: c.border, background: c.bg }}
      >
        <p className="text-[13px] text-white/70 leading-7">
          {answer.feedback || answer.text || "—"}
        </p>
      </div>
      {answer.score != null && (
        <p className="text-[11px] font-mono text-white/35">
          Score: <span className="text-white/70 font-bold">{Number(answer.score).toFixed(1)} / 10</span>
        </p>
      )}
    </GlassCard>
  );
}

/* ── Skeleton ────────────────────────────────────────────────── */
function Skel({ h = "h-28" }) {
  return <div className={`${h} rounded-2xl bg-white/[0.04] animate-pulse`} />;
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Analytics() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [data, setData]       = useState(null);
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg]         = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = sessionId
      ? `/analysis/session/${encodeURIComponent(sessionId)}`
      : "/analysis/me";

    (async () => {
      try {
        const res = await api.get(url);
        setData(res.data);
      } catch (e) {
        if (e?.response?.status === 401) { localStorage.removeItem("token"); navigate("/login", { replace: true }); }
        else setMsg(e?.response?.data?.detail || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (!data && !loading && !msg) return null;

  const overall = data?.overall || data;
  const comms   = data?.communication;
  const scores  = data?.scores;
  const ansLen  = data?.answer_length;
  const sim     = data?.similarity;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[11px] font-mono text-white/45 uppercase tracking-widest">
              {sessionId ? "Session Analytics" : "Overall Analytics"}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            Deep Analysis
          </h1>
          <p className="mt-2 text-white/38 text-sm">
            {sessionId ? `Session · #${sessionId.slice(-12)}` : "Aggregated across all your sessions"}
          </p>
        </motion.div>

        {/* Error */}
        {msg && (
          <div className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08]">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-[13px] text-red-300">{msg}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skel key={i} />)}
            </div>
            <Skel h="h-48" />
            <div className="grid sm:grid-cols-2 gap-4"><Skel h="h-56" /><Skel h="h-56" /></div>
          </div>
        ) : data ? (
          <div className="space-y-6">

            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={BarChart3}    label="Total Sessions"   value={overall?.total_sessions ?? "—"}                                                           accent="#6d5fff" delay={0.05} />
              <StatCard icon={TrendingUp}   label="Avg Score"         value={`${Number(scores?.average_score ?? overall?.avg_score ?? 0).toFixed(1)}/10`}             accent="#00e5cc" delay={0.1}  />
              <StatCard icon={MessageCircle}label="Avg Comm Score"    value={`${Number(comms?.avg_communication_score ?? 0).toFixed(1)}/10`} sub="Voice quality"       accent="#a78bfa" delay={0.15} />
              <StatCard icon={Target}       label="Total Fillers"     value={comms?.total_filler_count ?? "—"} sub="um, uh, like…"                                    accent="#ff4d88" delay={0.2}  />
            </div>

            {/* Score metrics */}
            {scores && (
              <GlassCard className="p-6" accent="#6d5fff">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <h2 className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Score Metrics</h2>
                </div>
                <div className="space-y-3">
                  <MetricBar label="Average Score"     value={Number(scores.average_score ?? 0)}     max={10} />
                  <MetricBar label="Average Similarity" value={Number(sim?.avg_similarity ?? 0)}     max={1} />
                </div>
              </GlassCard>
            )}

            {/* Two-col section */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Answer length */}
              {ansLen && (
                <GlassCard className="p-6">
                  <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">Answer Length</p>
                  <h3 className="text-[15px] font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>
                    Response Detail
                  </h3>
                  <BarRows rows={[
                    { label: "Average chars", value: Math.round(Number(ansLen.avg_chars ?? 0)) },
                    { label: "Min chars",     value: Number(ansLen.min_chars ?? 0) },
                    { label: "Max chars",     value: Number(ansLen.max_chars ?? 0) },
                  ]} />
                </GlassCard>
              )}

              {/* Similarity */}
              {sim && (
                <GlassCard className="p-6">
                  <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">Similarity</p>
                  <h3 className="text-[15px] font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>
                    Answer Alignment
                  </h3>
                  <BarRows rows={[
                    { label: "Min",     value: Number(sim.min_similarity ?? 0) },
                    { label: "Average", value: Number(sim.avg_similarity ?? 0) },
                    { label: "Max",     value: Number(sim.max_similarity ?? 0) },
                  ]} />
                </GlassCard>
              )}
            </div>

            {/* Communication breakdown */}
            {comms && (
              <GlassCard className="p-6" accent="#a78bfa">
                <div className="flex items-center gap-2 mb-5">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  <h2 className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Communication Quality
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Avg Comm Score",    value: Number(comms.avg_communication_score ?? 0), max: 10 },
                    { label: "Avg Filler Rate",   value: Number(comms.avg_filler_rate ?? 0),         max: 1, suffix: "/word" },
                    { label: "Avg Word Count",    value: Math.round(Number(comms.avg_word_count ?? 0)), max: 200 },
                    { label: "Total Fillers",     value: Number(comms.total_filler_count ?? 0),      max: Math.max(50, comms.total_filler_count ?? 1) },
                  ].map((m) => (
                    <MetricBar key={m.label} label={m.label} value={m.value} max={m.max} suffix={m.suffix} />
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Best / worst answers */}
            {(data.best_answer || data.worst_answer) && (
              <div className="grid sm:grid-cols-2 gap-4">
                <AnswerPanel title="Best Answer"    tone="good" answer={data.best_answer}  />
                <AnswerPanel title="Weakest Answer" tone="bad"  answer={data.worst_answer} />
              </div>
            )}
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}