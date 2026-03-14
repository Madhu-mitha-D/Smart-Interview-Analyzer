import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import api from "../api/axios";

function StatusPill({ done }) {
  return done ? (
    <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
      Completed
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
      In progress
    </span>
  );
}

function GhostButton({ children, className = "", disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        "rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, className = "", disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        "rounded-xl px-5 py-2 text-sm font-medium transition",
        disabled
          ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/40"
          : "bg-white text-black hover:scale-[1.02]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Surface({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className={[
        "rounded-2xl border border-white/10 bg-[#141416]/55 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.28)]",
        className,
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ label, value, sub, accent = "white" }) {
  const accentClass =
    accent === "violet"
      ? "from-violet-400/30 to-transparent"
      : accent === "blue"
      ? "from-sky-400/30 to-transparent"
      : accent === "emerald"
      ? "from-emerald-400/30 to-transparent"
      : "from-white/20 to-transparent";

  return (
    <Surface className="relative overflow-hidden p-4">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentClass}`}
      />
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-white/35">{sub}</p> : null}
    </Surface>
  );
}

function ProgressBar({ value, max = 100 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-300/80 to-sky-300/80 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TrendChart({ values }) {
  if (!values.length) {
    return (
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-white/45">
        No completed session trend yet.
      </div>
    );
  }

  const width = 420;
  const height = 180;
  const padding = 18;

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 10);
  const range = Math.max(max - min, 1);

  const points = values.map((v, i) => {
    const x =
      padding + (i * (width - padding * 2)) / Math.max(values.length - 1, 1);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return { x, y, v };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = [
    `${points[0].x},${height - padding}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${height - padding}`,
  ].join(" ");

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
        <defs>
          <linearGradient id="trendArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.35)" />
            <stop offset="100%" stopColor="rgba(14,165,233,0.04)" />
          </linearGradient>
          <linearGradient id="trendStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(139,92,246,0.95)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.95)" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((i) => {
          const y = padding + (i * (height - padding * 2)) / 3;
          return (
            <line
              key={i}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        <polygon points={area} fill="url(#trendArea)" />
        <polyline
          points={line}
          fill="none"
          stroke="url(#trendStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="rgba(255,255,255,0.95)" />
            <circle cx={p.x} cy={p.y} r="8" fill="rgba(255,255,255,0.08)" />
          </g>
        ))}
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs text-white/35">
        {values.map((_, i) => (
          <span key={i}>S{i + 1}</span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  const forceLogout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingMe(true);
        const res = await api.get("/auth/me");
        setMe(res.data);
      } catch {
        forceLogout();
      } finally {
        setLoadingMe(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSessions = async () => {
    setMsg("");
    try {
      setLoadingSessions(true);
      const res = await api.get("/interviews/my");
      setSessions(res.data || []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(e?.response?.data?.detail || "Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderedSessions = useMemo(() => [...(sessions || [])], [sessions]);

  const stats = useMemo(() => {
    const total = orderedSessions.length;
    const completed = orderedSessions.filter((s) => s.is_completed).length;
    const active = total - completed;
    const avgScore =
      total > 0
        ? (
            orderedSessions.reduce(
              (sum, s) => sum + Number(s.total_score || 0),
              0
            ) / total
          ).toFixed(2)
        : "0.00";

    return { total, completed, active, avgScore };
  }, [orderedSessions]);

  const latestActive = useMemo(
    () => orderedSessions.find((s) => !s.is_completed) || null,
    [orderedSessions]
  );

  const recommendedDomain = useMemo(() => {
    const completed = orderedSessions.filter((s) => s.is_completed);

    if (completed.length === 0) return "hr";

    const domainScores = {};
    completed.forEach((s) => {
      const d = String(s.domain || "general").toLowerCase();
      if (!domainScores[d]) domainScores[d] = [];
      domainScores[d].push(Number(s.total_score || 0));
    });

    let weakest = "hr";
    let weakestAvg = Infinity;

    Object.entries(domainScores).forEach(([domain, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < weakestAvg) {
        weakestAvg = avg;
        weakest = domain;
      }
    });

    return weakest;
  }, [orderedSessions]);

  const domainSummary = useMemo(() => {
    const map = {};

    orderedSessions.forEach((s) => {
      const domain = String(s.domain || "general").toUpperCase();
      if (!map[domain]) map[domain] = { count: 0, score: 0 };
      map[domain].count += 1;
      map[domain].score += Number(s.total_score || 0);
    });

    return Object.entries(map).map(([domain, data]) => ({
      domain,
      count: data.count,
      avgScore: data.count ? data.score / data.count : 0,
    }));
  }, [orderedSessions]);

  const coachMessage = useMemo(() => {
    if (stats.total === 0) {
      return "Start your first interview to unlock personalized feedback and progress tracking.";
    }
    if (stats.active > 0) {
      return "You already have an unfinished interview. Resume it to keep the momentum going.";
    }
    if (Number(stats.avgScore) < 5) {
      return "Focus on clearer structure and stronger examples in your answers.";
    }
    if (Number(stats.avgScore) < 8) {
      return "You’re improving well. Add more depth and specific outcomes in your responses.";
    }
    return "You’re doing well. Try a harder round or revisit your weakest domain next.";
  }, [stats]);

  const trendValues = useMemo(() => {
    return orderedSessions
      .filter((s) => s.is_completed)
      .slice(0, 6)
      .reverse()
      .map((s) => Number(s.total_score || 0));
  }, [orderedSessions]);

  const openDelete = (session) => setDeleteTarget(session);

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
      const status = e?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(e?.response?.data?.detail || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  const deleteModal = deleteTarget
    ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/70" onClick={closeDelete} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[#141416] p-6 shadow-2xl"
          >
            <h3 className="text-xl font-semibold text-white">Delete session?</h3>
            <p className="mt-2 text-sm text-white/65">
              This will delete the interview session and all its answers.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
              <p className="break-all text-white/65">
                Session:{" "}
                <span className="text-white/90">{deleteTarget.session_id}</span>
              </p>
              <p className="mt-1 text-white/65">
                {String(deleteTarget.domain || "").toUpperCase()} •{" "}
                {deleteTarget.difficulty}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <GhostButton
                type="button"
                onClick={closeDelete}
                disabled={!!deletingId}
              >
                Cancel
              </GhostButton>

              <button
                type="button"
                onClick={deleteSession}
                disabled={!!deletingId}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
              >
                {deletingId ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="space-y-2 pt-2">
          <p className="text-sm text-white/40">
            {loadingMe ? "Loading profile..." : `Signed in as ${me?.email || "—"}`}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Welcome back{me?.full_name ? `, ${me.full_name}` : ""}.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-white/55">
            Practice interviews, review performance, and keep improving with a calmer,
            clearer view of your progress.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Surface className="p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
              Next action
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {latestActive ? "Continue your interview" : "Start a new interview"}
            </h2>

            {latestActive ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <StatusPill done={false} />
                  <span className="text-sm text-white/55">
                    {String(latestActive.domain || "").toUpperCase()} •{" "}
                    {latestActive.difficulty}
                  </span>
                </div>

                <p className="mt-3 break-all text-sm text-white/42">
                  Session: {latestActive.session_id}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <PrimaryButton
                    onClick={() =>
                      nav(
                        `/interview?session_id=${encodeURIComponent(
                          latestActive.session_id
                        )}`
                      )
                    }
                  >
                    Continue Interview
                  </PrimaryButton>

                  <Link
                    to={`/insights?session_id=${encodeURIComponent(
                      latestActive.session_id
                    )}`}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    View Insights
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-white/58">
                  No unfinished session right now. Start a fresh round and keep your practice streak going.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <PrimaryButton onClick={() => nav("/interview")}>
                    Start Interview
                  </PrimaryButton>
                  <GhostButton onClick={() => nav("/analytics")}>
                    View Analytics
                  </GhostButton>
                </div>
              </>
            )}
          </Surface>

          <Surface className="p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
              Recommendation
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Focus next on {String(recommendedDomain || "hr").toUpperCase()}
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/58">{coachMessage}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => nav("/interview")}>
                Practice Now
              </PrimaryButton>
              <GhostButton onClick={() => nav("/profile")}>View Profile</GhostButton>
            </div>
          </Surface>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Sessions"
            value={stats.total}
            sub="All interview sessions"
            accent="violet"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            sub="Finished sessions"
            accent="emerald"
          />
          <StatCard
            label="In Progress"
            value={stats.active}
            sub="Resume anytime"
            accent="blue"
          />
          <StatCard
            label="Average Score"
            value={stats.avgScore}
            sub="Across all sessions"
            accent="white"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Surface className="p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
              Score trend
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Recent performance
            </h2>
            <p className="mt-2 text-sm text-white/50">
              A quick view of your latest completed interview scores.
            </p>
            <TrendChart values={trendValues} />
          </Surface>

          <Surface className="p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
              Domain strength
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Practice distribution
            </h2>

            <div className="mt-5 space-y-4">
              {domainSummary.length === 0 ? (
                <p className="text-sm text-white/50">
                  No domain history yet. Start a session to build progress data.
                </p>
              ) : (
                domainSummary.map((item) => (
                  <div key={item.domain}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.domain}
                        </p>
                        <p className="text-xs text-white/40">
                          {item.count} session{item.count > 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {item.avgScore.toFixed(1)}
                      </p>
                    </div>
                    <ProgressBar value={item.avgScore} max={10} />
                  </div>
                ))
              )}
            </div>
          </Surface>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Recent sessions</h2>
            <p className="mt-1 text-sm text-white/45">
              Continue unfinished sessions or review completed ones.
            </p>
          </div>

          <GhostButton onClick={loadSessions}>Refresh</GhostButton>
        </div>

        {msg ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {msg}
          </div>
        ) : null}

        <div className="space-y-3">
          {loadingSessions ? (
            <Surface className="p-6 text-white/65">Loading sessions...</Surface>
          ) : orderedSessions.length === 0 ? (
            <Surface className="p-8 text-center">
              <p className="text-lg text-white/85">No sessions yet</p>
              <p className="mt-2 text-white/55">
                Start your first interview and your activity will appear here.
              </p>
              <div className="mt-5">
                <PrimaryButton onClick={() => nav("/interview")}>
                  Start Interview
                </PrimaryButton>
              </div>
            </Surface>
          ) : (
            orderedSessions.slice(0, 6).map((s, idx) => {
              const sid = s.session_id;
              const isDone = !!s.is_completed;

              return (
                <Surface key={sid} className="p-5">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="flex flex-wrap items-center justify-between gap-5"
                  >
                    <div className="min-w-[250px] flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base font-semibold uppercase tracking-wide text-white">
                          {s.domain}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-sm text-white/60">
                          {s.difficulty}
                        </span>
                        <StatusPill done={isDone} />
                      </div>

                      <p className="mt-3 break-all text-sm text-white/42">
                        Session: <span className="text-white/75">{sid}</span>
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/52">
                        <span>
                          Score:{" "}
                          <span className="text-white">{s.total_score ?? 0}</span>
                        </span>

                        {s.verdict ? (
                          <span>
                            Verdict: <span className="text-white">{s.verdict}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        to={`/insights?session_id=${encodeURIComponent(sid)}`}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        Insights
                      </Link>

                      <Link
                        to={`/analytics?session_id=${encodeURIComponent(sid)}`}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        Analytics
                      </Link>

                      <PrimaryButton
                        onClick={() =>
                          nav(`/interview?session_id=${encodeURIComponent(sid)}`)
                        }
                        disabled={isDone}
                        title={
                          isDone
                            ? "Completed sessions can’t be continued."
                            : "Continue interview"
                        }
                      >
                        Continue
                      </PrimaryButton>

                      <button
                        type="button"
                        onClick={() => openDelete(s)}
                        disabled={deletingId === sid}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                      >
                        {deletingId === sid ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </motion.div>
                </Surface>
              );
            })
          )}
        </div>
      </motion.div>

      {deleteModal}
    </>
  );
}