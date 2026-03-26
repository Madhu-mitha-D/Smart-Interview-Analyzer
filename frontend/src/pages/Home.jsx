import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SplineScene from "../components/SplineScene";
import { ContainerScrollAnimation } from "../components/ui/ContainerScrollAnimation";
import OrbitModes from "../components/ui/OrbitModes";
import Footer from "../components/Footer";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const orbitItems = [
  {
    type: "video",
    src: "/videos/interview-demo.mp4",
    eyebrow: "Mock Interview",
    title: "Practice realistic rounds",
    desc: "Answer domain questions in a guided flow designed to simulate a real interview experience.",
  },
  {
    type: "video",
    src: "/videos/resume-demo.mp4",
    eyebrow: "Resume Mode",
    title: "Get personalized questions",
    desc: "Generate targeted interview questions from your skills, projects, and profile.",
  },
  {
    type: "video",
    src: "/videos/coding-demo.mp4",
    eyebrow: "Coding Mode",
    title: "Solve in a focused workspace",
    desc: "Practice interview-style coding problems in a clean, distraction-free interface.",
  },
  {
    type: "video",
    src: "/videos/analytics-demo.mp4",
    eyebrow: "Analytics",
    title: "Track progress over time",
    desc: "See score trends, patterns, and insights across repeated sessions.",
  },
];

