import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SplineScene from "../components/SplineScene";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-xl">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" />
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <SectionLabel>{eyebrow}</SectionLabel> : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {desc ? (
        <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
          {desc}
        </p>
      ) : null}
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl"
    >
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/58">{desc}</p>
    </motion.div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{desc}</p>
    </div>
  );
}

function ModeCard({ title, desc, highlight, onClick, buttonLabel }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.18 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_14px_36px_rgba(0,0,0,0.24)] backdrop-blur-xl"
    >
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
        {highlight}
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/60">{desc}</p>

      <button
        onClick={onClick}
        className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
      >
        {buttonLabel}
      </button>
    </motion.div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center backdrop-blur-xl">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/55">{label}</p>
    </div>
  );
}

function HighlightPill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/58">
      {children}
    </span>
  );
}

function AnalyticsMock() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white/50">Performance Overview</p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Interview Progress
          </h3>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55">
          Last 4 sessions
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <MiniStat label="Avg Score" value="8.1" />
        <MiniStat label="Best Domain" value="Java" />
        <MiniStat label="Attempts" value="12" />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-end gap-3">
          {[52, 66, 58, 78, 72, 89].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-violet-500/70 to-white/80"
                style={{ height: `${h * 1.4}px` }}
              />
              <span className="text-[10px] text-white/40">S{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/45">Strong Areas</p>
          <p className="mt-2 text-sm text-white/75">
            Java fundamentals, HR responses, speaking pace
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/45">Needs Improvement</p>
          <p className="mt-2 text-sm text-white/75">
            DBMS depth, filler words, coding speed under time
          </p>
        </div>
      </div>
    </div>
  );
}

