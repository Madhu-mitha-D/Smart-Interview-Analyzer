import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function Dashboard() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const logout = () => {
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
        logout();
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
      if (status === 401) return logout();
      setMsg(e?.response?.data?.detail || "Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteSession = async (sessionId) => {
    const ok = confirm("Delete this interview session? This will remove its answers too.");
    if (!ok) return;

    setMsg("");
    setDeletingId(sessionId);
    try {
      await api.delete(`/interviews/${encodeURIComponent(sessionId)}`);
      await loadSessions();
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) return logout();
      setMsg(e?.response?.data?.detail || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-white/70">
              {loadingMe ? "Loading profile..." : `Logged in as ${me?.email || "—"}`}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => nav("/interview")}
              className="bg-white text-black px-5 py-2 rounded-xl font-medium hover:scale-[1.02] transition"
            >
              Start Interview
            </button>
            <button
              onClick={logout}
              className="border border-white/20 px-5 py-2 rounded-xl hover:bg-white/10 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Sessions header */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your sessions</h2>
          <button
            onClick={loadSessions}
            className="text-sm border border-white/15 px-4 py-2 rounded-xl hover:bg-white/10 transition"
          >
            Refresh
          </button>
        </div>

        {msg && <p className="mt-3 text-red-400">{msg}</p>}

        {/* Sessions list */}
        <div className="mt-4 grid gap-4">
          {loadingSessions ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No sessions yet. Click <span className="text-white">Start Interview</span>.
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.session_id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Left content */}
                  <div className="min-w-[240px]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-semibold uppercase">{s.domain}</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/80">{s.difficulty}</span>

                      {s.is_completed ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
                          In progress
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-white/70">
                      Session: <span className="text-white/80">{s.session_id}</span>
                    </p>

                    <p className="mt-1 text-sm text-white/70">
                      Score: <span className="text-white">{s.total_score ?? 0}</span>{" "}
                      {s.verdict ? (
                        <>
                          | Verdict: <span className="text-white">{s.verdict}</span>
                        </>
                      ) : null}
                    </p>
                  </div>

                  {/* Right actions (fixed order) */}
                  <div className="flex flex-wrap gap-3 justify-end">
                    <Link
                      to={`/insights?session_id=${encodeURIComponent(s.session_id)}`}
                      className="border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition text-sm"
                    >
                      View Insights
                    </Link>

                    <Link
                      to={`/analytics?session_id=${encodeURIComponent(s.session_id)}`}
                      className="border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition text-sm"
                    >
                      Analytics
                    </Link>

                    {!s.is_completed ? (
                      <button
                        onClick={() =>
                          nav(`/interview?session_id=${encodeURIComponent(s.session_id)}`)
                        }
                        className="bg-white text-black px-4 py-2 rounded-xl hover:scale-[1.02] transition text-sm"
                      >
                        Continue
                      </button>
                    ) : (
                      // keeps spacing/order stable even when completed
                      <span className="hidden sm:inline-block w-[92px]" />
                    )}

                    <button
                      onClick={() => deleteSession(s.session_id)}
                      disabled={deletingId === s.session_id}
                      className="border border-red-500/30 text-red-200 px-4 py-2 rounded-xl hover:bg-red-500/10 transition text-sm disabled:opacity-60"
                    >
                      {deletingId === s.session_id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}