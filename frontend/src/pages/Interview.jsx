import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  Brain,
  FileText,
  Code2,
  ArrowRight,
  Sparkles,
  Layers3,
  Target,
} from "lucide-react";

function SolidGlowCard({ children, className = "", hasPersistentHover = false, glow = "violet" }) {
  const glowMap = {
    violet: {
      border: "hover:border-[#6d5fff]/40",
      g1: "bg-[#6d5fff]/35",
      g2: "bg-[#00e5cc]/18",
    },
    cyan: {
      border: "hover:border-[#00e5cc]/35",
      g1: "bg-[#00e5cc]/28",
      g2: "bg-[#6d5fff]/18",
    },
    pink: {
      border: "hover:border-[#ff4d88]/35",
      g1: "bg-[#ff4d88]/25",
      g2: "bg-[#6d5fff]/16",
    },
  };

  const current = glowMap[glow] || glowMap.violet;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.002 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={[
        "group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#09090f] transition-all duration-300",
        current.border,
        className,
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 transition-opacity duration-300",
          hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.10),transparent_34%)]" />
      </div>

      <div
        className={[
          "pointer-events-none absolute inset-0 transition-opacity duration-300",
          hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      >
        <div className={`absolute -right-20 -top-20 h-72 w-72 rounded-full ${current.g1} blur-[130px]`} />
        <div className={`absolute left-[20%] top-[20%] h-48 w-48 rounded-full ${current.g2} blur-[110px]`} />
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

const MODES = [
  {
    id: "domain",
    title: "Domain Interview",
    route: "/interview/domain",
    tag: "Recommended",
    accent: "#6d5fff",
    desc: "Practice core interview questions by domain and difficulty with guided AI flow.",
    tags: ["HR", "Java", "DBMS", "AI"],
    glow: "violet",
    icon: Brain,
  },
  {
    id: "resume",
    title: "Resume Interview",
    route: "/interview/resume",
    tag: "Personalized",
    accent: "#00e5cc",
    desc: "Generate project-based and skill-based questions from your resume.",
    tags: ["Projects", "Skills"],
    glow: "cyan",
    icon: FileText,
  },
  {
    id: "coding",
    title: "Coding Interview",
    route: "/interview/coding",
    tag: "Technical",
    accent: "#a78bfa",
    desc: "Practice coding rounds in a focused workspace built for problem solving.",
    tags: ["DSA", "Logic"],
    glow: "pink",
    icon: Code2,
  },
];

function ModeCard({ mode, onClick }) {
  const Icon = mode.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      <SolidGlowCard className="flex h-full flex-col p-6" glow={mode.glow}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: `${mode.accent}14`,
              border: `1px solid ${mode.accent}35`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: mode.accent }} />
          </div>

          <span
            className="rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{
              background: `${mode.accent}14`,
              border: `1px solid ${mode.accent}30`,
              color: mode.accent,
            }}
          >
            {mode.tag}
          </span>
        </div>

        <h3
          className="mb-3 text-2xl font-extrabold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {mode.title}
        </h3>

        <p className="flex-1 text-sm leading-7 text-white/54">{mode.desc}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {mode.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/40"
            >
              {t}
            </span>
          ))}
        </div>

        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="btn-shimmer mt-7 inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${mode.accent}, #00e5cc)`,
            boxShadow: `0 0 22px ${mode.accent}40`,
          }}
        >
          Open Workspace
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </SolidGlowCard>
    </motion.div>
  );
}