function HomeIntro({ done, setDone }) {
  const [target, setTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const played = sessionStorage.getItem("sia-home-intro-played");
    if (played === "1") {
      setDone(true);
      return;
    }

    const t = setTimeout(() => {
      const el = document.getElementById("navbar-brand-anchor");
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const targetCenterX = rect.left + 18;
      const targetCenterY = rect.top + 18;

      setTarget({
        x: targetCenterX - window.innerWidth / 2,
        y: targetCenterY - window.innerHeight / 2,
      });
    }, 60);

    return () => clearTimeout(t);
  }, [setDone]);

  const handleComplete = () => {
    sessionStorage.setItem("sia-home-intro-played", "1");
    setDone(true);
  };

  if (done) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#040406]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{
          x: 0,
          y: 0,
          scale: 3.2,
          opacity: 1,
        }}
        animate={{
          x: target.x,
          y: target.y,
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 1.15,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.2,
        }}
        onAnimationComplete={handleComplete}
        className="relative grid h-9 w-9 place-items-center rounded-2xl border border-white/12 bg-white/[0.07]"
      >
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.16),transparent_45%)]" />
        <span className="relative text-[11px] font-semibold tracking-[0.18em] text-white">
          SIA
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const [introDone, setIntroDone] = useState(false);

  const contentAnim = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: introDone ? 1 : 0,
        y: introDone ? 0 : 20,
      },
      transition: { duration: 0.55, ease: "easeOut", delay: introDone ? 0.08 : 0 },
    }),
    [introDone]
  );

  return (
    <div className="relative min-h-[calc(100vh-69px)] overflow-hidden bg-[#040406] text-white">
      <HomeIntro done={introDone} setDone={setIntroDone} />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(109,40,217,0.24),transparent_22%),radial-gradient(circle_at_66%_52%,rgba(255,255,255,0.08),transparent_18%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(0,0,0,0))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <section className="grid min-h-[72vh] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div {...contentAnim} className="max-w-3xl">
            <SectionLabel>AI interview workspace</SectionLabel>

            <h1 className="mt-6 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">
              Practice interviews
              <br />
              with AI-powered
              <br />
              feedback
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
              Simulate interview rounds, get answer analysis, track your
              progress, and build confidence before the real thing.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => nav("/interview")}
                className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:scale-[1.03]"
              >
                Start Interview
              </button>

              <button
                onClick={() => nav("/dashboard")}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3 text-sm text-white/90 backdrop-blur-xl transition hover:bg-white/[0.1]"
              >
                Open Dashboard
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/48">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Domain Interview
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Resume Interview
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Coding Practice
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Video Analysis
              </span>
            </div>
          </motion.div>

          <motion.div
            {...contentAnim}
            transition={{ duration: 0.6, ease: "easeOut", delay: introDone ? 0.16 : 0 }}
            className="relative h-[360px] sm:h-[480px] lg:h-[640px]"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.22),rgba(124,58,237,0.08)_34%,transparent_66%)] blur-3xl" />
            <div className="absolute inset-0">
              <SplineScene scene={SCENE_URL} className="h-full w-full" />
            </div>
          </motion.div>
        </section>

        <motion.section {...contentAnim} className="mt-8">
          <SectionTitle
            eyebrow="What this platform does"
            title="Everything you need to practice smarter"
            desc="Go beyond plain question-and-answer preparation with structured interview modes, analysis, and performance tracking."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              title="Mock Interview Practice"
              desc="Take structured interview rounds across multiple domains with a smoother question flow."
            />
            <FeatureCard
              title="Resume-Based Questions"
              desc="Upload your resume and get personalized questions based on your skills, projects, and profile."
            />
            <FeatureCard
              title="Coding Interview Workspace"
              desc="Solve timed coding problems in an IDE-style interface with cleaner problem statements and results."
            />
            <FeatureCard
              title="Insights & Analytics"
              desc="Track trends, identify weak spots, and review how your performance improves over time."
            />
          </div>
        </motion.section>

        <motion.section {...contentAnim} className="mt-20">
          <SectionTitle
            eyebrow="How it works"
            title="A simple interview preparation flow"
            desc="Start quickly, practice consistently, and use feedback to improve with each session."
            center
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StepCard
              number="1"
              title="Choose a mode"
              desc="Pick domain interview, resume interview, or coding interview based on what you want to practice."
            />
            <StepCard
              number="2"
              title="Answer confidently"
              desc="Respond using text, audio, or video depending on the interview format you want to simulate."
            />
            <StepCard
              number="3"
              title="Get evaluated"
              desc="Receive scoring, communication analysis, and detailed feedback after each round."
            />
            <StepCard
              number="4"
              title="Improve and retry"
              desc="Use insights and analytics to target weak areas and prepare better for the next attempt."
            />
          </div>
        </motion.section>

        <motion.section {...contentAnim} className="mt-20">
          <SectionTitle
            eyebrow="Interview modes"
            title="Practice in the way that suits you best"
            desc="Each interview mode is designed for a different preparation need, from communication and core theory to personalized and coding-focused rounds."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <ModeCard
              title="Domain Interview"
              highlight="Adaptive practice"
              desc="Practice domain-specific questions such as HR, Java, DBMS, and AI with a guided interview flow that feels close to a real round."
              buttonLabel="Try Domain Interview"
              onClick={() => nav("/interview/domain")}
            />
            <ModeCard
              title="Resume Interview"
              highlight="Personalized questions"
              desc="Upload your resume and generate questions based on your projects, skills, experience, and profile details."
              buttonLabel="Try Resume Interview"
              onClick={() => nav("/interview/resume")}
            />
            <ModeCard
              title="Coding Interview"
              highlight="Timed coding rounds"
              desc="Work through coding problems in a cleaner IDE-style workspace with language selection, sample cases, and result feedback."
              buttonLabel="Try Coding Interview"
              onClick={() => nav("/interview/coding")}
            />
          </div>
        </motion.section>

        <motion.section {...contentAnim} className="mt-20">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex flex-wrap gap-3">
              <HighlightPill>Adaptive question flow</HighlightPill>
              <HighlightPill>Audio answer support</HighlightPill>
              <HighlightPill>Video interview mode</HighlightPill>
              <HighlightPill>Communication analysis</HighlightPill>
              <HighlightPill>Timed coding rounds</HighlightPill>
              <HighlightPill>Resume parsing</HighlightPill>
              <HighlightPill>Insights dashboard</HighlightPill>
              <HighlightPill>Performance analytics</HighlightPill>
            </div>
          </div>
        </motion.section>

        <motion.section {...contentAnim} className="mt-20 grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionTitle
              eyebrow="Progress tracking"
              title="Understand where you are improving"
              desc="Preparation becomes much more effective when you can see trends, spot weaknesses, and focus on what matters most."
            />

            <div className="mt-8 grid gap-3">
              <FeatureCard
                title="Track scores over time"
                desc="Review how your interview scores evolve across repeated practice sessions."
              />
              <FeatureCard
                title="Find weak domains faster"
                desc="Identify topics and formats where you need more confidence or stronger depth."
              />
              <FeatureCard
                title="Improve communication"
                desc="Use speaking pace, filler usage, and response quality as signals for better interview delivery."
              />
            </div>
          </div>

          <AnalyticsMock />
        </motion.section>

        <motion.section {...contentAnim} className="mt-20">
          <SectionTitle
            eyebrow="Why use Smart Interview Analyzer"
            title="Built to help students prepare with more confidence"
            desc="The platform combines multiple interview styles in one place so you can practice more realistically and improve with purpose."
            center
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              title="Prepare before real interviews"
              desc="Reduce uncertainty by practicing structured rounds ahead of actual placement and job interviews."
            />
            <FeatureCard
              title="Build communication confidence"
              desc="Get comfortable explaining your thoughts clearly, not just knowing the answer."
            />
            <FeatureCard
              title="Improve technical depth"
              desc="Strengthen both conceptual domains and coding performance through repeated practice."
            />
            <FeatureCard
              title="Use one platform for everything"
              desc="Move from resume questions to domain rounds to coding practice without switching tools."
            />
          </div>
        </motion.section>

        <motion.section {...contentAnim} className="mt-20 pb-8">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] px-6 py-10 text-center shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-10">
            <SectionTitle
              title="Ready to start your interview preparation?"
              desc="Practice smarter, track your growth, and walk into your next interview with more confidence."
              center
            />

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => nav("/interview")}
                className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:scale-[1.03]"
              >
                Start Now
              </button>

              <button
                onClick={() => nav("/dashboard")}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3 text-sm text-white/90 transition hover:bg-white/[0.1]"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}