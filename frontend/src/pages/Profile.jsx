import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import {
  User,
  Mail,
  Calendar,
  Mic,
  BarChart3,
  Camera,
  LogOut,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Surface({ children, className = "" }) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-[24px] border border-white/[0.09]",
        "bg-[#141416]/55 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Bar({ value, max = 10 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full bg-white/70"
      />
    </div>
  );
}

function StatTile({ label, value, sub, max }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
      <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-white/28">
        {label}
      </p>
      <p
        className="text-2xl font-extrabold text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-white/30">{sub}</p>}
      {max != null && (
        <Bar
          value={typeof value === "string" ? parseFloat(value) || 0 : value}
          max={max}
        />
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3.5 border-b border-white/[0.05] py-3.5 last:border-0">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
        <Icon className="h-3.5 w-3.5 text-white/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/28">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[13.5px] font-semibold text-white">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function Avatar({ src, name, size = 120 }) {
  const initials = (name || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-[22px]"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))",
        border: "1.5px solid rgba(255,255,255,0.12)",
        boxShadow:
          "0 12px 36px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
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

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [me, setMe] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem("sia-profile-avatar") || ""
  );
  const [avatarMsg, setAvatarMsg] = useState("");

  const forceLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

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
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg("Max 2 MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    localStorage.setItem("sia-profile-avatar", url);
    setAvatarMsg("Avatar updated!");
    setTimeout(() => setAvatarMsg(""), 2500);
  };

  const avgAnswerScore = Number(insights?.average_answer_score ?? 0).toFixed(2);
  const avgTotalScore = Number(analytics?.average_total_score ?? 0).toFixed(2);
  const avgWpm = Number(
    insights?.communication_metrics?.avg_words_per_minute ?? 0
  ).toFixed(1);
  const avgCommScore = Number(
    insights?.communication_metrics?.avg_communication_score ?? 0
  ).toFixed(2);

  const joinDate = me?.created_at
    ? new Date(me.created_at).toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5">
            <User className="h-3.5 w-3.5 text-white/70" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-white/45">
              Profile
            </span>
          </div>

          <h1
            className="text-4xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Account
          </h1>
        </motion.div>

        {msg && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-white/75" />
            <p className="text-[13px] text-white/70">{msg}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-5">
            <div className="h-48 animate-pulse rounded-[24px] bg-white/[0.04]" />
            <div className="grid gap-4 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-[24px] bg-white/[0.04]"
                />
              ))}
            </div>
          </div>
        ) : me ? (
          <div className="space-y-6">
            <Surface className="p-6 sm:p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="relative flex-shrink-0">
                  <Avatar src={avatarUrl} name={me.full_name} size={100} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.12] bg-black/60 text-white/60 transition-all hover:bg-black/80 hover:text-white"
                    style={{ backdropFilter: "blur(8px)" }}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatar}
                    className="hidden"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h2
                      className="truncate text-2xl font-extrabold text-white"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {me.full_name || "User"}
                    </h2>

                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-white/12 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold font-mono text-white/75">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  </div>

                  <p className="mb-4 text-sm text-white/40">{me.email}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {["Smart Interview", "AI-Powered", "v1.0"].map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[10px] font-mono text-white/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={forceLogout}
                  className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[12px] font-semibold text-white/80 transition-all hover:bg-white/[0.1] hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </motion.button>
              </div>

              <AnimatePresence>
                {avatarMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 font-mono text-[11px] text-white/70"
                  >
                    {avatarMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </Surface>

            <Surface className="p-6">
              <div className="mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-white/70" />
                <h3
                  className="text-[15px] font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Account Details
                </h3>
              </div>

              <InfoRow icon={Mail} label="Email" value={me.email} />
              <InfoRow icon={User} label="Full Name" value={me.full_name} />
              <InfoRow icon={Calendar} label="Member Since" value={joinDate} />
              <InfoRow
                icon={BarChart3}
                label="User ID"
                value={`#${me.id || me.user_id || "—"}`}
              />
            </Surface>

            <div>
              <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-white/28">
                Performance Snapshot
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatTile
                  label="Avg Answer Score"
                  value={avgAnswerScore}
                  sub="out of 10"
                  max={10}
                />
                <StatTile
                  label="Avg Total Score"
                  value={avgTotalScore}
                  sub="out of 10"
                  max={10}
                />
                <StatTile
                  label="Avg WPM"
                  value={avgWpm}
                  sub="words/min"
                  max={200}
                />
                <StatTile
                  label="Avg Comm Score"
                  value={avgCommScore}
                  sub="out of 10"
                  max={10}
                />
              </div>
            </div>

            {insights?.communication_metrics && (
              <Surface className="p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-white/70" />
                  <h3
                    className="text-[15px] font-bold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Communication Overview
                  </h3>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Total Fillers",
                      value:
                        insights.communication_metrics.total_filler_count ?? 0,
                      sub: "um, uh, like…",
                    },
                    {
                      label: "Total Pauses",
                      value:
                        insights.communication_metrics.total_pause_count ?? 0,
                      sub: "Estimated pauses",
                    },
                    {
                      label: "Avg Words/Min",
                      value: avgWpm,
                      sub: "Speaking pace",
                    },
                    {
                      label: "Avg Comm Score",
                      value: avgCommScore,
                      sub: "Out of 10",
                    },
                  ].map(({ label, value, sub }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.07] bg-black/15 p-4"
                    >
                      <p className="mb-1.5 text-[10px] font-mono uppercase tracking-widest text-white/25">
                        {label}
                      </p>
                      <p
                        className="text-xl font-extrabold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {value}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/30">{sub}</p>
                    </div>
                  ))}
                </div>

                {insights.communication_analysis && (
                  <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                    <p className="text-[13px] leading-7 text-white/60">
                      {insights.communication_analysis}
                    </p>
                  </div>
                )}
              </Surface>
            )}
          </div>
        ) : null}
      </div>

    </div>
  );
}