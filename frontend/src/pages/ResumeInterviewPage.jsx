import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ResumeInterview from "../components/ResumeInterview";
import { GhostButton } from "../components/Buttons";

function Surface({ children, className = "" }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px] border border-white/[0.09]",
        "bg-gradient-to-b from-white/[0.055] to-white/[0.018]",
        "shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,229,204,0.14),transparent)] blur-3xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function ResumeInterviewPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen px-4 py-4 text-white sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-5xl space-y-4"
      >
        <Surface className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-white/55">
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                Resume interview
              </div>

              <h1
                className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Start your resume-based interview
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                Upload your resume and generate a personalized interview based on
                your profile, projects, skills, and experience.
              </p>
            </div>

            <GhostButton onClick={() => nav("/interview")}>
              Back to Interview Modes
            </GhostButton>
          </div>
        </Surface>

        <ResumeInterview
          onStart={(resumeSession) => {
            nav(
              `/interview/domain?session_id=${encodeURIComponent(
                resumeSession.session_id
              )}`
            );
          }}
        />
      </motion.div>
    </div>
  );
}