export default function Interview() {
  const nav = useNavigate();

  return (
    <div className="space-y-8 py-4">
      <SolidGlowCard className="overflow-hidden p-8 sm:p-10" hasPersistentHover glow="violet">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#6d5fff]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                Interview Workspace
              </span>
            </div>

            <h1
              className="text-5xl font-extrabold leading-[0.92] text-white sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Choose Your
              <br />
              Interview Type
            </h1>

            <p className="mt-5 max-w-md text-sm leading-8 text-white/58 sm:text-base">
              Pick the experience that matches your preparation goal. Each mode opens in a focused workspace built for that interview format.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <motion.button
                onClick={() => nav("/interview/domain")}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="btn-shimmer rounded-full px-6 py-3 text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#6d5fff,#00e5cc)",
                  boxShadow: "0 0 28px rgba(109,95,255,0.4)",
                }}
              >
                Start Domain Interview
              </motion.button>

              <motion.button
                onClick={() => nav("/dashboard")}
                whileHover={{ scale: 1.02 }}
                className="rounded-full border border-white/[0.08] bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white/78 transition-all hover:bg-white/[0.10]"
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                title: "Structured interview flow",
                desc: "Practice with a cleaner experience instead of random disconnected questions.",
                icon: Layers3,
                glow: "violet",
              },
              {
                title: "Mode-specific workspaces",
                desc: "Each interview type opens in its own tailored environment.",
                icon: Target,
                glow: "cyan",
              },
              {
                title: "Better preparation focus",
                desc: "Choose theory, resume, or coding depending on what you need most.",
                icon: Sparkles,
                glow: "pink",
              },
            ].map((item, i) => {
              const InfoIcon = item.icon;
              return (
                <SolidGlowCard key={item.title} className="p-4" glow={item.glow}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                      <InfoIcon className="h-4 w-4 text-white/60" />
                    </div>
                    <div>
                      <p className="mb-1 text-[14px] font-bold text-white">{item.title}</p>
                      <p className="text-[12px] leading-6 text-white/46">{item.desc}</p>
                    </div>
                  </div>
                </SolidGlowCard>
              );
            })}
          </div>
        </div>
      </SolidGlowCard>

      <div className="grid gap-5 lg:grid-cols-3">
        {MODES.map((mode) => (
          <ModeCard key={mode.id} mode={mode} onClick={() => nav(mode.route)} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <SolidGlowCard className="p-7" glow="violet">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6d5fff]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
              How it works
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Pick a mode",
                desc: "Choose the interview type that matches what you want to prepare for today.",
              },
              {
                n: "02",
                title: "Enter the workspace",
                desc: "Open a dedicated environment built specifically for that interview format.",
              },
              {
                n: "03",
                title: "Practice with intent",
                desc: "Focus on communication, theory, coding, or resume discussion in the right flow.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5"
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl font-mono text-[12px] font-black"
                  style={{
                    background: "rgba(109,95,255,0.15)",
                    border: "1px solid rgba(109,95,255,0.3)",
                    color: "#a78bfa",
                  }}
                >
                  {step.n}
                </div>
                <h3
                  className="mb-2 text-[14px] font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
                <p className="text-[12px] leading-6 text-white/45">{step.desc}</p>
              </div>
            ))}
          </div>
        </SolidGlowCard>

        <SolidGlowCard className="p-7" glow="cyan">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00e5cc]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
              Suggested path
            </span>
          </div>

          <h2
            className="mb-5 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A simple preparation order
          </h2>

          <div className="space-y-3">
            {[
              {
                step: "1st",
                title: "Domain Interview",
                desc: "Build confidence in fundamentals and communication first.",
                accent: "#6d5fff",
              },
              {
                step: "2nd",
                title: "Resume Interview",
                desc: "Prepare for project and skill discussions recruiters ask.",
                accent: "#00e5cc",
              },
              {
                step: "3rd",
                title: "Coding Interview",
                desc: "Strengthen technical problem solving last.",
                accent: "#a78bfa",
              },
            ].map(({ step, title, desc, accent }) => (
              <div
                key={step}
                className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-4"
              >
                <span
                  className="mt-0.5 flex-shrink-0 rounded-md px-2 py-1 font-mono text-[10px] font-black"
                  style={{ background: `${accent}18`, color: accent }}
                >
                  {step}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-white">{title}</p>
                  <p className="mt-0.5 text-[12px] leading-6 text-white/42">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SolidGlowCard>
      </div>

      <SolidGlowCard className="p-7" glow="pink">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d88]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                Quick Start
              </span>
            </div>

            <h2
              className="mb-2 text-2xl font-bold text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to begin your next session?
            </h2>
            <p className="max-w-md text-sm leading-7 text-white/48">
              Choose the mode that fits your goal and enter a workspace built for that interview experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {MODES.map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => nav(mode.route)}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-shimmer rounded-full px-5 py-2.5 text-sm font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${mode.accent}, #00e5cc)`,
                  boxShadow: `0 0 22px ${mode.accent}35`,
                }}
              >
                {mode.title.split(" ")[0]}
              </motion.button>
            ))}
          </div>
        </div>
      </SolidGlowCard>

      <Footer />
    </div>
  );
}