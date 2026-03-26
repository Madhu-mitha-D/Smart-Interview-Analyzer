import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import Footer from "../components/Footer";
import {
  User, Mail, Calendar, TrendingUp, MessageSquare,
  Mic, BarChart3, Camera, LogOut, AlertCircle, CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── GlassCard ───────────────────────────────────────────────── */
function GlassCard({ children, className = "", accent }) {
  const [g, setG] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className={`group relative overflow-hidden rounded-[24px] border border-white/[0.09] transition-all duration-300 hover:border-white/[0.14] ${className}`}
      style={{
        background: "linear-gradient(180deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.018) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      {accent && (
        <div
          className="absolute -top-10 -right-8 w-28 h-28 rounded-full opacity-35 pointer-events-none"
          style={{ background: `radial-gradient(circle,${accent}55,transparent)`, filter: "blur(24px)" }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(300px circle at ${g.x}% ${g.y}%, rgba(109,95,255,0.07), transparent 50%)` }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ── Progress bar ────────────────────────────────────────────── */
function Bar({ value, max = 10 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden mt-2">
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

/* ── Stat tile ───────────────────────────────────────────────── */
function StatTile({ label, value, sub, accent = "#6d5fff", max }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
      <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      {max != null && <Bar value={typeof value === "string" ? parseFloat(value) || 0 : value} max={max} />}
    </div>
  );
}

/* ── Info row ────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, accent = "#6d5fff" }) {
  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-white/[0.05] last:border-0">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}15`, border: `1px solid ${accent}28` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest">{label}</p>
        <p className="text-[13.5px] font-semibold text-white truncate mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────── */
function Avatar({ src, name, size = 120 }) {
  const initials = (name || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="relative rounded-[22px] overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{
        width: size, height: size,
        background: "linear-gradient(180deg,rgba(109,95,255,0.2),rgba(0,229,204,0.1))",
        border: "1.5px solid rgba(255,255,255,0.12)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span
          className="text-3xl font-extrabold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Profile() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [me, setMe]           = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("sia-profile-avatar") || "");
  const [avatarMsg, setAvatarMsg] = useState("");

  const forceLogout = () => { localStorage.removeItem("token"); navigate("/login", { replace: true }); };

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          api.get("/auth/me"),
          api.get("/analytics").catch(() => ({ data: null })),
          api.get("/insights").catch(() => ({ data: null })),
        ]);
        setMe(r1.data);
        setAnalytics(r2.data);
        setInsights(r3.data);
      } catch (e) {
        if (e?.response?.status === 401) forceLogout();
        else setMsg(e?.response?.data?.detail || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarMsg("Max 2 MB."); return; }
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    localStorage.setItem("sia-profile-avatar", url);
    setAvatarMsg("Avatar updated!");
    setTimeout(() => setAvatarMsg(""), 2500);
  };

  // Derived metrics
  const avgAnswerScore = Number(insights?.average_answer_score ?? 0).toFixed(2);
  const avgTotalScore  = Number(analytics?.average_total_score ?? 0).toFixed(2);
  const avgWpm         = Number(insights?.communication_metrics?.avg_words_per_minute ?? 0).toFixed(1);
  const avgCommScore   = Number(insights?.communication_metrics?.avg_communication_score ?? 0).toFixed(2);

  const joinDate = me?.created_at
    ? new Date(me.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-mono text-white/45 uppercase tracking-widest">Profile</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            Your Account
          </h1>
        </motion.div>

        {/* Error */}
        {msg && (
          <div className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08]">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-[13px] text-red-300">{msg}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-5">
            <div className="h-48 rounded-[24px] bg-white/[0.04] animate-pulse" />
            <div className="grid sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-[24px] bg-white/[0.04] animate-pulse" />)}
            </div>
          </div>
        ) : me ? (
          <div className="space-y-6">

            {/* Profile hero card */}
            <GlassCard className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar src={avatarUrl} name={me.full_name} size={100} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.12] bg-black/60 hover:bg-black/80 text-white/60 hover:text-white transition-all"
                    style={{ backdropFilter: "blur(8px)" }}
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2
                      className="text-2xl font-extrabold text-white truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {me.full_name || "User"}
                    </h2>
                    {/* Verified badge */}
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono flex-shrink-0"
                      style={{ background: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.25)", color: "#00e5cc" }}
                    >
                      <CheckCircle className="w-2.5 h-2.5" /> Verified
                    </span>
                  </div>
                  <p className="text-white/40 text-sm mb-4">{me.email}</p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {["Smart Interview", "AI-Powered", "v1.0"].map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/[0.08] text-white/30 bg-white/[0.02]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={forceLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-red-300 border border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/[0.12] transition-all flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </motion.button>
              </div>

              {/* Avatar feedback */}
              <AnimatePresence>
                {avatarMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 text-[11px] text-teal-400 font-mono"
                  >
                    {avatarMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* Account details */}
            <GlassCard className="p-6" accent="#6d5fff">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-purple-400" />
                <h3 className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Account Details
                </h3>
              </div>
              <InfoRow icon={Mail}     label="Email"        value={me.email}              accent="#6d5fff" />
              <InfoRow icon={User}     label="Full Name"    value={me.full_name}           accent="#a78bfa" />
              <InfoRow icon={Calendar} label="Member Since" value={joinDate}               accent="#00e5cc" />
              <InfoRow icon={BarChart3} label="User ID"     value={`#${me.id || me.user_id || "—"}`} accent="#ff4d88" />
            </GlassCard>

            {/* Performance stats */}
            <div>
              <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-4">Performance Snapshot</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatTile label="Avg Answer Score" value={avgAnswerScore} sub="out of 10"  accent="#6d5fff" max={10} />
                <StatTile label="Avg Total Score"  value={avgTotalScore}  sub="out of 10"  accent="#00e5cc" max={10} />
                <StatTile label="Avg WPM"          value={avgWpm}         sub="words/min"  accent="#a78bfa" max={200} />
                <StatTile label="Avg Comm Score"   value={avgCommScore}   sub="out of 10"  accent="#ff4d88" max={10} />
              </div>
            </div>

            {/* Communication insight */}
            {insights?.communication_metrics && (
              <GlassCard className="p-6" accent="#a78bfa">
                <div className="flex items-center gap-2 mb-5">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <h3 className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Communication Overview
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Total Fillers",     value: insights.communication_metrics.total_filler_count ?? 0,  sub: "um, uh, like…" },
                    { label: "Total Pauses",      value: insights.communication_metrics.total_pause_count ?? 0,   sub: "Estimated pauses" },
                    { label: "Avg Words/Min",     value: avgWpm,                                                   sub: "Speaking pace" },
                    { label: "Avg Comm Score",    value: avgCommScore,                                             sub: "Out of 10" },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
                      <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1.5">{label}</p>
                      <p className="text-xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                {insights.communication_analysis && (
                  <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                    <p className="text-[13px] text-white/60 leading-7">{insights.communication_analysis}</p>
                  </div>
                )}
              </GlassCard>
            )}
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}