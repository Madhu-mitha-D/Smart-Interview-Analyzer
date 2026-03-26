import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, CheckCircle, Activity, ArrowRight,
  Brain, Code2, FileText, BarChart3, Target, Sparkles,
} from "lucide-react";
import api from "../api/axios";
import Footer from "../components/Footer";

/* ── Shared GlassCard ────────────────────────────────────────── */
function GlassCard({ children, className = "", accent, onClick }) {
  const [g, setG] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      whileHover={onClick ? { y: -3, scale: 1.003 } : { y: -2 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className={`group relative overflow-hidden rounded-[24px] border border-white/[0.08] transition-all duration-300 hover:border-white/[0.14] ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.016) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Top shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Accent glow */}
      {accent && (
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-40 pointer-events-none"
          style={{ background: `radial-gradient(circle,${accent}55,transparent 70%)`, filter: "blur(24px)" }}
        />
      )}
      {/* Mouse spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(300px circle at ${g.x}% ${g.y}%, rgba(109,95,255,0.07), transparent 50%)` }}
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
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
          >
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
          <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest mt-1">{label}</span>
        </div>
        <p
          className="text-3xl font-extrabold text-white mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </p>
        {sub && <p className="text-[12px] text-white/35">{sub}</p>}
      </GlassCard>
    </motion.div>
  );
}

