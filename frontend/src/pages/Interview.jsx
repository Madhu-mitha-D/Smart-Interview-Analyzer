import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function ModeCard({ title, desc, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{desc}</p>
    </motion.button>
  );
}

export default function Interview() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(255,255,255,0.03)] sm:p-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              Interview workspace
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Choose your interview type
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
              Pick the interview experience you want to practice. Each mode opens
              in its own dedicated workspace.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <ModeCard
              title="Domain Interview"
              desc="Practice core interview questions by domain and difficulty with AI-guided flow."
              onClick={() => nav("/interview/domain")}
            />

            <ModeCard
              title="Resume Interview"
              desc="Generate interview questions from your resume and answer them in a personalized session."
              onClick={() => nav("/interview/resume")}
            />

            <ModeCard
              title="Coding Interview"
              desc="Work through coding questions in a focused environment with problem-solving flow."
              onClick={() => nav("/interview/coding")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}