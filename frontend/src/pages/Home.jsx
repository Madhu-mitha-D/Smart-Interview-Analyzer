import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SplineScene from "../components/SplineScene";
import ScrollText from "../components/ui/ScrollText";
import WordReveal from "../components/ui/WordReveal";
import { ContainerScrollAnimation } from "../components/ui/ContainerScrollAnimation";
import ShaderLinesBackground from "../components/ui/ShaderLinesBackground";
import OrbitModes from "../components/ui/OrbitModes";

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

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/68 backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}

      <ScrollText
        as="h2"
        text={title}
        className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl"
      />

      {desc && (
        <ScrollText
          as="p"
          text={desc}
          delay={0.08}
          className="mt-4 text-sm leading-7 text-white/58 sm:text-base"
        />
      )}
    </div>
  );
}

function Surface({ children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_30%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function HighlightPill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60 backdrop-blur-md">
      {children}
    </span>
  );
}

function ModeCard({ title, desc, highlight, onClick, buttonLabel }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Surface className="h-full p-6">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/58">
          {highlight}
        </div>

        <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/58">{desc}</p>

        <button
          onClick={onClick}
          className="mt-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
        >
          {buttonLabel}
        </button>
      </Surface>
    </motion.div>
  );
}

function MiniMetric({ value, label }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/42">
        {label}
      </p>
    </div>
  );
}

