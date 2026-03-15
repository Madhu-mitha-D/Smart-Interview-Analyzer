import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ResumeInterview from "../components/ResumeInterview";
import { GhostButton } from "../components/Buttons";

function Surface({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.03)]",
        className,
      ].join(" ")}
    >
      {children}
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
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                Resume interview
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start your resume-based interview
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
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