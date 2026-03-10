import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-white/60 text-sm">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {sub ? <p className="mt-1 text-xs text-white/50">{sub}</p> : null}
    </div>
  );
}

export default function Profile() {
  const [me, setMe] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");

      try {
        const [meRes, analyticsRes, insightsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/analytics"),
          api.get("/insights"),
        ]);

        setMe(meRes.data);
        setAnalytics(analyticsRes.data);
        setInsights(insightsRes.data);
      } catch (e) {
        setMsg(e?.response?.data?.detail || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-5xl"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Profile</h1>
              <p className="mt-2 text-white/65">
                Your interview account and performance summary
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70">
              Smart Interview Analyzer
            </div>
          </div>
        </div>

        {msg ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {msg}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Loading profile...
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Account</h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/60">Full Name</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {me?.full_name || "Not set"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/60">Email</p>
                  <p className="mt-1 break-all text-lg font-medium text-white">
                    {me?.email || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/60">Account Status</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {me?.is_active ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/60">Best Domain</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {insights?.best_domain || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Performance Snapshot</h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total Sessions"
                  value={analytics?.total_sessions ?? 0}
                  sub="All interviews taken"
                />
                <StatCard
                  label="Completed"
                  value={analytics?.completed_sessions ?? 0}
                  sub="Finished interviews"
                />
                <StatCard
                  label="Avg Total Score"
                  value={Number(analytics?.average_total_score ?? 0).toFixed(2)}
                  sub="Per session"
                />
                <StatCard
                  label="Avg Answer Score"
                  value={`${Number(insights?.average_answer_score ?? 0).toFixed(2)} / 10`}
                  sub="Across answers"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Communication</h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Avg Words / Min"
                    value={Number(
                      insights?.communication_metrics?.avg_words_per_minute ?? 0
                    ).toFixed(2)}
                    sub="Speaking pace"
                  />
                  <StatCard
                    label="Avg Comm Score"
                    value={`${Number(
                      insights?.communication_metrics?.avg_communication_score ?? 0
                    ).toFixed(2)} / 10`}
                    sub="Delivery quality"
                  />
                  <StatCard
                    label="Total Fillers"
                    value={insights?.communication_metrics?.total_filler_count ?? 0}
                    sub="um, uh, like..."
                  />
                  <StatCard
                    label="Total Pauses"
                    value={insights?.communication_metrics?.total_pause_count ?? 0}
                    sub="Estimated pauses"
                  />
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/60">Communication Insight</p>
                  <p className="mt-2 text-white/85">
                    {insights?.communication_analysis || "No communication insight yet."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Coaching Summary</h2>

                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white/60">Overall Performance</p>
                    <p className="mt-2 text-white/90">
                      {insights?.overall_performance || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white/60">Consistency</p>
                    <p className="mt-2 text-white/90">
                      {insights?.consistency_analysis || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm text-white/60">Next Step</p>
                    <p className="mt-2 text-white/90">
                      {insights?.next_step_suggestion || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Domain Activity</h2>

              {insights?.domains && Object.keys(insights.domains).length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(insights.domains).map(([domain, count]) => (
                    <div
                      key={domain}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4"
                    >
                      <span className="uppercase tracking-wide text-white/90">
                        {domain}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-white/65">No domain activity yet.</p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}