function Counter({ to, duration = 1.8 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = to / (duration * 60);
    const interval = setInterval(() => {
      start += step;
      if (start >= to) {
        setCount(to);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isInView, to, duration]);

  return <span ref={ref}>{count}</span>;
}

function Eyebrow({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="section-eyebrow"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#6d5fff]" />
      {children}
    </motion.div>
  );
}

function WordReveal({ text, className, delay = 0 }) {
  const words = text.split(" ");
  return (
    <div className={className} style={{ overflow: "hidden" }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: "100%" }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mr-[0.28em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

function GlassCard({ children, className = "", hoverGlow = true }) {
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setGlow({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
      className={[
        "group relative overflow-hidden rounded-[28px] border border-white/[0.09]",
        "bg-gradient-to-b from-white/[0.055] to-white/[0.018]",
        "shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      {hoverGlow && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${glow.x}% ${glow.y}%, rgba(109,95,255,0.1), transparent 40%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function StatBadge({ value, label, accent = "#6d5fff" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      className="text-center"
    >
      <div
        className="mb-1 text-3xl font-black sm:text-4xl"
        style={{
          fontFamily: "var(--font-display)",
          background: `linear-gradient(135deg, #fff 0%, ${accent} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        <Counter to={value} />+
      </div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-white/38">
        {label}
      </div>
    </motion.div>
  );
}

function ModeCard({ title, desc, highlight, onClick, buttonLabel, accent }) {
  return (
    <GlassCard className="flex h-full flex-col p-6">
      <div
        className="mb-5 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
        style={{
          background: `${accent}18`,
          border: `1px solid ${accent}40`,
          color: accent,
        }}
      >
        {highlight}
      </div>
      <h3
        className="mb-3 text-xl font-bold text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="flex-1 text-sm leading-7 text-white/52">{desc}</p>
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="btn-shimmer mt-6 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        style={{
          background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
          border: `1px solid ${accent}40`,
        }}
      >
        {buttonLabel}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-3.5 w-3.5"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </motion.button>
    </GlassCard>
  );
}

function AnalyticsMockup() {
  const bars = [52, 66, 58, 78, 72, 89];

  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-white/35">
            Performance Overview
          </p>
          <h3
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Interview Progress
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-7 text-white/50">
            Track score trends, identify stronger domains, spot weak areas.
          </p>
        </div>
        <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-white/40">
          Last 4 sessions
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4 border-b border-white/[0.07] pb-6">
        {[
          { v: "8.1", l: "Avg Score" },
          { v: "Java", l: "Best Domain" },
          { v: "12", l: "Attempts" },
        ].map(({ v, l }) => (
          <div key={l}>
            <p
              className="text-2xl font-black text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {v}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/35">
              {l}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
        <div className="flex items-end gap-2">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${h * 1.3}px` }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full rounded-t-xl"
                style={{
                  background:
                    "linear-gradient(to top, rgba(109,95,255,0.9), rgba(0,229,204,0.7))",
                }}
              />
              <span className="font-mono text-[10px] text-white/30">
                S{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            label: "Strong Areas",
            content: "Java fundamentals, HR responses, speaking pace",
          },
          {
            label: "Needs Work",
            content: "DBMS depth, filler words, coding speed under time",
          },
        ].map(({ label, content }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
          >
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/35">
              {label}
            </p>
            <p className="text-sm leading-6 text-white/68">{content}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function Home() {
  const nav = useNavigate();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  const fadeUp = {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  };

  return (
    <div className="relative z-10 min-h-screen text-white">
      <section ref={heroRef} className="relative overflow-hidden pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid min-h-[calc(100vh-10rem)] items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10">
              <Eyebrow>AI Interview Workspace</Eyebrow>

              <WordReveal
                text="Practice Interviews with AI Feedback"
                className="mt-6 text-5xl font-extrabold leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="mt-6 max-w-xl text-base leading-8 text-white/52 sm:text-lg"
              >
                Simulate interview rounds, review answer quality, and improve faster with structured AI-powered feedback.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <motion.button
                  onClick={() => nav("/interview")}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-shimmer flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #6d5fff 0%, #00e5cc 100%)",
                    boxShadow: "0 0 30px rgba(109,95,255,0.4)",
                  }}
                >
                  Start Interview
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M4 8h8M8 4l4 4-4 4" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={() => nav("/dashboard")}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white/82 transition-all hover:bg-white/[0.08]"
                >
                  Open Dashboard
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.75 }}
                className="mt-8 flex flex-wrap gap-2"
              >
                {[
                  "Domain Interviews",
                  "Resume Questions",
                  "Coding Practice",
                  "Video Analysis",
                  "AI Feedback",
                ].map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.8 + i * 0.06,
                      duration: 0.35,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/50"
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.15,
              }}
              className="relative h-[380px] overflow-hidden sm:h-[500px] lg:h-[680px]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(109,95,255,0.06),transparent_60%)] blur-3xl" />
              <div className="absolute inset-x-[-8%] bottom-[-3%] top-[-1%]">
                <SplineScene scene={SCENE_URL} className="h-full w-full" />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#03030a]" />
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section {...fadeUp} className="mx-auto mb-24 max-w-7xl px-6 sm:px-8">
        <GlassCard className="px-8 py-10">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <StatBadge value={500} label="Practice Sessions" accent="#6d5fff" />
            <StatBadge value={12} label="Interview Domains" accent="#00e5cc" />
            <StatBadge value={98} label="Questions Bank" accent="#a78bfa" />
            <StatBadge value={40} label="Coding Problems" accent="#ff4d88" />
          </div>
        </GlassCard>
      </motion.section>

      <motion.section {...fadeUp} className="mx-auto mb-28 max-w-7xl px-6 sm:px-8">
        <GlassCard className="p-8 lg:p-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Overview</Eyebrow>
              <WordReveal
                text="One platform for realistic interview preparation"
                className="mt-5 text-4xl font-extrabold leading-[0.94] tracking-tight text-white sm:text-5xl"
                delay={0.05}
              />
              <p className="mt-5 max-w-md text-sm leading-7 text-white/52 sm:text-base">
                Move from guided interview practice to analytics and targeted improvement without switching tools.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "Mock interviews",
                  "Resume-based questions",
                  "Coding workspace",
                  "Progress insights",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/45"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  eyebrow: "Practice",
                  title: "Mock interviews across multiple domains",
                  desc: "Practice technical and non-technical rounds with a structured interview flow.",
                  accent: "#6d5fff",
                },
                {
                  eyebrow: "Personalization",
                  title: "Resume-based personalized questions",
                  desc: "Generate tailored questions from your skills, projects, and background.",
                  accent: "#00e5cc",
                },
                {
                  eyebrow: "Coding",
                  title: "Coding rounds with focused workspace",
                  desc: "Solve problems in an IDE-style setup built for interview preparation.",
                  accent: "#a78bfa",
                },
                {
                  eyebrow: "Improvement",
                  title: "Progress insights that guide improvement",
                  desc: "Identify patterns, weaker topics, and communication gaps across sessions.",
                  accent: "#ff4d88",
                },
              ].map(({ eyebrow, title, desc, accent }) => (
                <motion.div
                  key={eyebrow}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="group rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-md"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                    <p
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: accent }}
                    >
                      {eyebrow}
                    </p>
                  </div>
                  <h3
                    className="mb-2 text-[15px] font-bold leading-snug text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-[12.5px] leading-6 text-white/50">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.section>

      <ContainerScrollAnimation
        titleComponent={
          <div className="text-center">
            <Eyebrow>Platform Walkthrough</Eyebrow>
            <WordReveal
              text="Experience the Flow"
              className="mt-5 text-4xl font-extrabold text-white sm:text-5xl md:text-6xl"
              delay={0.05}
            />
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/48 sm:text-base">
              Move from interview setup to analysis and insights in one seamless workspace.
            </p>
          </div>
        }
      >
        <div className="relative h-full w-full overflow-hidden rounded-[22px]">
          <video
            src="/videos/main-flow.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute left-6 top-6 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Main Journey
            </p>
            <p className="mt-1 text-sm text-white/88">
              Interview setup → AI feedback
            </p>
          </div>
        </div>
      </ContainerScrollAnimation>

      <section className="mx-auto mt-24 max-w-7xl px-6 sm:px-8">
        <div className="mb-12 text-center">
          <Eyebrow>Explore More</Eyebrow>
          <WordReveal
            text="Dive Into Every Mode"
            className="mt-5 text-4xl font-extrabold text-white sm:text-5xl"
            delay={0.04}
          />
          <motion.p
            {...fadeUp}
            className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/48 sm:text-base"
          >
            Click any mode to explore the experience.
          </motion.p>
        </div>
        <OrbitModes items={orbitItems} />
      </section>

      <motion.section
        {...fadeUp}
        className="mx-auto mt-28 grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div>
          <Eyebrow>Progress Tracking</Eyebrow>
          <WordReveal
            text="Understand Where You Are Improving"
            className="mt-5 text-4xl font-extrabold leading-[0.94] text-white sm:text-5xl"
            delay={0.04}
          />
          <p className="mt-5 max-w-md text-sm leading-7 text-white/48 sm:text-base">
            Preparation becomes more effective when you can clearly see trends, strong areas, and weaknesses.
          </p>
          <div className="mt-10 space-y-7">
            {[
              {
                title: "Track scores over time",
                desc: "Review how your interview scores evolve across repeated sessions.",
              },
              {
                title: "Find weak domains faster",
                desc: "Identify topics and formats where you need more confidence or stronger depth.",
              },
              {
                title: "Improve communication",
                desc: "Use pacing, filler usage, and response quality signals to improve delivery.",
              },
            ].map(({ title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group flex gap-4"
              >
                <div
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #6d5fff44, #00e5cc33)",
                    border: "1px solid rgba(109,95,255,0.3)",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3
                    className="text-base font-bold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-7 text-white/48">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <AnalyticsMockup />
      </motion.section>

      <motion.section {...fadeUp} className="mx-auto mt-28 max-w-7xl px-6 sm:px-8">
        <div className="mb-10 text-center">
          <Eyebrow>Interview Modes</Eyebrow>
          <WordReveal
            text="Practice in the Format That Fits Your Goal"
            className="mt-5 text-4xl font-extrabold leading-[0.94] text-white sm:text-5xl"
            delay={0.04}
          />
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/48 sm:text-base">
            Each mode is built for a different preparation need.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <ModeCard
            title="Domain Interview"
            highlight="Adaptive Practice"
            accent="#6d5fff"
            desc="Practice core subjects such as HR, Java, DBMS, and AI in a guided interview flow."
            buttonLabel="Start Domain"
            onClick={() => nav("/interview/domain")}
          />
          <ModeCard
            title="Resume Interview"
            highlight="Personalized Questions"
            accent="#00e5cc"
            desc="Generate tailored questions from your resume, skills, and project experience."
            buttonLabel="Start Resume"
            onClick={() => nav("/interview/resume")}
          />
          <ModeCard
            title="Coding Interview"
            highlight="Timed Coding Rounds"
            accent="#a78bfa"
            desc="Solve interview-style programming problems in a focused coding environment."
            buttonLabel="Start Coding"
            onClick={() => nav("/interview/coding")}
          />
        </div>
      </motion.section>

      <motion.section {...fadeUp} className="mx-auto mt-24 mb-10 max-w-7xl px-6 sm:px-8">
        <GlassCard className="relative overflow-hidden px-8 py-16 text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, rgba(109,95,255,0.18) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
          <div className="relative z-10">
            <Eyebrow>Get Started</Eyebrow>
            <WordReveal
              text="Ready to Prepare with More Confidence?"
              className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold leading-[0.94] text-white sm:text-5xl"
              delay={0.04}
            />
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/48 sm:text-base">
              Practice smarter, track your growth, and walk into your next interview better prepared.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.button
                onClick={() => nav("/interview")}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-shimmer rounded-full px-8 py-4 text-sm font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #6d5fff 0%, #00e5cc 100%)",
                  boxShadow: "0 0 40px rgba(109,95,255,0.4)",
                }}
              >
                Start Now — It's Free
              </motion.button>
              <motion.button
                onClick={() => nav("/dashboard")}
                whileHover={{ scale: 1.03, y: -1 }}
                className="rounded-full border border-white/[0.12] bg-white/[0.04] px-8 py-4 text-sm font-semibold text-white/80 transition-all hover:bg-white/[0.08]"
              >
                View Dashboard
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </motion.section>

      <Footer />
    </div>
  );
}