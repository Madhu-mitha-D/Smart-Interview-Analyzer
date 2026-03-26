import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  FileText,
  Code2,
  Zap,
  Shield,
  Clock3,
  ArrowRight,
} from "lucide-react";

import { PrimaryButton, GhostButton } from "../components/Buttons";

function Surface({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-[24px] border border-white/10 bg-[#141416]/55 backdrop-blur-xl",
        "shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function HeaderChip({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
      <span className="text-[11px] font-mono uppercase tracking-widest text-white/45">
        {children}
      </span>
    </div>
  );
}

function FeaturePill({ icon: Icon, label, desc }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
        <Icon className="h-4 w-4 text-white/70" />
      </div>
      <div>
        <p className="text-[12px] font-semibold text-white/80">{label}</p>
        <p className="text-[11px] text-white/38">{desc}</p>
      </div>
    </div>
  );
}

function ModeCard({
  icon: Icon,
  title,
  tag,
  desc,
  bullets,
  buttonText,
  onClick,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <Surface className="flex h-full flex-col p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
            <Icon className="h-5 w-5 text-white/75" />
          </div>

          <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-white/50">
            {tag}
          </span>
        </div>

        <h2
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>

        <p className="mt-3 flex-1 text-sm leading-7 text-white/48">{desc}</p>

        <div className="mt-5 space-y-2">
          {bullets.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              <span className="text-[12px] text-white/58">{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={onClick}>
            <span className="inline-flex items-center gap-2">
              {buttonText}
              <ArrowRight className="h-4 w-4" />
            </span>
          </PrimaryButton>
        </div>
      </Surface>
    </motion.div>
  );
}

export default function Interview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-8">
            <HeaderChip>Interview Modes</HeaderChip>

            <h1
              className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Choose Your Interview Experience
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
              Select the format that fits your preparation goal. Practice by
              domain, generate questions from your resume, or solve coding
              problems in a focused workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <GhostButton onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </GhostButton>
            </div>
          </div>

          <div className="mb-8 grid gap-3 md:grid-cols-3">
            <FeaturePill
              icon={Zap}
              label="AI-Powered Flow"
              desc="Structured interview experience"
            />
            <FeaturePill
              icon={Shield}
              label="Practice Safely"
              desc="Improve before real interviews"
            />
            <FeaturePill
              icon={Clock3}
              label="Focused Sessions"
              desc="Quick and repeatable preparation"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ModeCard
              icon={Brain}
              title="Domain Interview"
              tag="Core Practice"
              desc="Practice subject-based interviews across HR, Java, DBMS, AI, and more with guided questions and scoring."
              bullets={[
                "Choose domain and difficulty",
                "Text, audio, or video answers",
                "AI scoring and follow-up flow",
              ]}
              buttonText="Start Domain Interview"
              onClick={() => navigate("/interview/domain")}
            />

            <ModeCard
              icon={FileText}
              title="Resume Interview"
              tag="Personalized"
              desc="Generate interview questions based on your resume, projects, and background for a more tailored preparation flow."
              bullets={[
                "Resume-based questions",
                "Project and skill-focused prompts",
                "Smooth handoff into interview flow",
              ]}
              buttonText="Start Resume Interview"
              onClick={() => navigate("/interview/resume")}
            />

            <ModeCard
              icon={Code2}
              title="Coding Interview"
              tag="Technical"
              desc="Solve coding questions in a focused coding environment designed for technical interview preparation."
              bullets={[
                "Problem-solving workflow",
                "Focused coding environment",
                "Interview-style technical practice",
              ]}
              buttonText="Start Coding Interview"
              onClick={() => navigate("/interview/coding")}
            />
          </div>
        </motion.div>
      </div>

    </div>
  );
}