function AnalyticsMock() {
  return (
    <Surface className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">
            Performance Overview
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            Interview Progress
          </h3>
          <p className="mt-2 max-w-md text-sm leading-7 text-white/58">
            Track score trends, identify stronger domains, and spot weak areas
            before your actual interviews.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/58">
          Last 4 sessions
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6 border-t border-white/8 pt-8">
        <MiniMetric value="8.1" label="Avg Score" />
        <MiniMetric value="Java" label="Best Domain" />
        <MiniMetric value="12" label="Attempts" />
      </div>

      <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-5">
        <div className="flex items-end gap-3">
          {[52, 66, 58, 78, 72, 89].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-2xl bg-gradient-to-t from-violet-500/80 via-violet-300/70 to-white/90"
                style={{ height: `${h * 1.4}px` }}
              />
              <span className="text-[10px] text-white/38">S{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/42">
            Strong Areas
          </p>
          <p className="mt-3 text-sm leading-6 text-white/76">
            Java fundamentals, HR responses, speaking pace
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/42">
            Needs Improvement
          </p>
          <p className="mt-3 text-sm leading-6 text-white/76">
            DBMS depth, filler words, coding speed under time
          </p>
        </div>
      </div>
    </Surface>
  );
}

export default function Home() {
  const nav = useNavigate();

  const contentAnim = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.2 },
      transition: { duration: 0.6 },
    }),
    []
  );

  return (
    <>
      <ShaderLinesBackground />
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/72" />

      <div className="relative z-10 min-h-screen text-white">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 sm:px-8 sm:pt-28">
          <section className="relative overflow-hidden">
            <div className="grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
              <motion.div {...contentAnim} className="relative z-10 max-w-3xl">
                <SectionLabel>AI interview workspace</SectionLabel>

                <WordReveal
                  text="Practice interviews with AI feedback"
                  className="mt-6 font-display text-5xl font-semibold leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl"
                />

                <WordReveal
                  text="Simulate interview rounds, review answer quality, and improve faster with structured feedback."
                  delay={0.35}
                  className="mt-6 max-w-2xl text-base leading-8 text-white/58 sm:text-lg"
                />

                <motion.div
                  {...contentAnim}
                  transition={{ duration: 0.6, delay: 0.16 }}
                  className="mt-8 flex flex-wrap gap-3"
                >
                  <button
                    onClick={() => nav("/interview")}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
                  >
                    Start Interview
                  </button>

                  <button
                    onClick={() => nav("/dashboard")}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/92 transition hover:bg-white/[0.08]"
                  >
                    Open Dashboard
                  </button>
                </motion.div>

                <motion.div
                  {...contentAnim}
                  transition={{ duration: 0.6, delay: 0.22 }}
                  className="mt-10 flex flex-wrap gap-2"
                >
                  <HighlightPill>Domain Interviews</HighlightPill>
                  <HighlightPill>Resume Questions</HighlightPill>
                  <HighlightPill>Coding Practice</HighlightPill>
                  <HighlightPill>Video Analysis</HighlightPill>
                </motion.div>
              </motion.div>

              <motion.div
                {...contentAnim}
                transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
                className="relative h-[380px] overflow-hidden sm:h-[500px] lg:h-[640px]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.018),transparent_64%)] blur-3xl" />
                <div className="absolute inset-x-[-10%] bottom-[-4%] top-[-2%]">
                  <SplineScene scene={SCENE_URL} className="h-full w-full" />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-black" />
              </motion.div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-black/35 to-transparent" />
          </section>

          <motion.section {...contentAnim} className="relative z-10 mt-10">
            <Surface className="p-6 sm:p-8 lg:p-10">
              <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
                <div className="max-w-3xl">
                  <SectionLabel>Overview</SectionLabel>

                  <h2 className="mt-5 font-display text-4xl font-semibold leading-[0.96] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    One platform for realistic interview preparation
                  </h2>

                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                    Move from guided interview practice to analytics and
                    targeted improvement without switching tools. Everything is
                    designed to help you prepare in one focused workflow.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    <HighlightPill>Mock interviews</HighlightPill>
                    <HighlightPill>Resume-based questions</HighlightPill>
                    <HighlightPill>Coding workspace</HighlightPill>
                    <HighlightPill>Progress insights</HighlightPill>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Practice
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-white">
                      Mock interviews across multiple domains
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">
                      Practice technical and non-technical rounds with a
                      cleaner, more structured interview flow.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Personalization
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-white">
                      Resume-based personalized questions
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">
                      Generate tailored questions from your skills, projects,
                      internships, and technical background.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Coding
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-white">
                      Coding rounds with focused workspace
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">
                      Solve problems in an IDE-style setup built for interview
                      preparation and timed execution.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Improvement
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-white">
                      Progress insights that guide improvement
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">
                      Identify patterns, weaker topics, and communication gaps
                      across repeated sessions.
                    </p>
                  </div>
                </div>
              </div>
            </Surface>
          </motion.section>

          <ContainerScrollAnimation
            titleComponent={
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                  Platform walkthrough
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl md:text-6xl">
                  Experience the flow
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                  Move from interview setup to analysis and insights in one
                  seamless workspace.
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
              <div className="absolute inset-0 bg-black/38" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute left-6 top-6 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Main Journey
                </p>
                <p className="mt-1 text-sm text-white/90">
                  Interview setup to AI feedback
                </p>
              </div>
            </div>
          </ContainerScrollAnimation>

          <section className="mt-24 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-white/45">
              Explore more
            </p>

            <h2 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
              Dive into every mode
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
              Click any mode to explore the experience.
            </p>

            <div className="mt-12">
              <OrbitModes items={orbitItems} />
            </div>
          </section>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-10 sm:px-8">
          <motion.section
            {...contentAnim}
            className="mt-8 grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]"
          >
            <div>
              <SectionTitle
                eyebrow="Progress tracking"
                title="Understand where you are improving"
                desc="Preparation becomes more effective when you can clearly see trends, strong areas, and weaknesses."
              />

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Track scores over time
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/58">
                    Review how your interview scores evolve across repeated
                    sessions.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">
                    Find weak domains faster
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/58">
                    Identify topics and formats where you need more confidence
                    or stronger depth.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">
                    Improve communication
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/58">
                    Use pacing, filler usage, and response quality signals to
                    improve delivery.
                  </p>
                </div>
              </div>
            </div>

            <AnalyticsMock />
          </motion.section>

          <motion.section {...contentAnim} className="mt-28">
            <SectionTitle
              eyebrow="Interview modes"
              title="Practice in the format that fits your goal"
              desc="Each mode is built for a different preparation need."
              center
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <ModeCard
                title="Domain Interview"
                highlight="Adaptive practice"
                desc="Practice core subjects such as HR, Java, DBMS, and AI in a guided interview flow."
                buttonLabel="Start Domain"
                onClick={() => nav("/interview/domain")}
              />
              <ModeCard
                title="Resume Interview"
                highlight="Personalized questions"
                desc="Generate tailored questions from your resume, skills, and project experience."
                buttonLabel="Start Resume"
                onClick={() => nav("/interview/resume")}
              />
              <ModeCard
                title="Coding Interview"
                highlight="Timed coding rounds"
                desc="Solve interview-style programming problems in a focused coding environment."
                buttonLabel="Start Coding"
                onClick={() => nav("/interview/coding")}
              />
            </div>
          </motion.section>

          <motion.section {...contentAnim} className="mt-28 pb-10">
            <Surface className="px-6 py-12 text-center sm:px-10">
              <SectionTitle
                title="Ready to prepare with more confidence?"
                desc="Practice smarter, track your growth, and walk into your next interview better prepared."
                center
              />

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => nav("/interview")}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
                >
                  Start Now
                </button>

                <button
                  onClick={() => nav("/dashboard")}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.08]"
                >
                  Go to Dashboard
                </button>
              </div>
            </Surface>
          </motion.section>
        </div>
      </div>
    </>
  );
}