import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function Analytics() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const sessionId = sp.get("session_id") || "";

  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setMsg("Missing session_id. Go from Dashboard → Analytics.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setMsg("");
      try {
        const res = await api.get(`/analytics/${encodeURIComponent(sessionId)}`);
        setData(res.data);
      } catch (e) {
        setMsg(e?.response?.data?.detail || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="mt-2 text-white/70">
              Session: <span className="text-white/90">{sessionId || "—"}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => nav(-1)}
              className="border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition"
            >
              Back
            </button>

            {sessionId ? (
              <Link
                to={`/insights?session_id=${encodeURIComponent(sessionId)}`}
                className="bg-white text-black px-4 py-2 rounded-xl font-medium hover:scale-[1.02] transition"
              >
                Insights
              </Link>
            ) : null}
          </div>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Loading analytics...
          </div>
        ) : !data ? null : (
          <div className="mt-6 grid gap-4">
            {/* You can later replace this with charts */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">JSON Output</h2>
              <p className="text-white/60 text-sm mt-1">
                (We’ll convert this into charts next.)
              </p>

              <pre className="mt-4 text-xs bg-black/40 p-4 rounded-xl overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}