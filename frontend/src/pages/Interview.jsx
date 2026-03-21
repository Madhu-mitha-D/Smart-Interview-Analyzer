import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/68 backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
      {children}
    </div>
  );
}

function Surface({ children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl ${className}`}
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

function DomainIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6" />
      <path d="M10 17h6" />
    </svg>
  );
}

function CodingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="m9 8-4 4 4 4" />
      <path d="m15 8 4 4-4 4" />
      <path d="m13 5-2 14" />
    </svg>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <Surface className="h-full p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-white">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/58">{desc}</p>
    </Surface>
  );
}

function ModeCard({
  title,
  desc,
  icon,
  tags = [],
  onClick,
  primary,
}) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Surface className="group h-full p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/90">
            {icon}
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/46">
            {primary ? "Recommended" : "Practice Mode"}
          </div>
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-white/58">{desc}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/55"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={onClick}
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.10]"
        >
          Open Workspace
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </Surface>
    </motion.div>
  );
}

export default function Interview() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Surface className="overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="absolute -right-12 top-0 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <SectionLabel>Interview workspace</SectionLabel>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Choose your
                <br />
                interview type
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Pick the interview experience you want to practice. Each mode
                opens in its own dedicated workspace so you can focus on the
                kind of preparation that matters most right now.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <HighlightPill>Domain rounds</HighlightPill>
                <HighlightPill>Resume-based questions</HighlightPill>
                <HighlightPill>Coding practice</HighlightPill>
                <HighlightPill>Guided AI flow</HighlightPill>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => nav("/interview/domain")}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
                >
                  Start Domain Interview
                </button>

                <button
                  onClick={() => nav("/dashboard")}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.08]"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            <Surface className="p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                What to expect
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">Structured interview flow</p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Practice with a cleaner experience instead of random unconnected questions.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">Mode-specific workspaces</p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Each interview type opens in its own tailored environment.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">Better preparation focus</p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Choose theory, resume, or coding depending on what you need to improve.
                  </p>
                </div>
              </div>
            </Surface>
          </div>
        </Surface>

        <div className="grid gap-5 lg:grid-cols-3">
          <ModeCard
            title="Domain Interview"
            desc="Practice core interview questions by domain and difficulty with a smoother AI-guided flow that feels closer to a real technical or HR round."
            icon={<DomainIcon />}
            tags={["HR", "Java", "DBMS", "AI", "Difficulty based"]}
            primary
            onClick={() => nav("/interview/domain")}
          />

          <ModeCard
            title="Resume Interview"
            desc="Generate personalized interview questions from your resume so you can prepare for project-based, skill-based, and profile-based discussions."
            icon={<ResumeIcon />}
            tags={["Resume parsing", "Projects", "Skills", "Personalized"]}
            onClick={() => nav("/interview/resume")}
          />

          <ModeCard
            title="Coding Interview"
            desc="Work through coding questions in a focused environment designed for problem-solving, logic building, and interview-style practice."
            icon={<CodingIcon />}
            tags={["Problem solving", "Coding rounds", "Practice flow", "Technical"]}
            onClick={() => nav("/interview/coding")}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Surface className="p-6 sm:p-8">
            <SectionLabel>How it works</SectionLabel>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StepCard
                number="1"
                title="Pick a mode"
                desc="Choose the interview type that matches what you want to prepare for today."
              />
              <StepCard
                number="2"
                title="Enter the workspace"
                desc="Open a dedicated environment built specifically for that interview format."
              />
              <StepCard
                number="3"
                title="Practice with intent"
                desc="Focus on communication, theory, coding, or resume-based discussion in the right flow."
              />
            </div>
          </Surface>

          <Surface className="p-6 sm:p-8">
            <SectionLabel>Suggested path</SectionLabel>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
              A simple preparation order
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Start with Domain Interview</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Build confidence in fundamentals and communication before going deeper.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Move to Resume Interview</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Prepare for personalized project and skill discussions recruiters often ask.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Finish with Coding Interview</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Strengthen technical problem solving once your verbal flow feels more confident.
                </p>
              </div>
            </div>
          </Surface>
        </div>

        <Surface className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <SectionLabel>Quick start</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Ready to begin your next practice session?
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/58 sm:text-base">
                Choose the mode that fits your goal and enter a focused workspace
                built for that interview experience.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => nav("/interview/domain")}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
              >
                Domain
              </button>
              <button
                onClick={() => nav("/interview/resume")}
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                Resume
              </button>
              <button
                onClick={() => nav("/interview/coding")}
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                Coding
              </button>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}