import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Footer from "../components/Footer";

function GlassCard({ children, className = "", accent }) {
  const [g, setG] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      whileHover={{ y: -2 }} transition={{ duration: 0.18 }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
      className={["group relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-gradient-to-b from-white/[0.055] to-white/[0.018] backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.28)]", className].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      {accent && <div className="absolute -top-12 right-4 h-28 w-28 rounded-full blur-3xl opacity-50" style={{ background: `radial-gradient(circle, ${accent}55, transparent)` }} />}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(380px circle at ${g.x}% ${g.y}%, rgba(109,95,255,0.09), transparent 40%)` }} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const s = { good: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300", bad: "bg-red-500/15 border-red-500/30 text-red-300", neutral: "bg-white/[0.08] border-white/15 text-white/70" };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold font-mono ${s[tone] || s.neutral}`}>{children}</span>;
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

function AnswerPanel({ title, tone, score, question, feedback }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
        {score != null && <Badge tone={tone}>Score: {score}</Badge>}
      </div>
      {question && <p className="text-sm leading-7 text-white/50 mb-4">Q: <span className="text-white/80">{question}</span></p>}
      <div className="rounded-xl border border-white/[0.08] bg-black/15 p-4">
        <p className="text-sm leading-7 text-white/68">{feedback || "No feedback available."}</p>
      </div>
    </GlassCard>
  );
}

function FeedbackList({ items }) {
  if (!items?.length) return null;
  return (
    <GlassCard className="p-6">
      <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-2">Feedback</p>
      <h3 className="text-xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>AI Feedback Points</h3>
      <div className="space-y-3">
        {items.map((fb, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-black font-mono mt-0.5"
              style={{ background: "rgba(109,95,255,0.2)", border: "1px solid rgba(109,95,255,0.4)", color: "#a78bfa" }}>{i + 1}</div>
            <p className="text-sm leading-6 text-white/68">{fb}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

function StrengthWeakness({ strengths, weaknesses }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[{ label: "Strengths", items: strengths, tone: "good", accent: "#00e5cc" }, { label: "Areas to Improve", items: weaknesses, tone: "bad", accent: "#ff4d88" }].map(({ label, items, tone, accent }) => (
        <GlassCard key={label} className="p-6" accent={accent}>
          <p className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: accent }}>{label}</p>
          <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>{label}</h3>
          {items?.length ? (
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-white/65">
                  <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                  {item}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-white/35">None identified yet.</p>}
        </GlassCard>
      ))}
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
  const isOverall = !sessionId || !!data?.total_sessions;

  useEffect(() => {
    (async () => {
      setLoading(true); setMsg("");
      try {
        const url = sessionId ? `/insights/${encodeURIComponent(sessionId)}` : "/insights";
        const res = await api.get(url);
        setData(res.data);
      } catch (e) { setMsg(e?.response?.data?.detail || "Failed to load insights"); }
      finally { setLoading(false); }
    })();
  }, [sessionId]);

  return (
    <div className="space-y-6 py-2">
      {/* ── Header ─────────────────────── */}
      <GlassCard className="overflow-hidden p-7 sm:p-9">
        <div className="absolute -right-12 top-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,229,204,0.16),transparent)", filter: "blur(40px)" }} />
        <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(109,95,255,0.14),transparent)", filter: "blur(40px)" }} />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="section-eyebrow mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc]" />
              {isOverall ? "Overall Insights" : "Session Insights"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[0.94] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              {isOverall ? "Performance Insights" : "Interview Insights"}
            </h1>
            <p className="text-sm sm:text-base leading-7 text-white/50 max-w-xl">
              {isOverall ? "A high-level view of patterns, strengths, and improvement opportunities across all sessions." : `Personalized feedback and highlights for ${sessionId ? sessionId.slice(0, 24) + "…" : "this session"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.button onClick={() => nav(-1)} whileHover={{ scale: 1.02 }}
              className="px-5 py-2.5 rounded-full border border-white/[0.09] bg-white/[0.04] text-sm font-semibold text-white/75 hover:bg-white/[0.08] transition-all">
              ← Back
            </motion.button>
            <Link to={sessionId ? `/analytics?session_id=${encodeURIComponent(sessionId)}` : "/analytics"}
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white btn-shimmer"
              style={{ background: "linear-gradient(135deg,#00e5cc,#6d5fff)" }}>
              Full Analytics
            </Link>
          </div>
        </div>
      </GlassCard>

      {loading && (
        <GlassCard className="p-10 text-center">
          <div className="flex items-center justify-center gap-3 text-white/40 text-sm">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            Loading insights…
          </div>
        </GlassCard>
      )}
      {msg && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{msg}</div>}

      {!loading && data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Sessions" value={data.total_sessions ?? "—"} accent="#6d5fff" />
            <StatCard label="Avg Score" value={`${Number(data.avg_score ?? 0).toFixed(1)}/10`} sub="All sessions" accent="#00e5cc" />
            <StatCard label="Best Domain" value={data.best_domain ?? data.domain?.toUpperCase() ?? "—"} accent="#a78bfa" />
            <StatCard label="Difficulty" value={data.difficulty ?? "—"} accent="#ff4d88" />
          </div>

          {/* Strengths / Weaknesses */}
          <StrengthWeakness strengths={data.strengths || data.top_strengths} weaknesses={data.weaknesses || data.areas_to_improve} />

          {/* Feedback list */}
          <FeedbackList items={data.feedback || data.top_feedback} />

          {/* Best / worst (session only) */}
          {!isOverall && (
            <div className="grid gap-4 lg:grid-cols-2">
              <AnswerPanel title="Best Answer" tone="good" score={data.best_answer?.score} question={data.best_answer?.question} feedback={data.best_answer?.feedback} />
              <AnswerPanel title="Needs Work" tone="bad" score={data.weakest_answer?.score} question={data.weakest_answer?.question} feedback={data.weakest_answer?.feedback} />
            </div>
          )}

          {/* Domain distribution (overall only) */}
          {isOverall && data.domains && Object.keys(data.domains).length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-1">Domain Distribution</p>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Practice spread</h3>
                </div>
                <Badge>{data.total_sessions ?? 0} sessions</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(data.domains).map(([domain, count]) => (
                  <div key={domain} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-2">Domain</p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold uppercase text-white">{domain}</span>
                      <Badge>{count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Dev mode */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-1">Developer Mode</p>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Raw JSON preview</h3>
              </div>
              <motion.button
                onClick={() => setDevMode(v => !v)} whileHover={{ scale: 1.03 }}
                className={`rounded-full border px-4 py-2 text-xs font-bold font-mono transition-all ${devMode ? "border-[#6d5fff] bg-[#6d5fff]/20 text-[#a78bfa]" : "border-white/[0.1] bg-white/[0.04] text-white/45 hover:text-white"}`}
              >
                {devMode ? "ON" : "OFF"}
              </motion.button>
            </div>
            {devMode && (
              <pre className="mt-5 overflow-auto rounded-xl border border-white/[0.08] bg-black/30 p-4 text-[11px] text-white/60 font-mono max-h-[400px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </GlassCard>
        </>
      )}

      <Footer />
    </div>
  );
}
