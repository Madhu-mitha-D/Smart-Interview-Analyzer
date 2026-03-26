import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  CheckCircle,
  Activity,
  Brain,
  Code2,
  FileText,
  BarChart3,
  Target,
  Sparkles,
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import api from "../api/axios";
import { PrimaryButton, GhostButton } from "../components/Buttons";

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

function HeaderChip({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5">
      <span className="text-[11px] font-mono uppercase tracking-widest text-white/45">
        {children}
      </span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, trend }) {
  return (
    <Surface className="p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
          <Icon className="h-4 w-4 text-white/70" />
        </div>

        {trend && (
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/55">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>

      <p className="text-[11px] uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-white/38">{sub}</p>}
    </Surface>
  );
}

function ScoreBar({ value, max = 10 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full bg-gradient-to-r from-violet-300/80 to-sky-300/80"
      />
    </div>
  );
}

function SessionRow({ session, onView, onResume }) {
  const score =
    session.total_score != null ? Number(session.total_score) : null;
  const date = session.created_at
    ? new Date(session.created_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    : "—";

  const typeIcon =
    { domain: Brain, coding: Code2, resume: FileText }[
      session.interview_type
    ] || Activity;

  const TypeIcon = typeIcon;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05]">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
        <TypeIcon className="h-4 w-4 text-white/70" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold capitalize text-white/82">
          {session.interview_type || "Interview"}{" "}
          <span className="font-mono text-[10px] text-white/30">
            #{session.session_id?.slice(-6)}
          </span>
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-white/30">{date}</p>
      </div>

      <div className="min-w-[92px] flex-shrink-0 text-right">
        {session.is_completed && score != null ? (
          <div>
            <p className="mb-1 text-sm font-bold leading-none text-white">
              {score.toFixed(1)}
              <span className="text-[10px] text-white/30">/10</span>
            </p>
            <ScoreBar value={score} />
          </div>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] text-white/55">
            In Progress
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {!session.is_completed ? (
          <GhostButton onClick={() => onResume?.(session)}>Resume</GhostButton>
        ) : (
          <GhostButton onClick={() => onView?.(session)}>View</GhostButton>
        )}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition hover:border-white/[0.14] hover:bg-white/[0.05]"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
        <Icon className="h-4 w-4 text-white/70" />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/40">{desc}</p>
    </button>
  );
}

function TinyMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [userName, setUserName] = useState("");

  const forceLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    (async () => {
      try {
        const [meRes, sessionsRes] = await Promise.all([
          api.get("/auth/me").catch(() => null),
          api.get("/interviews/my"),
        ]);

        if (meRes?.data?.name) setUserName(meRes.data.name);
        setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
      } catch (e) {
        if (e?.response?.status === 401) forceLogout();
        else setMsg(e?.response?.data?.detail || "Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((s) => s.is_completed).length;
    const scores = sessions
      .filter((s) => s.is_completed && s.total_score != null)
      .map((s) => Number(s.total_score));

    const avgScore = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "—";

    const best = scores.length ? Math.max(...scores).toFixed(1) : "—";

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(0) : "0";

    return { total, completed, avgScore, best, completionRate };
  }, [sessions]);

  const recent = useMemo(() => [...sessions].reverse().slice(0, 6), [sessions]);
  const active = useMemo(() => sessions.find((s) => !s.is_completed), [sessions]);

  const topModes = useMemo(() => {
    const counts = { domain: 0, resume: 0, coding: 0 };

    sessions.forEach((s) => {
      const key = s.interview_type;
      if (counts[key] != null) counts[key] += 1;
    });

    return [
      { label: "Domain", value: counts.domain },
      { label: "Resume", value: counts.resume },
      { label: "Coding", value: counts.coding },
    ];
  }, [sessions]);

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <HeaderChip>Dashboard</HeaderChip>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white">
              {userName ? `Welcome back, ${userName}` : "Your Progress"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/42 sm:text-base">
              Track your sessions, monitor scores, and continue interview
              practice from one workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => navigate("/interview")}>
              Start Interview
            </PrimaryButton>
            <GhostButton onClick={() => navigate("/analytics")}>
              View Analytics
            </GhostButton>
          </div>
        </div>

        {active && (
          <div className="mb-6">
            <Surface className="relative overflow-hidden px-5 py-4">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-300/80 to-sky-300/80" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <Clock3 className="h-4 w-4 text-white/70" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Session in progress
                    </p>
                    <p className="mt-1 text-xs text-white/42">
                      {active.interview_type} · #{active.session_id?.slice(-6)}
                    </p>
                  </div>
                </div>

                <PrimaryButton
                  onClick={() =>
                    navigate(
                      `/interview/domain?session_id=${encodeURIComponent(
                        active.session_id
                      )}`
                    )
                  }
                >
                  Resume Session
                </PrimaryButton>
              </div>
            </Surface>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Activity}
            label="Total Sessions"
            value={loading ? "…" : stats.total}
            sub="All recorded interview attempts"
            trend="+"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={loading ? "…" : stats.completed}
            sub={`${stats.completionRate}% completion rate`}
          />
          <StatCard
            icon={TrendingUp}
            label="Average Score"
            value={loading ? "…" : stats.avgScore}
            sub="Average across completed sessions"
          />
          <StatCard
            icon={Target}
            label="Best Score"
            value={loading ? "…" : stats.best}
            sub="Your strongest recorded performance"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <Surface className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">
                    Recent Activity
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    Session History
                  </h2>
                </div>

                <GhostButton onClick={() => navigate("/analytics")}>
                  View All
                </GhostButton>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-2xl bg-white/[0.03]"
                    />
                  ))}
                </div>
              ) : msg ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65">
                  {msg}
                </div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <Sparkles className="h-6 w-6 text-white/70" />
                  </div>
                  <p className="text-sm font-semibold text-white/65">
                    No sessions yet
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    Start an interview to see your history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((s) => (
                    <SessionRow
                      key={s.session_id}
                      session={s}
                      onView={() =>
                        navigate(
                          `/insights?session_id=${encodeURIComponent(s.session_id)}`
                        )
                      }
                      onResume={() =>
                        navigate(
                          `/interview/domain?session_id=${encodeURIComponent(
                            s.session_id
                          )}`
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </Surface>

            <Surface className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">
                    Quick Actions
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    Start a New Practice Round
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <QuickAction
                  icon={Brain}
                  title="Domain Interview"
                  desc="Pick a topic and begin guided practice."
                  onClick={() => navigate("/interview/domain")}
                />
                <QuickAction
                  icon={FileText}
                  title="Resume Interview"
                  desc="Practice based on projects and experience."
                  onClick={() => navigate("/interview/resume")}
                />
                <QuickAction
                  icon={Code2}
                  title="Coding Interview"
                  desc="Solve coding problems in a focused workspace."
                  onClick={() => navigate("/interview/coding")}
                />
              </div>
            </Surface>
          </div>

          <div className="space-y-6">
            <Surface className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">
                    Performance Snapshot
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    Quick Metrics
                  </h2>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/35" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-white/48">Average Score</span>
                    <span className="font-semibold text-white">
                      {stats.avgScore === "—" ? "0.0" : stats.avgScore}
                    </span>
                  </div>
                  <ScoreBar
                    value={stats.avgScore === "—" ? 0 : parseFloat(stats.avgScore)}
                    max={10}
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-white/48">Completion Rate</span>
                    <span className="font-semibold text-white">
                      {stats.completionRate}%
                    </span>
                  </div>
                  <ScoreBar value={Number(stats.completionRate)} max={100} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <TinyMetric label="Completed" value={stats.completed} />
                <TinyMetric label="Best Score" value={stats.best} />
              </div>
            </Surface>

            <Surface className="p-6">
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">
                  Interview Modes
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Usage Overview
                </h2>
              </div>

              <div className="space-y-4">
                {topModes.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-white/48">{item.label}</span>
                      <span className="font-semibold text-white">
                        {item.value}
                      </span>
                    </div>
                    <ScoreBar
                      value={item.value}
                      max={Math.max(1, ...topModes.map((m) => m.value))}
                    />
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </div>

    </div>
  );
}