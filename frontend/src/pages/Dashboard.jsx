import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  // delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  // ✅ if auth fails, just go login
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

  // ✅ Keep backend ordering (it already returns newest first)
  // Only do a fallback stable sort if you ever add "created_at" etc.
  const orderedSessions = useMemo(() => {
    const arr = [...(sessions || [])];

    // If backend already sorted desc by id, keep it as-is.
    // If you later add created_at, you can sort by that.
    // For now: no forced sort (prevents “order changing” confusion).
    return arr;
  }, [sessions]);

  const openDelete = (session) => setDeleteTarget(session);
  const closeDelete = () => setDeleteTarget(null);

  const deleteSession = async () => {
    if (!deleteTarget?.session_id) return;

    setMsg("");
    setDeletingId(deleteTarget.session_id);

    try {
      await api.delete(`/interviews/${encodeURIComponent(deleteTarget.session_id)}`);
      closeDelete();
      await loadSessions();
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(e?.response?.data?.detail || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top header / hero */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-white/65 text-sm">
              {loadingMe
                ? "Loading profile..."
                : `Logged in as ${me?.email || "—"}`}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => nav("/interview")}
              className="px-6 py-2 rounded-xl bg-white text-black font-medium hover:scale-[1.04] transition"
            >
              Start Interview
            </button>
          </div>
        </div>

        {/* Tiny helper row */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            Sessions:{" "}
            <span className="text-white/80">{orderedSessions.length}</span>
          </span>
          <span className="hidden sm:inline text-white/25">•</span>
          <span className="text-white/55">
            Use “Continue” to resume unfinished interviews.
          </span>
        </div>
      </div>

      {/* Sessions header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold">Your sessions</h2>
        <GhostButton onClick={loadSessions}>Refresh</GhostButton>
      </div>

      {msg ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {msg}
        </div>
      ) : null}

      {/* Sessions list */}
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
                  {/* Left */}
                  <div className="min-w-[260px]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-semibold uppercase tracking-wide">
                        {s.domain}
                      </span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/75">{s.difficulty}</span>
                      <StatusPill done={isDone} />
                    </div>

                    <p className="mt-2 text-sm text-white/65 break-all">
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

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 justify-end">
                    <Link
                      to={`/insights?session_id=${encodeURIComponent(sid)}`}
                      className="px-4 py-2 rounded-xl text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
                    >
                      Insights
                    </Link>

                    <Link
                      to={`/analytics?session_id=${encodeURIComponent(sid)}`}
                      className="px-4 py-2 rounded-xl text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
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
                      onClick={() => openDelete(s)}
                      disabled={deletingId === sid}
                      className="px-4 py-2 rounded-xl text-sm border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
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

      {/* Delete modal */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={deletingId ? undefined : closeDelete}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-xl font-semibold">Delete session?</h3>
            <p className="mt-2 text-white/70 text-sm">
              This will delete the interview session and all its answers.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
              <p className="text-white/70 break-all">
                Session:{" "}
                <span className="text-white/90">
                  {deleteTarget.session_id}
                </span>
              </p>
              <p className="text-white/70 mt-1">
                {String(deleteTarget.domain || "").toUpperCase()} •{" "}
                {deleteTarget.difficulty}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <GhostButton onClick={closeDelete} disabled={!!deletingId}>
                Cancel
              </GhostButton>
              <button
                onClick={deleteSession}
                disabled={!!deletingId}
                className="px-4 py-2 rounded-xl text-sm border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
              >
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}