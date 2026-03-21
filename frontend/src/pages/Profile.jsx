import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/68 backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
      {children}
    </div>
  );
}

function PremiumSurface({ children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_30%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function StatCard({ label, value, sub, accent = "violet" }) {
  const accentGlow =
    accent === "violet"
      ? "from-violet-400/25"
      : accent === "blue"
      ? "from-sky-400/25"
      : accent === "emerald"
      ? "from-emerald-400/25"
      : "from-white/18";

  return (
    <PremiumSurface className="p-5">
      <div
        className={`absolute -top-12 right-0 h-28 w-28 rounded-full bg-gradient-to-b ${accentGlow} to-transparent blur-3xl`}
      />
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs text-white/40">{sub}</p> : null}
    </PremiumSurface>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 break-all text-base font-medium text-white">
        {value || "—"}
      </p>
    </div>
  );
}

function ProgressBar({ value, max = 10 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-300/80 via-fuchsia-300/80 to-sky-300/80"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Avatar({ src, name, size = "lg" }) {
  const dims =
    size === "lg"
      ? "h-28 w-28 sm:h-32 sm:w-32"
      : "h-12 w-12";

  const initials = (name || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative ${dims} overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_12px_40px_rgba(0,0,0,0.35)]`}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Profile"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)] text-3xl font-semibold tracking-[0.12em] text-white">
          {initials}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const [me, setMe] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarMsg, setAvatarMsg] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("sia-profile-avatar");
    if (saved) setAvatarUrl(saved);
  }, []);

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

  const handleAvatarPick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarMsg("Please choose an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setAvatarMsg("Please use an image under 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setAvatarUrl(result);
      localStorage.setItem("sia-profile-avatar", result);
      setAvatarMsg("Profile photo updated on this device.");
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarUrl("");
    localStorage.removeItem("sia-profile-avatar");
    setAvatarMsg("Profile photo removed.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const bestDomain = insights?.best_domain || "—";
  const avgAnswerScore = Number(insights?.average_answer_score ?? 0).toFixed(2);
  const avgTotalScore = Number(analytics?.average_total_score ?? 0).toFixed(2);
  const avgWpm = Number(
    insights?.communication_metrics?.avg_words_per_minute ?? 0
  ).toFixed(2);
  const avgCommScore = Number(
    insights?.communication_metrics?.avg_communication_score ?? 0
  ).toFixed(2);

  const domainList = useMemo(() => {
    const domains = insights?.domains || {};
    return Object.entries(domains).sort((a, b) => Number(b[1]) - Number(a[1]));
  }, [insights]);

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-7xl space-y-6"
      >
        <PremiumSurface className="overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <Avatar src={avatarUrl} name={me?.full_name} />
              </div>

              <div className="min-w-0 flex-1">
                <SectionLabel>User profile</SectionLabel>

                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {me?.full_name || "Profile"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                  Your personal account, interview performance snapshot, and
                  communication overview in one place.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                    {me?.email || "No email"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                    {me?.is_active ? "Active account" : "Inactive account"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                    Best domain: {bestDomain}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleAvatarPick}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.03]"
                  >
                    {avatarUrl ? "Change Photo" : "Add Photo"}
                  </button>

                  {avatarUrl ? (
                    <button
                      onClick={removeAvatar}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                    >
                      Remove Photo
                    </button>
                  ) : null}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {avatarMsg ? (
                  <p className="mt-3 text-sm text-white/55">{avatarMsg}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard label="Full Name" value={me?.full_name || "Not set"} />
              <InfoCard label="Email" value={me?.email || "—"} />
              <InfoCard
                label="Account Status"
                value={me?.is_active ? "Active" : "Inactive"}
              />
              <InfoCard label="Best Domain" value={bestDomain} />
            </div>
          </div>
        </PremiumSurface>

        {msg ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {msg}
          </div>
        ) : null}

        {loading ? (
          <PremiumSurface className="p-6 text-white/70">
            Loading profile...
          </PremiumSurface>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Sessions"
                value={analytics?.total_sessions ?? 0}
                sub="All interviews taken"
                accent="violet"
              />
              <StatCard
                label="Completed"
                value={analytics?.completed_sessions ?? 0}
                sub="Finished interviews"
                accent="emerald"
              />
              <StatCard
                label="Avg Total Score"
                value={avgTotalScore}
                sub="Per session"
                accent="blue"
              />
              <StatCard
                label="Avg Answer Score"
                value={`${avgAnswerScore} / 10`}
                sub="Across answers"
                accent="white"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
              <PremiumSurface className="p-6 sm:p-8">
                <SectionLabel>Communication</SectionLabel>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                  Speaking and delivery snapshot
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Avg Words / Min
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {avgWpm}
                    </p>
                    <ProgressBar value={Number(avgWpm)} max={200} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Avg Comm Score
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {avgCommScore} / 10
                    </p>
                    <ProgressBar value={Number(avgCommScore)} max={10} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Total Fillers
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {insights?.communication_metrics?.total_filler_count ?? 0}
                    </p>
                    <p className="mt-2 text-xs text-white/40">
                      um, uh, like...
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Total Pauses
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {insights?.communication_metrics?.total_pause_count ?? 0}
                    </p>
                    <p className="mt-2 text-xs text-white/40">
                      Estimated pauses
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                    Communication Insight
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/82">
                    {insights?.communication_analysis ||
                      "No communication insight yet."}
                  </p>
                </div>
              </PremiumSurface>

              <PremiumSurface className="p-6 sm:p-8">
                <SectionLabel>Coaching</SectionLabel>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                  Your improvement summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Overall Performance
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/82">
                      {insights?.overall_performance || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Consistency
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/82">
                      {insights?.consistency_analysis || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                      Next Step
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/82">
                      {insights?.next_step_suggestion || "—"}
                    </p>
                  </div>
                </div>
              </PremiumSurface>
            </div>

            <PremiumSurface className="p-6 sm:p-8">
              <SectionLabel>Domain activity</SectionLabel>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                Where your practice is happening
              </h2>

              {domainList.length > 0 ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {domainList.map(([domain, count]) => (
                    <div
                      key={domain}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold uppercase tracking-wide text-white">
                          {domain}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/80">
                          {count}
                        </span>
                      </div>
                      <ProgressBar
                        value={Number(count)}
                        max={Math.max(...domainList.map(([, c]) => Number(c)), 1)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-white/65">No domain activity yet.</p>
              )}
            </PremiumSurface>
          </>
        )}
      </motion.div>
    </div>
  );
}