/* ── Progress bar ────────────────────────────────────────────── */
function ScoreBar({ value, max = 10 }) {
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

/* ── Session row ─────────────────────────────────────────────── */
function SessionRow({ session, onView, onResume }) {
  const score = session.total_score != null ? Number(session.total_score) : null;
  const date  = session.created_at
    ? new Date(session.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : "—";
  const typeIcon = { domain: Brain, coding: Code2, resume: FileText }[session.interview_type] || Activity;
  const TypeIcon = typeIcon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 group"
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(109,95,255,0.12)", border: "1px solid rgba(109,95,255,0.22)" }}
      >
        <TypeIcon className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white/80 truncate capitalize">
          {session.interview_type || "Interview"}{" "}
          <span className="text-white/30 font-mono text-[10px]">#{session.session_id?.slice(-6)}</span>
        </p>
        <p className="text-[11px] text-white/30 font-mono">{date}</p>
      </div>

      {/* Score / status */}
      <div className="text-right flex-shrink-0">
        {session.is_completed && score != null ? (
          <div>
            <p className="text-sm font-bold text-white leading-none mb-1">{score.toFixed(1)}<span className="text-white/30 text-[10px]">/10</span></p>
            <ScoreBar value={score} />
          </div>
        ) : (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
            In Progress
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!session.is_completed && (
          <button
            onClick={() => onResume?.(session)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 14px rgba(109,95,255,0.3)" }}
          >
            Resume
          </button>
        )}
        {session.is_completed && (
          <button
            onClick={() => onView?.(session)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white/60 border border-white/[0.1] hover:border-white/20 hover:text-white transition-all"
          >
            View
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Quick action card ───────────────────────────────────────── */
function QuickCard({ icon: Icon, title, desc, accent, onClick }) {
  return (
    <GlowMiniCard accent={accent} onClick={onClick}>
      <div className="p-4">
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <p className="text-[13px] font-bold text-white mb-0.5" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
        <p className="text-[11px] text-white/38">{desc}</p>
      </div>
    </GlowMiniCard>
  );
}

function GlowMiniCard({ children, accent, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] cursor-pointer hover:border-white/[0.15] transition-all duration-300"
      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right,${accent}22,transparent 60%)` }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState("");

  const forceLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/interviews/sessions");
        setSessions(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        if (e?.response?.status === 401) forceLogout();
        else setMsg(e?.response?.data?.detail || "Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total     = sessions.length;
    const completed = sessions.filter((s) => s.is_completed).length;
    const scores    = sessions
      .filter((s) => s.is_completed && s.total_score != null)
      .map((s) => Number(s.total_score));
    const avgScore  = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "—";
    const best      = scores.length ? Math.max(...scores).toFixed(1) : "—";
    return { total, completed, avgScore, best };
  }, [sessions]);

  const recent = useMemo(() => [...sessions].reverse().slice(0, 8), [sessions]);
  const active = useMemo(() => sessions.find((s) => !s.is_completed), [sessions]);

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-mono text-white/45 uppercase tracking-widest">Dashboard</span>
          </div>
          <h1
            className="text-4xl font-extrabold text-white tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Progress
          </h1>
          <p className="text-white/38 text-base">Track sessions, scores, and growth over time.</p>
        </motion.div>

        {/* ── Stats grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Activity}    label="Total Sessions" value={loading ? "…" : stats.total}     accent="#6d5fff" delay={0.05} />
          <StatCard icon={CheckCircle} label="Completed"       value={loading ? "…" : stats.completed} accent="#00e5cc" delay={0.1}  />
          <StatCard icon={TrendingUp}  label="Avg. Score"      value={loading ? "…" : stats.avgScore}  sub="out of 10" accent="#a78bfa" delay={0.15} />
          <StatCard icon={Target}      label="Best Score"      value={loading ? "…" : stats.best}      sub="personal best" accent="#ff4d88" delay={0.2} />
        </div>

        {/* ── Active session banner ───────────────────────────── */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <div
                className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                style={{
                  background: "linear-gradient(135deg,rgba(109,95,255,0.18),rgba(0,229,204,0.1))",
                  border: "1px solid rgba(109,95,255,0.3)",
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at left,rgba(109,95,255,0.15),transparent 60%)" }}
                />
                <div className="flex items-center gap-3 relative z-10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute h-full w-full rounded-full bg-purple-400 animate-ping opacity-75" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-purple-400" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-white">Session in progress</p>
                    <p className="text-[11px] text-white/45 font-mono capitalize">
                      {active.interview_type} · #{active.session_id?.slice(-6)}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/interview/domain?session_id=${encodeURIComponent(active.session_id)}`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white relative z-10 flex-shrink-0 transition-all"
                  style={{ background: "rgba(109,95,255,0.35)", border: "1px solid rgba(109,95,255,0.5)" }}
                >
                  Resume <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sessions list */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">History</p>
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Recent Sessions
                  </h2>
                </div>
                <button
                  onClick={() => navigate("/analytics")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 rounded-2xl bg-white/[0.03] animate-pulse" />
                  ))}
                </div>
              ) : msg ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07]">
                  <p className="text-[12px] text-red-300">{msg}</p>
                </div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(109,95,255,0.1)", border: "1px solid rgba(109,95,255,0.2)" }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-[14px] font-semibold text-white/60 mb-1">No sessions yet</p>
                  <p className="text-[12px] text-white/30">Start an interview to see your history here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recent.map((s) => (
                    <SessionRow
                      key={s.session_id}
                      session={s}
                      onView={() => navigate(`/insights?session_id=${encodeURIComponent(s.session_id)}`)}
                      onResume={() => navigate(`/interview/domain?session_id=${encodeURIComponent(s.session_id)}`)}
                    />
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Side column */}
          <div className="space-y-4">
            {/* Quick actions */}
            <GlassCard className="p-5">
              <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-4">Quick Start</p>
              <div className="space-y-2">
                <QuickCard
                  icon={Brain} title="Domain Interview" desc="Pick a topic & go"
                  accent="#6d5fff" onClick={() => navigate("/interview/domain")}
                />
                <QuickCard
                  icon={FileText} title="Resume Interview" desc="Upload & practice"
                  accent="#00e5cc" onClick={() => navigate("/interview/resume")}
                />
                <QuickCard
                  icon={Code2} title="Coding Interview" desc="Solve in-browser"
                  accent="#a78bfa" onClick={() => navigate("/interview/coding")}
                />
              </div>
            </GlassCard>

            {/* Score snapshot */}
            <GlassCard className="p-5" accent="#6d5fff">
              <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-4">Score Snapshot</p>
              {[
                { label: "Avg. Score",  value: stats.avgScore === "—" ? 0 : parseFloat(stats.avgScore), max: 10 },
                { label: "Completion",  value: stats.total > 0 ? (stats.completed / stats.total) * 10 : 0, max: 10 },
              ].map(({ label, value, max }) => (
                <div key={label} className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[12px] text-white/50">{label}</span>
                    <span className="text-[12px] font-bold text-white">{isNaN(value) ? "—" : value.toFixed(1)}</span>
                  </div>
                  <ScoreBar value={value} max={max} />
                </div>
              ))}
              <button
                onClick={() => navigate("/analytics")}
                className="mt-1 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold text-white/50 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] transition-all"
              >
                Full Analytics <ArrowRight className="w-3 h-3" />
              </button>
            </GlassCard>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}