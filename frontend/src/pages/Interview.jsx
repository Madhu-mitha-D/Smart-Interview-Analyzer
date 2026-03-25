import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const MODES = [
  {
    id: "domain", title: "Domain Interview", route: "/interview/domain",
    tag: "Recommended", accent: "#6d5fff",
    desc: "Practice core interview questions by domain and difficulty with an AI-guided flow that feels close to a real technical or HR round.",
    tags: ["HR", "Java", "DBMS", "AI", "Difficulty levels"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-6 h-6">
        <path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/>
      </svg>
    ),
  },
  {
    id: "resume", title: "Resume Interview", route: "/interview/resume",
    tag: "Personalized", accent: "#00e5cc",
    desc: "Generate personalized questions from your resume so you can prepare for project-based, skill-based, and profile discussions.",
    tags: ["Resume parsing", "Projects", "Skills", "Personalized"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-6 h-6">
        <path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6"/><path d="M10 17h6"/>
      </svg>
    ),
  },
  {
    id: "coding", title: "Coding Interview", route: "/interview/coding",
    tag: "Technical", accent: "#a78bfa",
    desc: "Work through coding questions in a focused IDE-style environment designed for problem-solving and interview-style practice.",
    tags: ["Problem solving", "Coding rounds", "Technical", "Timed"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-6 h-6">
        <path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/><path d="m13 5-2 14"/>
      </svg>
    ),
  },
];

const STEPS = [
  { n: "01", title: "Pick a mode", desc: "Choose the interview type that matches what you want to prepare for today." },
  { n: "02", title: "Enter the workspace", desc: "Open a dedicated environment built specifically for that interview format." },
  { n: "03", title: "Practice with intent", desc: "Focus on communication, theory, coding, or resume discussions in the right flow." },
];

function GlassCard({ children, className = "" }) {
  const [g, setG] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className={["group relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-gradient-to-b from-white/[0.055] to-white/[0.018] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.28)]", className].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(380px circle at ${g.x}% ${g.y}%, rgba(109,95,255,0.09), transparent 40%)` }} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

import { useState } from "react";

function ModeCard({ mode, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="p-7 h-full flex flex-col">
        {/* Icon + tag */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div
            className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `${mode.accent}18`, border: `1px solid ${mode.accent}40`, color: mode.accent }}
          >
            {mode.icon}
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full font-mono"
            style={{ background: `${mode.accent}12`, border: `1px solid ${mode.accent}30`, color: mode.accent }}
          >
            {mode.tag}
          </span>
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>{mode.title}</h3>
        <p className="text-sm leading-7 text-white/50 flex-1">{mode.desc}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {mode.tags.map(tag => (
            <span key={tag} className="text-[11px] font-mono text-white/38 px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.03]">{tag}</span>
          ))}
        </div>

        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="mt-7 group/btn flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-bold text-white btn-shimmer"
          style={{ background: `linear-gradient(135deg, ${mode.accent}dd, ${mode.accent}88)`, border: `1px solid ${mode.accent}40` }}
        >
          Open Workspace
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </motion.button>
      </GlassCard>
    </motion.div>
  );
}

export default function Interview() {
  const nav = useNavigate();

  return (
    <div className="space-y-8 py-2">
      {/* ── Hero ─────────────────────────────────────── */}
      <GlassCard className="p-8 sm:p-10 overflow-hidden">
        <div className="absolute -right-16 top-0 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(109,95,255,0.18),transparent)", filter: "blur(40px)" }} />
        <div className="absolute -left-10 bottom-0 w-44 h-44 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,229,204,0.12),transparent)", filter: "blur(40px)" }} />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="section-eyebrow mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6d5fff]" />
              Interview Workspace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[0.94] tracking-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Choose Your<br />Interview Type
            </h1>

            <p className="text-sm sm:text-base leading-8 text-white/50 max-w-md mb-7">
              Pick the experience that matches your preparation goal. Each mode opens in its own dedicated workspace.
            </p>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => nav("/interview/domain")}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-full text-sm font-bold text-white btn-shimmer"
                style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 25px rgba(109,95,255,0.35)" }}
              >
                Start Domain Interview
              </motion.button>
              <motion.button
                onClick={() => nav("/dashboard")}
                whileHover={{ scale: 1.02 }}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white/75 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] transition-all"
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>

          {/* Info panel */}
          <div className="rounded-[22px] border border-white/[0.08] bg-black/20 p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-white/35 font-mono mb-4">What to expect</p>
            {[
              { title: "Structured interview flow", desc: "Practice with a cleaner experience instead of random disconnected questions." },
              { title: "Mode-specific workspaces", desc: "Each interview type opens in its own tailored environment." },
              { title: "Better preparation focus", desc: "Choose theory, resume, or coding depending on what you need most." },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }} />
                  <p className="text-[13px] font-bold text-white">{title}</p>
                </div>
                <p className="text-[12px] leading-6 text-white/45 ml-3.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* ── Mode Cards ────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {MODES.map(mode => (
          <ModeCard key={mode.id} mode={mode} onClick={() => nav(mode.route)} />
        ))}
      </div>

      {/* ── How it works + suggested path ─────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-7">
          <div className="section-eyebrow mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6d5fff]" />
            How It Works
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black font-mono mb-4"
                  style={{ background: "rgba(109,95,255,0.15)", border: "1px solid rgba(109,95,255,0.3)", color: "#a78bfa" }}
                >
                  {n}
                </div>
                <h3 className="text-[14px] font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
                <p className="text-[12px] leading-6 text-white/45">{desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-7">
          <div className="section-eyebrow mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc]" />
            Suggested Path
          </div>
          <h2 className="text-2xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>A simple preparation order</h2>
          <div className="space-y-3">
            {[
              { step: "1st", title: "Domain Interview", desc: "Build confidence in fundamentals and communication first.", accent: "#6d5fff" },
              { step: "2nd", title: "Resume Interview", desc: "Prepare for project and skill discussions recruiters ask.", accent: "#00e5cc" },
              { step: "3rd", title: "Coding Interview", desc: "Strengthen technical problem solving last.", accent: "#a78bfa" },
            ].map(({ step, title, desc, accent }) => (
              <div key={step} className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <span className="text-[10px] font-black font-mono px-2 py-1 rounded-md flex-shrink-0 mt-0.5" style={{ background: `${accent}18`, color: accent }}>{step}</span>
                <div>
                  <p className="text-[13px] font-bold text-white">{title}</p>
                  <p className="text-[12px] leading-6 text-white/42 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Quick start CTA ──────────────────────────── */}
      <GlassCard className="p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="section-eyebrow mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6d5fff]" />
              Quick Start
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Ready to begin your next session?</h2>
            <p className="text-sm leading-7 text-white/48 max-w-md">Choose the mode that fits your goal and enter a focused workspace built for that interview experience.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {MODES.map(mode => (
              <motion.button
                key={mode.id}
                onClick={() => nav(mode.route)}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-white btn-shimmer"
                style={{ background: `linear-gradient(135deg, ${mode.accent}dd, ${mode.accent}88)`, border: `1px solid ${mode.accent}40` }}
              >
                {mode.title.split(" ")[0]}
              </motion.button>
            ))}
          </div>
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
}
