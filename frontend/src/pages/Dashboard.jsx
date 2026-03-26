import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  TrendingUp,
  CheckCircle,
  Video,
  Globe,
  Brain,
  Target,
  Sparkles,
  Activity,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import api from "../api/axios";
import Footer from "../components/Footer";
import { BentoGrid } from "../components/ui/bento-grid";

function SolidGlowCard({
  children,
  className = "",
  hasPersistentHover = false,
  glow = "violet",
}) {
  const glowMap = {
    violet: {
      border: "hover:border-[#6d5fff]/40",
      g1: "bg-[#6d5fff]/35",
      g2: "bg-[#00e5cc]/18",
    },
    cyan: {
      border: "hover:border-[#00e5cc]/35",
      g1: "bg-[#00e5cc]/28",
      g2: "bg-[#6d5fff]/18",
    },
    pink: {
      border: "hover:border-[#ff4d88]/35",
      g1: "bg-[#ff4d88]/28",
      g2: "bg-[#6d5fff]/16",
    },
  };

  const current = glowMap[glow] || glowMap.violet;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.002 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={[
        "group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#09090f] transition-all duration-300",
        current.border,
        className,
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 transition-opacity duration-300",
          hasPersistentHover
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.10),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_58%,rgba(255,255,255,0.02)_100%)]" />
      </div>

      <div
        className={[
          "pointer-events-none absolute inset-0 transition-opacity duration-300",
          hasPersistentHover
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      >
        <div className={`absolute -right-20 -top-20 h-72 w-72 rounded-full ${current.g1} blur-[130px]`} />
        <div className={`absolute left-[18%] top-[18%] h-48 w-48 rounded-full ${current.g2} blur-[110px]`} />
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function Btn({
  children,
  variant = "ghost",
  className = "",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "px-5 py-2.5 text-white btn-shimmer shadow-[0_0_30px_rgba(109,95,255,0.35)]",
    ghost:
      "px-4 py-2 border border-white/[0.08] bg-white/[0.06] text-white/78 hover:bg-white/[0.10] hover:text-white",
    danger:
      "px-4 py-2 border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      className={[base, variants[variant], className].join(" ")}
      style={
        variant === "primary"
          ? {
              background: "linear-gradient(135deg,#6d5fff,#00e5cc)",
            }
          : {}
      }
      {...props}
    >
      {children}
    </motion.button>
  );
}

function StatusPill({ done }) {
  return done ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      In Progress
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, glow = "violet" }) {
  return (
    <SolidGlowCard className="p-5" glow={glow}>
      <div className="mb-4 flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
          {label}
        </p>
        {Icon ? <Icon className="h-4 w-4 text-white/35" /> : null}
      </div>
      <p
        className="text-3xl font-extrabold text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      {sub ? <p className="mt-2 text-[12px] text-white/38">{sub}</p> : null}
    </SolidGlowCard>
  );
}

function ProgressBar({ value, max = 10 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
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

function TrendChart({ values }) {
  if (!values.length) {
    return (
      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 text-center text-sm text-white/40">
        Complete interviews to see your trend
      </div>
    );
  }

  const W = 420;
  const H = 160;
  const P = 18;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 10);
  const range = Math.max(max - min, 1);

  const pts = values.map((v, i) => ({
    x: P + (i * (W - P * 2)) / Math.max(values.length - 1, 1),
    y: H - P - ((v - min) / range) * (H - P * 2),
    v,
  }));

  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = [
    `${pts[0].x},${H - P}`,
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${H - P}`,
  ].join(" ");

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full">
        <defs>
          <linearGradient id="tA" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(109,95,255,0.45)" />
            <stop offset="100%" stopColor="rgba(0,229,204,0.02)" />
          </linearGradient>
          <linearGradient id="tS" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6d5fff" />
            <stop offset="100%" stopColor="#00e5cc" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={P}
            x2={W - P}
            y1={P + (i * (H - P * 2)) / 3}
            y2={P + (i * (H - P * 2)) / 3}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        <polygon points={area} fill="url(#tA)" />
        <polyline
          points={line}
          fill="none"
          stroke="url(#tS)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" />
            <circle cx={p.x} cy={p.y} r="9" fill="rgba(255,255,255,0.08)" />
          </g>
        ))}
      </svg>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/28">
        {values.map((_, i) => (
          <span key={i}>S{i + 1}</span>
        ))}
      </div>
    </div>
  );
}

function SessionCard({ s, idx, nav, deletingId, openDelete }) {
  const sid = s.session_id;
  const isDone = !!s.is_completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
    >
      <SolidGlowCard className="p-5" glow={isDone ? "cyan" : "violet"}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span
                className="text-base font-bold uppercase tracking-wider text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.domain}
              </span>
              <span className="text-xs text-white/20">•</span>
              <span className="text-sm capitalize text-white/50">
                {s.difficulty}
              </span>
              <StatusPill done={isDone} />
            </div>

            <p className="mb-3 break-all font-mono text-[12px] text-white/35">
              ID: {sid}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/45">
              {s.total_score != null ? (
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-[#00e5cc]">
                    {Number(s.total_score).toFixed(1)}
                  </span>
                  <span className="text-white/30">/ 10</span>
                </span>
              ) : null}

              {s.question_count != null ? (
                <span>{s.question_count} questions</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isDone ? (
              <Btn
                variant="primary"
                onClick={() =>
                  nav(`/interview?session_id=${encodeURIComponent(sid)}`)
                }
              >
                Resume
              </Btn>
            ) : null}

            {isDone ? (
              <Btn
                variant="ghost"
                onClick={() =>
                  nav(`/insights?session_id=${encodeURIComponent(sid)}`)
                }
              >
                View Insights
              </Btn>
            ) : null}

            <button
              onClick={() => openDelete(s)}
              disabled={deletingId === sid}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.08] text-white/35 transition-all hover:border-red-500/30 hover:bg-red-500/[0.08] hover:text-red-400"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-3.5 w-3.5"
              >
                <path d="M2 4h12M6 4V2h4v2M5 4v9h6V4" />
                <path d="M7 7v4M9 7v4" />
              </svg>
            </button>
          </div>
        </div>
      </SolidGlowCard>
    </motion.div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [me, setMe] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMe, setLoadingMe] = useState(true);
  const [msg, setMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  const forceLogout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const r = await api.get("/interviews/sessions");
      setSessions(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      if (e?.response?.status === 401) forceLogout();
      else setMsg(e?.response?.data?.detail || "Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/auth/me");
        setMe(r.data);
      } catch (e) {
        if (e?.response?.status === 401) forceLogout();
      } finally {
        setLoadingMe(false);
      }
    })();

    loadSessions();
  }, []);

  const orderedSessions = useMemo(() => {
    const active = sessions.filter((s) => !s.is_completed);
    const done = sessions.filter((s) => s.is_completed);
    return [...active, ...done];
  }, [sessions]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((s) => s.is_completed).length;
    const active = total - completed;
    const scores = sessions
      .filter((s) => s.is_completed && s.total_score != null)
      .map((s) => Number(s.total_score));
    const avgScore = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "—";
    return { total, completed, active, avgScore };
  }, [sessions]);

  const latestActive = useMemo(
    () => sessions.find((s) => !s.is_completed),
    [sessions]
  );

  const domainSummary = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const d = String(s.domain || "general").toUpperCase();
      if (!map[d]) map[d] = { count: 0, score: 0 };
      map[d].count += 1;
      map[d].score += Number(s.total_score || 0);
    });
    return Object.entries(map).map(([domain, data]) => ({
      domain,
      count: data.count,
      avgScore: data.count ? data.score / data.count : 0,
    }));
  }, [sessions]);

  const trendValues = useMemo(
    () =>
      sessions
        .filter((s) => s.is_completed)
        .slice(0, 6)
        .reverse()
        .map((s) => Number(s.total_score || 0)),
    [sessions]
  );

  const coachMessage = useMemo(() => {
    if (stats.total === 0)
      return "Start your first interview to unlock personalized feedback and progress tracking.";
    if (stats.active > 0)
      return "You have an unfinished session. Resume it to keep momentum going.";
    if (Number(stats.avgScore) < 5)
      return "Focus on clearer structure and stronger examples in your answers.";
    if (Number(stats.avgScore) < 8)
      return "You're improving well. Add more depth and specific outcomes in your responses.";
    return "Excellent! Try a harder round or revisit your weakest domain next.";
  }, [stats]);

  const openDelete = (s) => setDeleteTarget(s);
  const closeDelete = () => {
    if (deletingId) return;
    setDeleteTarget(null);
  };

  const deleteSession = async () => {
    if (!deleteTarget?.session_id) return;
    setMsg("");
    setDeletingId(deleteTarget.session_id);

    try {
      await api.delete(
        `/interviews/${encodeURIComponent(deleteTarget.session_id)}`
      );
      setDeleteTarget(null);
      await loadSessions();
    } catch (e) {
      if (e?.response?.status === 401) return forceLogout();
      setMsg(e?.response?.data?.detail || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  const deleteModal = deleteTarget
    ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeDelete}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 w-full max-w-md rounded-[28px] border border-white/[0.1] bg-[#0d0d18] p-7 shadow-2xl"
          >
            <div
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M2 4h12M6 4V2h4v2M5 4v9h6V4" />
              </svg>
            </div>

            <h3
              className="mb-2 text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Delete session?
            </h3>

            <p className="mb-5 text-sm text-white/55">
              This will permanently delete the session and all answers. This
              action cannot be undone.
            </p>

            <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm">
              <p className="break-all font-mono text-[12px] text-white/50">
                {deleteTarget.session_id}
              </p>
              <p className="mt-1 text-white/60">
                {String(deleteTarget.domain || "").toUpperCase()} •{" "}
                {deleteTarget.difficulty}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Btn variant="ghost" onClick={closeDelete} disabled={!!deletingId}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={deleteSession}
                disabled={!!deletingId}
              >
                {deletingId ? "Deleting…" : "Delete Session"}
              </Btn>
            </div>
          </motion.div>
        </div>,
        document.body
      )
    : null;

  const firstName =
    me?.full_name?.split(" ")[0] || me?.email?.split("@")[0] || "there";

  const dashboardBentoItems = [
    {
      title: "Analytics Dashboard",
      meta: "Live",
      description:
        "Track interview performance, trends, and improvement signals in one place.",
      icon: <TrendingUp className="h-4 w-4 text-[#6d5fff]" />,
      status: "Overview",
      tags: ["Reports", "AI", "Progress"],
      colSpan: 2,
      hasPersistentHover: true,
      cta: "Open analytics →",
    },
    {
      title: "Completed Rounds",
      meta: `${stats.completed}`,
      description:
        "Review finished sessions and see how your practice consistency is improving.",
      icon: <CheckCircle className="h-4 w-4 text-[#00e5cc]" />,
      status: "Updated",
      tags: ["Sessions", "Growth"],
    },
    {
      title: "Video Feedback",
      meta: "Media",
      description:
        "Analyze recorded answers, delivery confidence, and communication signals.",
      icon: <Video className="h-4 w-4 text-[#a78bfa]" />,
      status: "Enabled",
      tags: ["Video", "Feedback"],
      colSpan: 2,
      cta: "Review recordings →",
    },
    {
      title: "Focus Area",
      meta: latestActive ? String(latestActive.domain).toUpperCase() : "Ready",
      description:
        latestActive
          ? "Resume your latest unfinished round and continue improving without losing flow."
          : "No unfinished session right now. Start a new interview and maintain your momentum.",
      icon: <Target className="h-4 w-4 text-[#ff4d88]" />,
      status: latestActive ? "In Progress" : "Available",
      tags: ["Next step", "Practice"],
      cta: latestActive ? "Resume now →" : "Start now →",
    },
    {
      title: "Skill Map",
      meta: `${domainSummary.length} domains`,
      description:
        "Compare how much practice each subject has received and where more work is needed.",
      icon: <Brain className="h-4 w-4 text-[#6d5fff]" />,
      status: "Insight",
      tags: ["Java", "DBMS", "AI", "HR"],
      colSpan: 2,
      cta: "See strengths →",
    },
    {
      title: "Cloud Access",
      meta: "Synced",
      description:
        "Your interview activity and history stay available across your workflow.",
      icon: <Globe className="h-4 w-4 text-[#00e5cc]" />,
      status: "Stable",
      tags: ["Cloud", "Access"],
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-7"
      >
        <SolidGlowCard
          className="overflow-hidden p-7 sm:p-10"
          hasPersistentHover
          glow="violet"
        >
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#6d5fff]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                  {loadingMe ? "Loading…" : `Signed in as ${me?.email || "—"}`}
                </span>
              </div>

              <h1
                className="text-5xl font-extrabold leading-[0.9] text-white sm:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Hey, {firstName} <span className="text-gradient">👋</span>
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-8 text-white/62">
                {coachMessage}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Btn variant="primary" onClick={() => nav("/interview")}>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M5 3l8 5-8 5V3z" fill="currentColor" />
                  </svg>
                  New Interview
                </Btn>

                <Btn variant="ghost" onClick={() => nav("/analytics")}>
                  <BarChart3 className="h-3.5 w-3.5 text-[#00e5cc]" />
                  Analytics
                </Btn>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Sessions"
                value={stats.total}
                icon={Activity}
                glow="violet"
              />
              <StatCard
                label="Completed"
                value={stats.completed}
                sub="Finished rounds"
                icon={CheckCircle}
                glow="cyan"
              />
              <StatCard
                label="In Progress"
                value={stats.active}
                icon={Target}
                glow="pink"
              />
              <StatCard
                label="Avg Score"
                value={stats.avgScore}
                sub="Out of 10"
                icon={TrendingUp}
                glow="violet"
              />
            </div>
          </div>
        </SolidGlowCard>

        <BentoGrid items={dashboardBentoItems} className="mt-1" />

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <SolidGlowCard className="p-6" glow="violet">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
              {latestActive ? "Resume Session" : "Next Action"}
            </p>

            <h2
              className="mb-2 text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {latestActive ? "Continue your interview" : "Start a new interview"}
            </h2>

            <p className="mb-6 text-sm leading-7 text-white/52">
              {latestActive
                ? "Pick up where you left off and keep the momentum going."
                : "No unfinished sessions. Start a fresh round to keep your streak alive."}
            </p>

            {latestActive ? (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <StatusPill done={false} />
                  <span className="text-sm text-white/50">
                    {String(latestActive.domain || "").toUpperCase()} •{" "}
                    {latestActive.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Btn
                    variant="primary"
                    onClick={() =>
                      nav(
                        `/interview?session_id=${encodeURIComponent(
                          latestActive.session_id
                        )}`
                      )
                    }
                  >
                    Continue Interview
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() =>
                      nav(
                        `/insights?session_id=${encodeURIComponent(
                          latestActive.session_id
                        )}`
                      )
                    }
                  >
                    View Insights
                  </Btn>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Btn variant="primary" onClick={() => nav("/interview")}>
                  Start Interview
                </Btn>
                <Btn variant="ghost" onClick={() => nav("/profile")}>
                  View Profile
                </Btn>
              </div>
            )}
          </SolidGlowCard>

          <SolidGlowCard className="p-6" glow="cyan">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
              Domain Strength
            </p>
            <h2
              className="mb-2 text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Practice distribution
            </h2>
            <p className="mb-5 text-sm text-white/50">
              How much attention each domain has received.
            </p>

            <div className="space-y-4">
              {domainSummary.length === 0 ? (
                <p className="py-4 text-center text-sm text-white/38">
                  No domain history yet.
                </p>
              ) : (
                domainSummary.map((item) => (
                  <div key={item.domain}>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">
                        {item.domain}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-white/35">
                          {item.count} session{item.count > 1 ? "s" : ""}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {item.avgScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <ProgressBar value={item.avgScore} max={10} />
                  </div>
                ))
              )}
            </div>
          </SolidGlowCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <SolidGlowCard className="p-6" glow="violet">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
              Score Trend
            </p>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recent performance
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Latest completed interview scores
            </p>
            <TrendChart values={trendValues} />
          </SolidGlowCard>

          <SolidGlowCard className="p-6" glow="pink">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
              Summary
            </p>
            <h2
              className="mb-2 text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Current state
            </h2>
            <p className="mb-5 text-sm text-white/50">
              A compact look at your preparation.
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                  Completion Rate
                </p>
                <p
                  className="mt-2 text-3xl font-extrabold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stats.total
                    ? `${Math.round((stats.completed / stats.total) * 100)}%`
                    : "0%"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
                  Coach Tip
                </p>
                <p className="text-sm leading-6 text-white/58">{coachMessage}</p>
              </div>
            </div>
          </SolidGlowCard>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recent sessions
            </h2>
            <p className="mt-1 text-sm text-white/42">
              Continue unfinished sessions or review completed ones.
            </p>
          </div>

          <Btn variant="ghost" onClick={loadSessions}>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
            >
              <path d="M14 2v5h-5" />
              <path d="M2 14v-5h5" />
              <path d="M2.46 9.01A6 6 0 0 0 14 8" />
              <path d="M13.54 6.99A6 6 0 0 0 2 8" />
            </svg>
            Refresh
          </Btn>
        </div>

        {msg ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
            {msg}
          </div>
        ) : null}

        <div className="space-y-3">
          {loadingSessions ? (
            <SolidGlowCard className="p-8 text-center text-sm text-white/40">
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Loading sessions…
              </div>
            </SolidGlowCard>
          ) : orderedSessions.length === 0 ? (
            <SolidGlowCard className="p-10 text-center" glow="violet">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.08]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                >
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <path d="M12 17v4" />
                  <path d="M8 21h8" />
                </svg>
              </div>

              <h3
                className="mb-2 text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                No sessions yet
              </h3>

              <p className="mb-6 text-sm text-white/45">
                Start your first interview and your activity will appear here.
              </p>

              <Btn variant="primary" onClick={() => nav("/interview")}>
                Start First Interview
              </Btn>
            </SolidGlowCard>
          ) : (
            orderedSessions
              .slice(0, 6)
              .map((s, idx) => (
                <SessionCard
                  key={s.session_id}
                  s={s}
                  idx={idx}
                  nav={nav}
                  deletingId={deletingId}
                  openDelete={openDelete}
                />
              ))
          )}
        </div>
      </motion.div>

      <Footer />
      {deleteModal}
    </>
  );
}