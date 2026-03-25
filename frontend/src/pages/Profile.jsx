import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import Footer from "../components/Footer";

function GlassCard({ children, className = "", accent }) {
  const [g, setG] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      whileHover={{ y: -2 }} transition={{ duration: 0.18 }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
      className={["group relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-gradient-to-b from-white/[0.055] to-white/[0.018] backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.28)]", className].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      {accent && <div className="absolute -top-12 right-4 h-28 w-28 rounded-full blur-3xl opacity-50" style={{ background: `radial-gradient(circle, ${accent}55, transparent)` }} />}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(380px circle at ${g.x}% ${g.y}%, rgba(109,95,255,0.09), transparent 40%)` }} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, accent = "#6d5fff" }) {
  return (
    <GlassCard className="p-5" accent={accent}>
      <p className="text-[10px] uppercase tracking-widest text-white/38 font-mono mb-4">{label}</p>
      <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      {sub && <p className="mt-2 text-[12px] text-white/38">{sub}</p>}
    </GlassCard>
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

function Avatar({ src, name, size = "lg" }) {
  const initials = (name || "U").split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const dims = size === "lg" ? "w-28 h-28 sm:w-32 sm:h-32" : "w-12 h-12";
  return (
    <div
      className={`relative ${dims} rounded-[24px] overflow-hidden flex-shrink-0`}
      style={{ border: "1px solid rgba(255,255,255,0.12)", background: "linear-gradient(180deg,rgba(109,95,255,0.2),rgba(0,229,204,0.1))", boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>
          {initials}
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-widest text-white/38 font-mono mb-2">{label}</p>
      <p className="text-[14px] font-semibold text-white break-all">{value || "—"}</p>
    </div>
  );
}

function CommMetric({ label, value, max, sub }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-widest text-white/38 font-mono mb-2">{label}</p>
      <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      {max && <ProgressBar value={Number(value)} max={max} />}
      {sub && <p className="text-[11px] text-white/30 mt-2">{sub}</p>}
    </div>
  );
}

export default function Profile() {
  const [me, setMe] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("sia-profile-avatar") || "");
  const [avatarMsg, setAvatarMsg] = useState("");
  const fileInputRef = useRef(null);

  const forceLogout = () => { localStorage.removeItem("token"); window.location.href = "/login"; };

  useEffect(() => {
    (async () => {
      try {
        const [meR, anaR, insR] = await Promise.all([
          api.get("/auth/me"),
          api.get("/analytics").catch(() => ({ data: null })),
          api.get("/insights").catch(() => ({ data: null })),
        ]);
        setMe(meR.data);
        setAnalytics(anaR.data);
        setInsights(insR.data);
      } catch (e) {
        if (e?.response?.status === 401) forceLogout();
        else setMsg(e?.response?.data?.detail || "Failed to load profile");
      } finally { setLoading(false); }
    })();
  }, []);

  const handleAvatarPick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setAvatarMsg("Please use an image under 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setAvatarUrl(result);
      localStorage.setItem("sia-profile-avatar", result);
      setAvatarMsg("Profile photo updated.");
    };
    reader.readAsDataURL(file);
  };
  const removeAvatar = () => {
    setAvatarUrl(""); localStorage.removeItem("sia-profile-avatar");
    setAvatarMsg("Profile photo removed.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const bestDomain = insights?.best_domain || "—";
  const avgAnswerScore = Number(insights?.average_answer_score ?? 0).toFixed(2);
  const avgTotalScore = Number(analytics?.average_total_score ?? 0).toFixed(2);
  const avgWpm = Number(insights?.communication_metrics?.avg_words_per_minute ?? 0).toFixed(1);
  const avgCommScore = Number(insights?.communication_metrics?.avg_communication_score ?? 0).toFixed(2);

  const domainList = useMemo(() => {
    const d = insights?.domains || {};
    return Object.entries(d).sort((a, b) => Number(b[1]) - Number(a[1]));
  }, [insights]);

  return (
    <div className="space-y-6 py-2">
      {/* ── Profile Header ──────────────────────────────── */}
      <GlassCard className="overflow-hidden p-7 sm:p-9">
        <div className="absolute -right-12 top-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(109,95,255,0.18),transparent)", filter: "blur(40px)" }} />
        <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,229,204,0.12),transparent)", filter: "blur(40px)" }} />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="shrink-0">
              <Avatar src={avatarUrl} name={me?.full_name} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="section-eyebrow mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6d5fff]" />
                User Profile
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[0.94] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {me?.full_name || "Your Profile"}
              </h1>
              <p className="text-sm leading-7 text-white/48 mb-5 max-w-md">
                Your account, interview performance snapshot, and communication overview in one place.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {[me?.email, me?.is_active ? "Active account" : "Inactive", `Best: ${bestDomain}`].filter(Boolean).map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-white/45 font-mono">{t}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button onClick={handleAvatarPick} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-white btn-shimmer"
                  style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }}>
                  {avatarUrl ? "Change Photo" : "Add Photo"}
                </motion.button>
                {avatarUrl && (
                  <motion.button onClick={removeAvatar} whileHover={{ scale: 1.02 }}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white/70 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    Remove
                  </motion.button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              {avatarMsg && <p className="mt-3 text-[12px] text-white/45">{avatarMsg}</p>}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard label="Full Name" value={me?.full_name} />
            <InfoCard label="Email" value={me?.email} />
            <InfoCard label="Account Status" value={me?.is_active ? "Active" : "Inactive"} />
            <InfoCard label="Best Domain" value={bestDomain} />
          </div>
        </div>
      </GlassCard>

      {msg && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{msg}</div>}

      {loading ? (
        <GlassCard className="p-10 text-center">
          <div className="flex items-center justify-center gap-3 text-white/40 text-sm">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            Loading profile data…
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Sessions" value={analytics?.total_sessions ?? 0} sub="All interviews" accent="#6d5fff" />
            <StatCard label="Completed" value={analytics?.completed_sessions ?? 0} sub="Finished interviews" accent="#00e5cc" />
            <StatCard label="Avg Total Score" value={avgTotalScore} sub="Per session" accent="#a78bfa" />
            <StatCard label="Avg Answer Score" value={`${avgAnswerScore}/10`} sub="Across answers" accent="#ff4d88" />
          </div>

          {/* Communication + Coaching */}
          <div className="grid gap-5 lg:grid-cols-2">
            <GlassCard className="p-6 sm:p-7">
              <div className="section-eyebrow mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc]" />
                Communication
              </div>
              <h2 className="text-2xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>Speaking & delivery snapshot</h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <CommMetric label="Avg Words/Min" value={avgWpm} max={200} />
                <CommMetric label="Avg Comm Score" value={`${avgCommScore}/10`} max={10} />
                <CommMetric label="Total Fillers" value={insights?.communication_metrics?.total_filler_count ?? 0} sub="um, uh, like…" />
                <CommMetric label="Total Pauses" value={insights?.communication_metrics?.total_pause_count ?? 0} sub="Estimated pauses" />
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-2">Communication Insight</p>
                <p className="text-sm leading-7 text-white/70">{insights?.communication_analysis || "No communication insight yet."}</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 sm:p-7">
              <div className="section-eyebrow mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6d5fff]" />
                Coaching
              </div>
              <h2 className="text-2xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>Your improvement summary</h2>
              <div className="space-y-3">
                {[
                  { label: "Overall Performance", value: insights?.overall_performance },
                  { label: "Consistency", value: insights?.consistency_analysis },
                  { label: "Next Step", value: insights?.next_step_suggestion },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-2">{label}</p>
                    <p className="text-sm leading-7 text-white/70">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Domain Activity */}
          <GlassCard className="p-6 sm:p-8">
            <div className="section-eyebrow mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]" />
              Domain Activity
            </div>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>Where your practice is happening</h2>
            {domainList.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {domainList.map(([domain, count]) => (
                  <div key={domain} className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-sm font-bold uppercase tracking-wide text-white">{domain}</span>
                      <span className="px-2.5 py-1 rounded-full border border-white/[0.1] bg-white/[0.06] text-[11px] text-white/70 font-mono">{count}</span>
                    </div>
                    <ProgressBar value={Number(count)} max={Math.max(...domainList.map(([, c]) => Number(c)), 1)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No domain activity yet. Start an interview to build history.</p>
            )}
          </GlassCard>
        </>
      )}

      <Footer />
    </div>
  );
}
