import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import api from "../api/axios";

function StatusPill({ done }) {
  return done ? (
    <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300">
      Completed
    </span>
  ) : (
    <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
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
        "px-4 py-2 rounded-xl text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition",
        disabled ? "opacity-60 cursor-not-allowed hover:bg-white/5" : "",
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
        "px-5 py-2 rounded-xl text-sm font-medium transition",
        disabled
          ? "border border-white/10 bg-white/5 text-white/40 cursor-not-allowed"
          : "bg-white text-black hover:scale-[1.03]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
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

  const orderedSessions = useMemo(() => {
    return [...(sessions || [])];
  }, [sessions]);

  const openDelete = (session) => setDeleteTarget(session);
  const closeDelete = () => {
    if (deletingId) return;
    setDeleteTarget(null);
  };

  const deleteSession = async () => {
    console.log("deleteSession called", deleteTarget);

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
      console.log("delete error", e);
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
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeDelete}
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white">Delete session?</h3>
            <p className="mt-2 text-sm text-white/70">
              This will delete the interview session and all its answers.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
              <p className="break-all text-white/70">
                Session:{" "}
                <span className="text-white/90">{deleteTarget.session_id}</span>
              </p>
              <p className="mt-1 text-white/70">
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
                onClick={() => {
                  console.log("confirm delete clicked");
                  deleteSession();
                }}
                disabled={!!deletingId}
                className="px-4 py-2 rounded-xl text-sm border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
              >
                {deletingId ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-6 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-white/65">
                {loadingMe
                  ? "Loading profile..."
                  : `Logged in as ${me?.email || "—"}`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => nav("/interview")}
                className="rounded-xl bg-white px-6 py-2 font-medium text-black transition hover:scale-[1.04]"
              >
                Start Interview
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              Sessions:{" "}
              <span className="text-white/80">{orderedSessions.length}</span>
            </span>
            <span className="hidden text-white/25 sm:inline">•</span>
            <span className="text-white/55">
              Use “Continue” to resume unfinished interviews.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold sm:text-2xl">Your sessions</h2>
          <GhostButton onClick={loadSessions}>Refresh</GhostButton>
        </div>

        {msg ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {msg}
          </div>
        ) : null}

        <div className="grid gap-4">
          {loadingSessions ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Loading sessions...
            </div>
          ) : orderedSessions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No sessions yet. Click{" "}
              <span className="text-white">Start Interview</span>.
            </div>
          ) : (
            orderedSessions.map((s) => {
              const sid = s.session_id;
              const isDone = !!s.is_completed;

              return (
                <div
                  key={sid}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-[260px]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-semibold uppercase tracking-wide">
                          {s.domain}
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/75">{s.difficulty}</span>
                        <StatusPill done={isDone} />
                      </div>

                      <p className="mt-2 break-all text-sm text-white/65">
                        Session: <span className="text-white/80">{sid}</span>
                      </p>

                      <p className="mt-1 text-sm text-white/65">
                        Score:{" "}
                        <span className="text-white">{s.total_score ?? 0}</span>{" "}
                        {s.verdict ? (
                          <>
                            | Verdict:{" "}
                            <span className="text-white">{s.verdict}</span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      <Link
                        to={`/insights?session_id=${encodeURIComponent(sid)}`}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                      >
                        Insights
                      </Link>

                      <Link
                        to={`/analytics?session_id=${encodeURIComponent(sid)}`}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
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
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                      >
                        {deletingId === sid ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {deleteModal}
    </>
  );
}