import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import Footer from "../components/Footer";
import {
  TrendingUp, TrendingDown, Star, MessageSquare, BarChart3,
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp,
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
          className="absolute -top-12 right-0 w-32 h-32 rounded-full opacity-40 pointer-events-none"
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

/* ── Badge ───────────────────────────────────────────────────── */
function Badge({ children, tone = "neutral" }) {
  const s = {
    good:    "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    bad:     "bg-red-500/15 border-red-500/30 text-red-300",
    neutral: "bg-white/[0.08] border-white/[0.14] text-white/65",
    info:    "bg-sky-500/15 border-sky-500/30 text-sky-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold font-mono ${s[tone] || s.neutral}`}>
      {children}
    </span>
  );
}

/* ── Score ring ──────────────────────────────────────────────── */
function ScoreRing({ score, max = 10, size = 80 }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? "#00e5cc" : pct >= 45 ? "#f59e0b" : "#ff4d88";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          transform="rotate(-90 40 40)"
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-black text-white">{typeof score === "number" ? score.toFixed(1) : score}</span>
        <span className="text-[9px] text-white/30 font-mono">/{max}</span>
      </div>
    </div>
  );
}

/* ── Progress bar ────────────────────────────────────────────── */
function Bar({ value, max = 10 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg,#6d5fff,#00e5cc)" }}
      />
    </div>
  );
}

/* ── Collapsible answer ──────────────────────────────────────── */
function AnswerCard({ idx, question, feedback, score }) {
  const [open, setOpen] = useState(idx === 0);
  const tone = score >= 7 ? "good" : score >= 4 ? "neutral" : "bad";

  return (
    <motion.div layout className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
          style={{ background: "rgba(109,95,255,0.18)", border: "1px solid rgba(109,95,255,0.3)", color: "#a78bfa" }}
        >
          {idx + 1}
        </div>
        <p className="flex-1 text-[13px] font-semibold text-white/70 truncate">{question || `Answer ${idx + 1}`}</p>
        {score != null && <Badge tone={tone}>{score}/10</Badge>}
        <span className="text-white/25 ml-1 flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 pb-4 border-t border-white/[0.06]">
              {question && (
                <p className="text-[12px] text-white/35 mt-3 mb-2 font-mono leading-relaxed">
                  Q: <span className="text-white/55">{question}</span>
                </p>
              )}
              <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                <p className="text-[13px] leading-7 text-white/62">{feedback || "No feedback available."}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Strengths / Weaknesses ──────────────────────────────────── */
function SwList({ title, items, accent, icon: Icon }) {
  if (!items?.length) return null;
  return (
    <GlassCard className="p-6" accent={accent}>
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        </div>
        <h3 className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: accent }} />
            <p className="text-[12.5px] text-white/62 leading-relaxed">{item}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ── Loading skeleton ────────────────────────────────────────── */
function Skeleton({ h = "h-32", className = "" }) {
  return <div className={`${h} rounded-2xl bg-white/[0.04] animate-pulse ${className}`} />;
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Insights() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [data, setData]     = useState(null);
  const [msg, setMsg]       = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    const url = `/analysis/session/${encodeURIComponent(sessionId)}`;
    (async () => {
      try {
        const res = await api.get(url);
        setData(res.data);
      } catch (e) {
        if (e?.response?.status === 401) { localStorage.removeItem("token"); navigate("/login", { replace: true }); }
        else setMsg(e?.response?.data?.detail || "Failed to load insights.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-8 text-center">
          <div
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-5"
            style={{ background: "rgba(109,95,255,0.12)", border: "1px solid rgba(109,95,255,0.22)" }}
          >
            <BarChart3 className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Session Insights
          </h1>
          <p className="text-white/40 mb-8 max-w-sm mx-auto">
            Select a completed session from your Dashboard to view detailed feedback.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 20px rgba(109,95,255,0.3)" }}
          >
            Go to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

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
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-mono text-white/45 uppercase tracking-widest">Session Insights</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            Performance Report
          </h1>
          <p className="mt-2 text-white/38 font-mono text-sm">#{sessionId?.slice(-12)}</p>
        </motion.div>

        {/* Error */}
        {msg && (
          <div className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08]">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-[13px] text-red-300">{msg}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4"><Skeleton /><Skeleton /><Skeleton /></div>
            <Skeleton h="h-48" />
            <Skeleton h="h-64" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Score overview */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Overall Score", value: data.total_score ?? data.overall_score, max: 10, accent: "#6d5fff" },
                { label: "Technical",     value: data.technical_score,                   max: 10, accent: "#00e5cc" },
                { label: "Communication", value: data.communication_score,               max: 10, accent: "#a78bfa" },
              ].filter(s => s.value != null).map(({ label, value, max, accent }) => (
                <GlassCard key={label} className="p-5" accent={accent}>
                  <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-4">{label}</p>
                  <div className="flex items-end gap-3">
                    <ScoreRing score={Number(value)} max={max} size={72} />
                    <div className="flex-1">
                      <Bar value={Number(value)} max={max} />
                      <p className="text-[11px] text-white/30 mt-1 font-mono">{Number(value).toFixed(1)} / {max}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Strengths + Weaknesses */}
            {(data.strengths?.length || data.weaknesses?.length) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {data.strengths?.length > 0 && (
                  <SwList title="Strengths" items={data.strengths} accent="#00e5cc" icon={CheckCircle} />
                )}
                {data.weaknesses?.length > 0 && (
                  <SwList title="Areas to Improve" items={data.weaknesses} accent="#ff4d88" icon={XCircle} />
                )}
              </div>
            )}

            {/* AI Feedback */}
            {data.overall_feedback && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <h2 className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    AI Overall Feedback
                  </h2>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-black/20 p-5">
                  <p className="text-[13.5px] text-white/65 leading-[1.85]">{data.overall_feedback}</p>
                </div>
              </GlassCard>
            )}

            {/* Per-answer breakdown */}
            {data.answers?.length > 0 && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <h2 className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Answer Breakdown
                  </h2>
                  <Badge tone="neutral">{data.answers.length} answers</Badge>
                </div>
                <div className="space-y-2">
                  {data.answers.map((ans, i) => (
                    <AnswerCard
                      key={i}
                      idx={i}
                      question={ans.question}
                      feedback={ans.feedback}
                      score={ans.score}
                    />
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        ) : !msg && (
          <div className="text-center py-16">
            <p className="text-white/35">No data available for this session.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}