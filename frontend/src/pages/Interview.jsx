import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, FileText, Code2, ArrowRight, Zap, Shield, Clock } from "lucide-react";
import Footer from "../components/Footer";

/* ── Shared card ─────────────────────────────────────────────── */
function GlowCard({ children, className = "", glow = "violet", onClick }) {
  const glows = {
    violet: { border: "rgba(109,95,255,0.35)", blob: "#6d5fff" },
    cyan:   { border: "rgba(0,229,204,0.3)",   blob: "#00e5cc" },
    pink:   { border: "rgba(255,77,136,0.3)",   blob: "#ff4d88" },
  };
  const c = glows[glow] || glows.violet;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[28px] cursor-pointer border border-white/[0.07] transition-all duration-300 hover:border-[${c.border}] ${className}`}
      style={{
        background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.015) 100%)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Hover glow blob */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle,${c.blob}30,transparent 70%)`, filter: "blur(40px)" }}
      />
      {/* Top shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      {/* Hover border */}
      <div
        className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${c.border}` }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

const MODES = [
  {
    id: "domain",
    icon: Brain,
    title: "Domain Interview",
    route: "/interview/domain",
    tag: "Recommended",
    tagColor: "#6d5fff",
    accent: "#6d5fff",
    accentBg: "rgba(109,95,255,0.12)",
    accentBorder: "rgba(109,95,255,0.3)",
    glow: "violet",
    desc: "Practice core interview questions by domain and difficulty. Get real-time AI feedback and scoring.",
    chips: ["HR & Behavioral", "Java & OOP", "DBMS", "AI & ML", "+8 more"],
    perks: ["Adaptive difficulty", "Voice responses", "Instant scoring"],
  },
  {
    id: "resume",
    icon: FileText,
    title: "Resume Interview",
    route: "/interview/resume",
    tag: "Personalized",
    tagColor: "#00e5cc",
    accent: "#00e5cc",
    accentBg: "rgba(0,229,204,0.1)",
    accentBorder: "rgba(0,229,204,0.28)",
    glow: "cyan",
    desc: "Upload your resume and get custom questions on your actual projects, skills, and experience.",
    chips: ["Project deep-dives", "Skill probing", "Experience review"],
    perks: ["Auto-parsed resume", "Context-aware Qs", "Career insights"],
  },
  {
    id: "coding",
    icon: Code2,
    title: "Coding Interview",
    route: "/interview/coding",
    tag: "Technical",
    tagColor: "#a78bfa",
    accent: "#a78bfa",
    accentBg: "rgba(167,139,250,0.1)",
    accentBorder: "rgba(167,139,250,0.28)",
    glow: "pink",
    desc: "Solve coding problems in a focused in-browser IDE. Real interview-grade challenges across all levels.",
    chips: ["Arrays & Trees", "DP & Graphs", "System Design"],
    perks: ["Live code execution", "Multi-language", "Hint system"],
  },
];

const FEATS = [
  { icon: Zap,    label: "AI-Powered",    desc: "Real-time feedback from LLMs" },
  { icon: Shield, label: "Safe Practice",  desc: "Low-stakes, high-confidence prep" },
  { icon: Clock,  label: "10-min sessions",desc: "Bite-sized, consistent growth" },
];

const stagger = {
  container: { transition: { staggerChildren: 0.1 } },
  item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Interview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-8">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }} />
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-widest">Choose your mode</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-[1.08]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Interview{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg,#6d5fff,#00e5cc)" }}
            >
              Practice
            </span>
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
            Three ways to sharpen your skills — pick a mode and start your session now.
          </p>

          {/* Mini feat row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {FEATS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(109,95,255,0.12)", border: "1px solid rgba(109,95,255,0.22)" }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white/70 leading-none">{label}</p>
                  <p className="text-[10px] text-white/35 leading-none mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Mode cards ───────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="grid gap-5 sm:grid-cols-3"
        >
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.id}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
                }}
              >
                <GlowCard glow={m.glow} onClick={() => navigate(m.route)} className="h-full flex flex-col p-6">
                  {/* Tag + icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: m.accentBg, border: `1px solid ${m.accentBorder}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: m.accent }} />
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full font-mono"
                      style={{ background: `${m.accent}18`, border: `1px solid ${m.accent}35`, color: m.accent }}
                    >
                      {m.tag}
                    </span>
                  </div>

                  <h2
                    className="text-[18px] font-extrabold text-white mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {m.title}
                  </h2>
                  <p className="text-[13px] text-white/45 leading-relaxed mb-5 flex-1">
                    {m.desc}
                  </p>

                  {/* Topic chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {m.chips.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-mono text-white/35 px-2 py-1 rounded-full border border-white/[0.08] bg-white/[0.03]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Perks */}
                  <div className="space-y-1.5 mb-5">
                    {m.perks.map((p) => (
                      <div key={p} className="flex items-center gap-2">
                        <svg viewBox="0 0 12 12" fill="none" stroke={m.accent} strokeWidth="1.8" className="w-3 h-3 flex-shrink-0">
                          <path d="m2 6 3 3 5-5" />
                        </svg>
                        <span className="text-[11.5px] text-white/50">{p}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5 rounded-2xl group-hover:opacity-100 opacity-60 transition-opacity"
                    style={{ background: m.accentBg, border: `1px solid ${m.accentBorder}` }}
                  >
                    <span className="text-[12px] font-bold" style={{ color: m.accent }}>
                      Start Session
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: m.accent }} />
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Bottom tip ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-[12px] text-white/22 font-mono">
            Sessions auto-save · Feedback available immediately · No limits
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}